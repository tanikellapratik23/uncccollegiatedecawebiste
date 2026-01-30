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

    // Call Hugging Face Inference API with Mistral model (free)
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        headers: { Authorization: `Bearer ${hfToken}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: `You are a helpful DECA assistant. Answer this question about Collegiate DECA ICDC 2026 in Charlotte, UNC chapter: ${question}. Keep your answer concise and friendly.`,
          parameters: {
            max_new_tokens: 256,
            temperature: 0.7
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }

    const result = await response.json();
    
    // Extract the generated text from the response
    let answer = '';
    if (Array.isArray(result) && result[0] && result[0].generated_text) {
      answer = result[0].generated_text;
      // Remove the prompt from the response
      const promptEnd = answer.indexOf('Keep your answer');
      if (promptEnd !== -1) {
        answer = answer.substring(promptEnd + 'Keep your answer concise and friendly.'.length).trim();
      }
    } else {
      answer = 'I couldn\'t generate an answer. Please try again or contact our team!';
    }

    res.status(200).json({ answer });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate answer',
      details: error.message 
    });
  }
}
