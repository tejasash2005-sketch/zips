const express = require('express');
const axios = require('axios');
const router = express.Router();

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// Helper — call Groq Cloud API
async function callGroq(prompt, system = '') {
  if (!GROQ_API_KEY || GROQ_API_KEY.includes('your_groq_api_key')) {
    throw new Error('GROQ_API_KEY is missing or invalid.');
  }

  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1500,
    },
    {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return {
    text: response.data.choices[0]?.message?.content || 'No response from Groq.',
    provider: 'Groq Cloud AI (' + GROQ_MODEL + ')',
  };
}

// Helper — call local Ollama
async function callOllama(prompt, system = '') {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });

  const response = await axios.post(
    `${OLLAMA_URL}/api/chat`,
    {
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 1000,
      }
    },
    { timeout: 120000 }
  );

  return {
    text: response.data.message?.content || 'No response from local model.',
    provider: 'Local Ollama (' + OLLAMA_MODEL + ')',
  };
}

// Unified Call Function with auto fallback
async function generateAI(prompt, system = '', preferredProvider = 'auto') {
  let errors = [];

  // If preference is groq or auto, try Groq first
  if (preferredProvider === 'groq' || preferredProvider === 'auto') {
    try {
      if (GROQ_API_KEY && !GROQ_API_KEY.includes('your_groq_api_key')) {
        console.log(`⚡ Calling Groq API (${GROQ_MODEL})...`);
        const result = await callGroq(prompt, system);
        return result;
      }
    } catch (err) {
      console.warn('⚠️ Groq API failed, attempting Ollama fallback:', err.message);
      errors.push(`Groq: ${err.message}`);
    }
  }

  // Fallback to Ollama
  if (preferredProvider === 'ollama' || preferredProvider === 'auto') {
    try {
      console.log(`🦙 Calling Ollama (${OLLAMA_MODEL})...`);
      const result = await callOllama(prompt, system);
      return result;
    } catch (err) {
      console.warn('⚠️ Ollama failed:', err.message);
      errors.push(`Ollama: ${err.message}`);
    }
  }

  throw new Error(`AI Request Failed. Errors: ${errors.join(' | ')}`);
}

// POST /api/ai/chat — Main AI Chat Endpoint
router.post('/chat', async (req, res) => {
  const { prompt, system, provider } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    console.log(`🤖 AI Query: "${prompt.slice(0, 60)}..."`);
    const result = await generateAI(prompt, system, provider || 'auto');
    console.log(`✅ Responded via ${result.provider} (${result.text.length} chars)`);
    res.json({
      response: result.text,
      provider: result.provider,
    });
  } catch (err) {
    console.error('💥 AI Service Error:', err.message);
    res.status(500).json({
      error: 'AI service unavailable. Please check your GROQ_API_KEY or ensure Ollama is running.',
      details: err.message,
    });
  }
});

// GET /api/ai/status — Check health of Groq & Ollama
router.get('/status', async (req, res) => {
  let groqStatus = 'unconfigured';
  let ollamaStatus = 'offline';
  let activeProvider = 'none';

  // Check Groq
  if (GROQ_API_KEY && !GROQ_API_KEY.includes('your_groq_api_key')) {
    groqStatus = 'ready (Key set)';
    activeProvider = 'Groq Cloud API (' + GROQ_MODEL + ')';
  }

  // Check Ollama
  let models = [];
  try {
    const { data } = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 2000 });
    models = data.models?.map(m => m.name) || [];
    ollamaStatus = 'online';
    if (activeProvider === 'none') {
      activeProvider = 'Local Ollama (' + OLLAMA_MODEL + ')';
    }
  } catch {
    ollamaStatus = 'offline';
  }

  res.json({
    activeProvider,
    groq: {
      status: groqStatus,
      model: GROQ_MODEL,
    },
    ollama: {
      status: ollamaStatus,
      model: OLLAMA_MODEL,
      availableModels: models,
    }
  });
});

// POST /api/ai/stream — SSE streaming
router.post('/stream', async (req, res) => {
  const { prompt, system } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const result = await generateAI(prompt, system, 'auto');
    res.write(`data: ${JSON.stringify({ token: result.text })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

module.exports = router;