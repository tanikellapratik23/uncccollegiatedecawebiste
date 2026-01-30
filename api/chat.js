export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;
  
  if (!question) {
    return res.status(400).json({ error: 'No question provided' });
  }

  try {
    // Use the HF_TOKEN from environment variable (set in Vercel)
    const hfToken = process.env.HF_TOKEN;
    
    if (!hfToken) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Try primary model, then a fallback model if needed
    const models = [
      'mistralai/Mistral-7B-Instruct-v0.1',
      'gpt2'
    ];

    let finalAnswer = null;
    let lastError = null;

    for (const model of models) {
      try {
        const url = `https://api-inference.huggingface.co/models/${model}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${hfToken}` },
          method: 'POST',
          body: JSON.stringify({
            inputs: `You are a helpful DECA assistant. Answer this question about Collegiate DECA ICDC 2026: ${question}`,
            parameters: { max_new_tokens: 256, temperature: 0.7 }
          }),
        });

        const status = response.status;
        const body = await response.json().catch(() => ({}));

        if (response.ok) {
          // HF inference may return {generated_text: '...'} or [{generated_text: '...'}]
          if (body.generated_text) {
            finalAnswer = String(body.generated_text).trim();
          } else if (Array.isArray(body) && body[0] && body[0].generated_text) {
            finalAnswer = String(body[0].generated_text).trim();
          } else if (body && typeof body === 'object') {
            // Some models return text in other fields; try to stringify
            finalAnswer = JSON.stringify(body);
          }
        } else {
          lastError = `Model ${model} returned status ${status} - ${body.error || JSON.stringify(body)}`;
          // If model is not available (410) or access denied (403), try next model
          if (status === 410 || status === 404 || status === 403) {
            continue;
          }
        }

        if (finalAnswer) break;
      } catch (err) {
        lastError = err.message || String(err);
        continue;
      }
    }

    if (!finalAnswer) {
      // Graceful fallback: inform client AI unavailable so frontend can use knowledge base
      console.error('HF inference failed:', lastError);
      finalAnswer = null; // indicate failure to caller
      return res.status(502).json({ error: 'AI service unavailable', details: lastError });
    }

    // Clean up answer if it includes prompt text
    const promptMarker = 'You are a helpful DECA assistant.';
    if (finalAnswer && finalAnswer.includes(promptMarker)) {
      const idx = finalAnswer.indexOf(promptMarker);
      finalAnswer = finalAnswer.substring(idx + promptMarker.length).trim();
    }

    res.status(200).json({ answer: finalAnswer });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate answer',
      details: error.message 
    });
  }
}
