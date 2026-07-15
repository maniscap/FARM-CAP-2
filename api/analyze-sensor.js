import { GoogleGenAI } from '@google/genai';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin if it hasn't been initialized yet
if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
  });
}

const db = getDatabase();
const messaging = getMessaging();

export default async function handler(req, res) {
  // This endpoint can be triggered by a GET request (e.g. from cron-job.org)
  
  try {
    // 1. Fetch latest sensor data from Firebase
    const sensorSnapshot = await db.ref('sensor_data').once('value');
    const sensorData = sensorSnapshot.val();

    if (!sensorData) {
      return res.status(404).json({ error: 'No sensor data found' });
    }

    // 2. Fetch Live Weather Data
    let weatherContext = "Weather forecast unavailable.";
    try {
      const wxRes = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${process.env.VITE_WEATHER_API_KEY}&q=Visakhapatnam&days=1`);
      if (wxRes.ok) {
        const wxData = await wxRes.json();
        weatherContext = `Current Weather: ${wxData.current.temp_c}°C, ${wxData.current.condition.text}. Precipitation: ${wxData.current.precip_mm}mm.
Forecast Today: ${wxData.forecast?.forecastday?.[0]?.day?.condition?.text}, Chance of Rain: ${wxData.forecast?.forecastday?.[0]?.day?.daily_chance_of_rain}%`;
      }
    } catch (e) {
      console.warn("Could not fetch weather data:", e.message);
    }

    // 3. Prompt Gemini
    const prompt = `
      You are an expert farm AI assistant.
      
      Here is the current live sensor data from the farm:
      Temperature: ${sensorData.temperature}°C
      Humidity: ${sensorData.humidity}%
      Soil Moisture: ${sensorData.soilMoisture}%

      Here is the live weather forecast for the farm:
      ${weatherContext}
      
      Analyze these conditions. Is the crop at immediate risk? 
      CRITICAL RULE: Consider both the soil moisture AND the upcoming weather before recommending irrigation. If the soil is dry but there is a high chance of rain today, DO NOT recommend turning on the pump unless soil moisture is critically below 15%.
      
      Respond strictly in JSON format like this:
      {
        "alertNeeded": true/false,
        "reason": "Soil moisture is critically low at 20%, and no rain is expected today.",
        "actionRecommendation": "Turn on the irrigation pump immediately."
      }
    `;

    let aiResult = null;
    let usedModel = 'gemini-2.5-flash';

    try {
      // 1st Attempt: Gemini 2.5 Flash
      console.log("Attempting Gemini AI...");
      const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      aiResult = JSON.parse(response.text);
    } catch (geminiError) {
      console.warn("Gemini Failed. Falling back to Groq LLaMA 3...", geminiError.message);
      
      try {
        // 2nd Attempt: Groq (LLaMA 3)
        usedModel = 'groq-llama3';
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.VITE_GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
          })
        });
        
        if (!groqRes.ok) throw new Error("Groq API Error");
        const groqData = await groqRes.json();
        aiResult = JSON.parse(groqData.choices[0].message.content);
        
      } catch (groqError) {
        console.warn("Groq Failed. Falling back to OpenRouter...", groqError.message);
        
        // 3rd Attempt: OpenRouter (Gemma 2 9B Free)
        usedModel = 'openrouter-gemma2';
        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "google/gemma-2-9b-it:free",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
          })
        });
        
        if (!orRes.ok) throw new Error("OpenRouter API Error");
        const orData = await orRes.json();
        aiResult = JSON.parse(orData.choices[0].message.content);
      }
    }

    if (!aiResult) {
      throw new Error("All AI Fallbacks Failed!");
    }

    // 4. Save insight to database
    await db.ref('ai_insights/latest').set({
      timestamp: Date.now(),
      analysis: aiResult,
      model_used: usedModel
    });

    // 5. Send Push Notification if an alert is needed
    if (aiResult.alertNeeded) {
      try {
        // Save to sensor alerts for Notifications feed
        await db.ref('sensor_alerts').push({
          timestamp: Date.now(),
          description: aiResult.reason,
          recommendation: aiResult.actionRecommendation,
          threatLevel: 10 // Treat sensor criticals as high priority
        });

        await messaging.send({
          topic: 'farm_alerts',
          notification: {
            title: '⚠️ Farm Condition Alert',
            body: aiResult.reason,
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
            type: 'sensor_alert',
            recommendation: aiResult.actionRecommendation
          }
        });
        console.log("Sensor push notification sent!");
      } catch (fcmError) {
        console.error("FCM Error:", fcmError);
      }
    }

    return res.status(200).json({ success: true, result: aiResult });

  } catch (error) {
    console.error("Error analyzing sensor data:", error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
