import { GoogleGenAI } from '@google/genai';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin if it hasn't been initialized yet
export const maxDuration = 60; // Max allowed on Vercel Hobby tier to prevent 504 Timeouts

if (getApps().length === 0) {
  // We use the environment variables stored in Vercel to connect to the database
  initializeApp({
    // In production on Vercel, to use Firebase Admin securely, you usually need a Service Account Key.
    // However, to keep this simple for the university project without generating new keys,
    // we initialize with the databaseURL.
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
  });
}

const db = getDatabase();
const messaging = getMessaging();

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
      // 1st Attempt: Gemini 2.0 Flash (Vision - fastest and most reliable)
      const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      console.log("Attempting Gemini AI...");
      console.log("API Key present:", !!geminiKey);
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
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
      console.log("✅ Gemini AI succeeded!", JSON.stringify(aiResult));
    } catch (geminiError) {
      console.error("❌ Gemini Failed:", geminiError.message, geminiError.status || '', geminiError.code || '');
      
      try {
        // 2nd Attempt: OpenRouter (Llama 3.2 11B Vision Free)
        usedModel = 'openrouter-llama3.2-vision';
        const orKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
        console.log("Attempting OpenRouter...");
        console.log("OR Key present:", !!orKey);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout for OpenRouter
        
        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Authorization": `Bearer ${orKey}`,
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
        
        clearTimeout(timeoutId);
        
        const orText = await orRes.text();
        console.log("OpenRouter status:", orRes.status, "body:", orText.substring(0, 500));
        if (!orRes.ok) throw new Error(`OpenRouter API Error: ${orRes.status} - ${orText.substring(0, 200)}`);
        const orData = JSON.parse(orText);
        aiResult = JSON.parse(orData.choices[0].message.content);
        console.log("✅ OpenRouter succeeded!", JSON.stringify(aiResult));
      } catch (orError) {
        console.error("❌ OpenRouter Failed:", orError.message);
      }
    }

    if (!aiResult) {
      // ⚠️ FALLBACK: If AI fails, still send the image to the phone!
      console.error("All AI Vision Fallbacks Failed! Sending image to phone anyway.");
      aiResult = {
        threatDetected: true,
        threatLevel: 6, // Level 6 triggers the Firebase push notification below
        description: "⚠️ Motion detected, but the AI failed to analyze the image (Check Vercel API Keys)."
      };
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
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              defaultVibrateTimings: true,
              defaultSound: true,
              channelId: 'high_priority_alerts'
            }
          },
          apns: {
            payload: {
              aps: {
                sound: 'default',
                'interruption-level': 'time-sensitive'
              }
            }
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
