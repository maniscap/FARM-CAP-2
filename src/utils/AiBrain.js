export const generateImage = async (prompt) => {
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!GEMINI_KEY) throw new Error("Gemini API Key is missing");
  throw new Error("Image generation directly via API key on frontend requires Imagen 3 access.");
};

const cleanBase64 = (base64String) => {
  if (!base64String) return null;
  return base64String.replace(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/, '');
};

export const fetchChatCompletion = async ({ model, text, rBase64, mType, systemInstruction, signal }) => {
  const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
  const HF_KEY = import.meta.env.VITE_HF_API_KEY;

  const requiresVision = !!rBase64;
  const cleanedImage = cleanBase64(rBase64);
  const imageBase64DataUrl = rBase64 && mType ? `data:${mType};base64,${rBase64}` : null;
  
  let resultText = '';

  if (model?.provider === 'gemini') {
    if (!GEMINI_KEY) throw new Error('Gemini Key Missing');
    
    const userParts = [{ text: text }];
    if (requiresVision) {
      userParts.push({ inlineData: { mimeType: mType || 'image/jpeg', data: cleanedImage } });
    }

    const reqBody = {
      contents: [{ role: 'user', parts: userParts }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { maxOutputTokens: 8192, temperature: 0.7 }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.id)}:generateContent?key=${GEMINI_KEY}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reqBody), signal }
    );
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gemini API Error');
    resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  } else if (model?.provider === 'groq' || model?.provider === 'openrouter') {
    const apiKey = model.provider === 'groq' ? GROQ_KEY : OPENROUTER_KEY;
    if (!apiKey) throw new Error(`${model.provider} Key Missing`);

    const url = model.provider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://openrouter.ai/api/v1/chat/completions';

    let messages = [{ role: 'system', content: systemInstruction }];
    
    if (requiresVision) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: text },
          { type: 'image_url', image_url: { url: imageBase64DataUrl } }
        ]
      });
    } else {
      messages.push({ role: 'user', content: text });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: model.id, messages, temperature: 0.7, max_tokens: 8192 }),
      signal
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `${model.provider} API Error`);
    resultText = data.choices?.[0]?.message?.content || '';

  } else if (model?.provider === 'hf') {
    if (!HF_KEY) throw new Error('HuggingFace Key Missing');
    
    // Simplistic HuggingFace fallback for text/vision
    const isVisionModel = model.vision;
    let response;
    
    if (isVisionModel && requiresVision) {
      // Basic image classification endpoint logic (HF Inference API)
      // (This is a naive implementation assuming the model accepts image bytes directly)
      const byteCharacters = atob(cleanedImage);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      response = await fetch(`https://api-inference.huggingface.co/models/${model.id}`, {
        headers: { Authorization: `Bearer ${HF_KEY}` },
        method: "POST",
        body: byteArray,
        signal
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'HF Vision Error');
      
      // Usually returns an array of classification labels
      if (Array.isArray(data) && data[0]?.label) {
        resultText = data.map(d => `${d.label} (${(d.score*100).toFixed(1)}%)`).join(', ');
      } else {
        resultText = JSON.stringify(data);
      }
    } else {
      // Text generation
      response = await fetch(`https://api-inference.huggingface.co/models/${model.id}`, {
        headers: { Authorization: `Bearer ${HF_KEY}`, 'Content-Type': 'application/json' },
        method: "POST",
        body: JSON.stringify({ inputs: `${systemInstruction}\nUser: ${text}\nAssistant:` }),
        signal
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'HF Text Error');
      resultText = data[0]?.generated_text || '';
    }
  } else {
    throw new Error('Unknown model provider: ' + model?.provider);
  }

  return resultText;
};
