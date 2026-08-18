import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, push, set, update } from 'firebase/database';

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

  const { imageUrl, alertId } = req.body;

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
      // 1st Attempt: Gemini 2.5 Flash via direct REST API
      const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      console.log("Attempting Gemini 2.5 Flash AI...");
      
      const geminiController = new AbortController();
      const geminiTimeout = setTimeout(() => geminiController.abort(), 12000);

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        signal: geminiController.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: prompt },
            { inline_data: { mime_type: imageResponse.headers.get('content-type') || 'image/jpeg', data: base64Image } }
          ]}],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      
      clearTimeout(geminiTimeout);
      const geminiData = await geminiRes.json();
      if (!geminiRes.ok) throw new Error(geminiData.error?.message || "Gemini HTTP Error");
      
      const rawText = geminiData.candidates[0].content.parts[0].text;
      aiResult = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
      usedModel = 'gemini-2.5-flash';
      console.log("✅ Gemini AI succeeded!");
    } catch (geminiError) {
      console.error("❌ Gemini 2.5 Flash Failed:", geminiError.message);
      
      try {
        // 2nd Attempt: Gemini 2.5 Flash Lite
        const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        console.log("Attempting Gemini 2.5 Flash Lite...");
        
        const liteController = new AbortController();
        const liteTimeout = setTimeout(() => liteController.abort(), 12000);

        const liteRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`, {
          method: "POST",
          signal: liteController.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [
              { text: prompt },
              { inline_data: { mime_type: imageResponse.headers.get('content-type') || 'image/jpeg', data: base64Image } }
            ]}],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        clearTimeout(liteTimeout);
        const liteData = await liteRes.json();
        if (!liteRes.ok) throw new Error(liteData.error?.message || "Gemini Lite HTTP Error");

        const rawText = liteData.candidates[0].content.parts[0].text;
        aiResult = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
        usedModel = 'gemini-2.5-flash-lite';
        console.log("✅ Gemini Lite succeeded!");
      } catch (liteError) {
        console.error("❌ Gemini Lite Failed:", liteError.message);
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

    // 4. Save EVERY detection to Firebase (so all images show in the app)
    console.log("Saving report to Firebase...");
    if (alertId) {
      const targetRef = ref(db, `security_alerts/${alertId}`);
      await update(targetRef, {
        threatDetected: aiResult.threatDetected,
        threatLevel: aiResult.threatLevel,
        description: aiResult.description,
        modelUsed: usedModel
      });
    } else {
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
    }

    // Return the result
    return res.status(200).json({ success: true, result: aiResult });

  } catch (error) {
    console.error("Error analyzing security image:", error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
