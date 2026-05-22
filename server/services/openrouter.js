const fetch = require('node-fetch');
require('dotenv').config();

const DEFAULT_SYSTEM_PROMPT = 'You are an expert carbon credit analyst with deep knowledge of voluntary carbon markets, UNFCCC methodologies, Gold Standard, and VCS certification frameworks.';

async function callOpenRouter(prompt, systemPrompt = DEFAULT_SYSTEM_PROMPT, maxTokens = 2000) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Carbon Credit Marketplace'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.4
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || 'OpenRouter API error');
  }
  if (!data.choices || !data.choices[0]) {
    throw new Error('Invalid response from OpenRouter API');
  }
  return data.choices[0].message.content;
}

// 3-strategy parser: direct parse → first balanced object → fenced ```json block
function parseJsonResponse(rawContent) {
  if (rawContent === null || rawContent === undefined) return { summary: '' };
  if (typeof rawContent === 'object') return rawContent;
  const text = String(rawContent).trim();

  // Strategy 1: direct parse
  try { return JSON.parse(text); } catch (_) { /* fall through */ }

  // Strategy 2: first balanced JSON object
  try {
    const start = text.indexOf('{');
    if (start !== -1) {
      let depth = 0;
      let inStr = false;
      let escape = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\') { escape = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) {
            return JSON.parse(text.slice(start, i + 1));
          }
        }
      }
    }
  } catch (_) { /* fall through */ }

  // Strategy 3: fenced ```json ... ``` block
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) {
      return JSON.parse(fenced[1].trim());
    }
  } catch (_) { /* fall through */ }

  return { summary: text };
}

module.exports = { callOpenRouter, parseJsonResponse };
