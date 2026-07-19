import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';

// Initialize Firebase Client (Not Admin, to avoid Service Account requirements in Vercel)
if (getApps().length === 0) {
  initializeApp({
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
  });
}

const db = getDatabase();

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
      // 1st Attempt: Gemini 2.0 Flash (Vision) via Raw REST API (to support AbortController)
      const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      console.log("Attempting Gemini AI...");
      console.log("API Key present:", !!geminiKey);
      
      const geminiController = new AbortController();
      const geminiTimeout = setTimeout(() => geminiController.abort(), 10000); // Strict 10s kill switch

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        signal: geminiController.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: imageResponse.headers.get('content-type') || 'image/jpeg', data: base64Image } }
            ]
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      
      clearTimeout(geminiTimeout);

      const geminiData = await geminiRes.json();
      if (!geminiRes.ok) throw new Error(geminiData.error?.message || "Gemini HTTP Error");
      
      // Parse the JSON block returned inside the text response
      const rawText = geminiData.candidates[0].content.parts[0].text;
      aiResult = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
      console.log("✅ Gemini AI succeeded!");
    } catch (geminiError) {
      console.error("❌ Gemini Failed:", geminiError.message, geminiError.status || '', geminiError.code || '');
      
      try {
        // 2nd Attempt: OpenRouter (Llama 3.2 11B Vision Free)
        usedModel = 'openrouter-llama3.2-vision';
        const orKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
        console.log("Attempting OpenRouter...");
        console.log("OR Key present:", !!orKey);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout for OpenRouter
        
        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Authorization": `Bearer ${orKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-free",
            messages: [{ 
              role: "user", 
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageUrl } }
              ] 
            }]
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

    // 4. If a threat is detected, save to Firebase
    if (aiResult.threatDetected && aiResult.threatLevel > 5) {
      console.log("Saving report to Firebase...");
      // Using standard Firebase SDK push/set instead of Admin SDK
      const reportsRef = ref(db, 'security_alerts');
      const newReportRef = push(reportsRef);
      await set(newReportRef, {
        timestamp: new Date().toISOString(),
        imageUrl: imageUrl,
        threatDetected: aiResult.threatDetected,
        threatLevel: aiResult.threatLevel,
        description: aiResult.description,
        modelUsed: usedModel
      });

      /* (Push notifications via Admin SDK removed to fix credentials issue on Vercel)
      if (aiResult.threatDetected) {
        // ... (removed)
      }
      */
    }

    // Return the result
    return res.status(200).json({ success: true, result: aiResult });

  } catch (error) {
    console.error("Error analyzing security image:", error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
