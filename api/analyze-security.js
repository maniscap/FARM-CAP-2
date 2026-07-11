import { GoogleGenAI } from '@google/genai';
import admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized yet
if (!admin.apps.length) {
  // We use the environment variables stored in Vercel to connect to the database
  admin.initializeApp({
    // In production on Vercel, to use Firebase Admin securely, you usually need a Service Account Key.
    // However, to keep this simple for the university project without generating new keys,
    // we initialize with the databaseURL.
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
  });
}

const db = admin.database();
const messaging = admin.messaging();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing imageUrl in request body' });
  }

  try {
    // 1. Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });

    // 2. We need to fetch the image from the URL to send it to Gemini
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // 3. Prompt Gemini Vision
    const prompt = `
      You are an expert farm security AI monitoring a camera feed. 
      Analyze this image (or video frame) from the security camera. 
      
      CRITICAL THREAT CLASSIFICATION RULES:
      - If you see small animals (dogs, cats, birds), classify the threat as LOW (level 1-3). No panic needed.
      - If you see humans, especially groups of 2-4 people, or unrecognized vehicles at night, classify the threat as CRITICAL (level 8-10).
      - If the scene is empty or normal, threat level is 0.

      Respond strictly in JSON format like this:
      {
        "threatDetected": true/false,
        "threatLevel": 8,
        "description": "I see a group of 4 people near the crops."
      }
    `;

    let aiResult = null;
    let usedModel = 'gemini-2.5-pro';

    try {
      // 1st Attempt: Gemini 2.5 Pro (Vision)
      console.log("Attempting Gemini AI...");
      const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: imageResponse.headers.get('content-type') || 'image/jpeg',
            }
          }
        ],
        config: { responseMimeType: "application/json" }
      });
      aiResult = JSON.parse(response.text);
    } catch (geminiError) {
      console.warn("Gemini Failed. Falling back to OpenRouter Vision...", geminiError.message);
      
      try {
        // 2nd Attempt: OpenRouter (Llama 3.2 11B Vision Free)
        usedModel = 'openrouter-llama3.2-vision';
        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3.2-11b-vision-instruct:free",
            messages: [{ 
              role: "user", 
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageUrl } }
              ] 
            }],
            response_format: { type: "json_object" }
          })
        });
        
        if (!orRes.ok) throw new Error("OpenRouter API Error");
        const orData = await orRes.json();
        aiResult = JSON.parse(orData.choices[0].message.content);
      } catch (orError) {
        console.warn("OpenRouter Failed too.", orError.message);
      }
    }

    if (!aiResult) {
      throw new Error("All AI Vision Fallbacks Failed!");
    }

    // 4. If a threat is detected, save to Firebase and send Push Notification
    if (aiResult.threatDetected && aiResult.threatLevel > 5) {
      const alertData = {
        timestamp: Date.now(),
        imageUrl: imageUrl,
        description: aiResult.description,
        threatLevel: aiResult.threatLevel,
        status: 'UNRESOLVED'
      };

      // Save to Realtime Database
      await db.ref('security_alerts').push(alertData);

      // Send Push Notification (FCM) to the topic 'security_alerts'
      try {
        await messaging.send({
          topic: 'security_alerts',
          notification: {
            title: '🚨 INTRUDER DETECTED',
            body: aiResult.description,
          },
          data: {
            type: 'security_alert',
            imageUrl: imageUrl
          }
        });
        console.log("Push notification sent!");
      } catch (fcmError) {
        console.error("FCM Error (User might not have topics configured yet):", fcmError);
      }
    }

    // Return the result
    return res.status(200).json({ success: true, result: aiResult });

  } catch (error) {
    console.error("Error analyzing security image:", error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
