import axios from 'axios';
import { config } from '../config/index.js';

const LLM_TIMEOUT_MS = 35_000;

const STRICT_SCHEMA = `You must respond with ONLY valid JSON matching this shape (no markdown):
{
  "intent": "",
  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "medical_summary": "",
  "possible_concerns": [],
  "suggested_response": "",
  "recommended_action": "",
  "rag_context_used": "",
  "emergency_triggered": false,
  "telegram_alert": "",
  "confidence_score": 0.0,
  "why_this_risk": ""
}`;

function safeParseJson(text) {
  try {
    const cleaned = text.replace(/```json|```/gi, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('no json');
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normalizeEnvelope(raw, fallbackIntent) {
  const base = {
    intent: String(raw?.intent || fallbackIntent || 'general'),
    risk_level: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(String(raw?.risk_level || '').toUpperCase())
      ? String(raw.risk_level).toUpperCase()
      : 'MEDIUM',
    medical_summary: String(raw?.medical_summary || ''),
    possible_concerns: Array.isArray(raw?.possible_concerns) ? raw.possible_concerns.map(String) : [],
    suggested_response: String(raw?.suggested_response || ''),
    recommended_action: String(raw?.recommended_action || ''),
    rag_context_used: String(raw?.rag_context_used || ''),
    emergency_triggered: Boolean(raw?.emergency_triggered),
    telegram_alert: String(raw?.telegram_alert || ''),
    confidence_score: typeof raw?.confidence_score === 'number' ? Math.min(1, Math.max(0, raw.confidence_score)) : 0.65,
    why_this_risk: String(raw?.why_this_risk || ''),
  };
  if (base.risk_level === 'CRITICAL' || base.risk_level === 'HIGH') base.emergency_triggered = true;
  return base;
}

function formatProviderError(label, err) {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const body = err.response?.data;
    let detail = err.message;
    if (body && typeof body === 'object') {
      detail =
        body?.error?.message ||
        (typeof body.error === 'string' ? body.error : null) ||
        body?.message ||
        JSON.stringify(body).slice(0, 180);
    }
    if (err.code === 'ECONNABORTED') detail = `timeout of ${LLM_TIMEOUT_MS}ms exceeded`;
    return `${label}${status ? ` ${status}` : ''}: ${detail}`;
  }
  return `${label}: ${err?.message || String(err)}`;
}

async function chatCompletion(url, headers, body) {
  try {
    const { data } = await axios.post(url, body, { headers, timeout: LLM_TIMEOUT_MS });
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 400 && body.response_format) {
      const { response_format: _rf, ...rest } = body;
      const { data } = await axios.post(url, rest, { headers, timeout: LLM_TIMEOUT_MS });
      return data;
    }
    throw err;
  }
}

async function callOpenRouter(messages) {
  if (!config.openrouter.key) throw new Error('no openrouter');
  const headers = {
    Authorization: `Bearer ${config.openrouter.key}`,
    'HTTP-Referer': config.frontendUrl,
    'X-Title': 'AEGIS AI Healthcare OS',
    'Content-Type': 'application/json',
  };
  const data = await chatCompletion(
    'https://openrouter.ai/api/v1/chat/completions',
    headers,
    {
      model: config.openrouter.model,
      messages,
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    }
  );
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter empty response');
  return text;
}

async function callGroq(messages) {
  if (!config.groq.key) throw new Error('no groq');
  const headers = {
    Authorization: `Bearer ${config.groq.key}`,
    'Content-Type': 'application/json',
  };
  const data = await chatCompletion(
    'https://api.groq.com/openai/v1/chat/completions',
    headers,
    {
      model: config.groq.model,
      messages,
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    }
  );
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq empty response');
  return text;
}

/** Hugging Face Inference Providers — OpenAI-compatible chat API */
async function callHF(messages) {
  if (!config.hf.key) throw new Error('no hf');
  const { data } = await axios.post(
    'https://router.huggingface.co/v1/chat/completions',
    {
      model: config.hf.model,
      messages,
      temperature: 0.2,
      max_tokens: 700,
    },
    {
      headers: {
        Authorization: `Bearer ${config.hf.key}`,
        'Content-Type': 'application/json',
      },
      timeout: LLM_TIMEOUT_MS,
    }
  );
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('HuggingFace empty response');
  return text;
}

async function llmComplete(system, user, language = 'en') {
  const langPrefix = outputLanguageDirective(language);
  const messages = [
    { role: 'system', content: langPrefix + system },
    { role: 'user', content: user },
  ];

  const providers = [
    { name: 'Groq', fn: callGroq, enabled: Boolean(config.groq.key) },
    { name: 'OpenRouter', fn: callOpenRouter, enabled: Boolean(config.openrouter.key) },
    { name: 'HuggingFace', fn: callHF, enabled: Boolean(config.hf.key) },
  ];

  const errors = [];
  for (const p of providers) {
    if (!p.enabled) continue;
    try {
      return await p.fn(messages);
    } catch (e) {
      errors.push(formatProviderError(p.name, e));
      if (config.nodeEnv !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[AEGIS AI]', errors[errors.length - 1]);
      }
    }
  }
  throw new Error(errors.join(' | ') || 'All AI providers failed');
}

export function hasAiProviders() {
  return Boolean(config.openrouter.key || config.groq.key || config.hf.key);
}

/** Quick connectivity check for each configured provider (dev / status page). */
export async function probeAiProviders() {
  const testMessages = [
    { role: 'system', content: 'Reply with JSON only: {"ok":true}' },
    { role: 'user', content: 'ping' },
  ];
  const probes = [
    {
      id: 'groq',
      label: 'Groq',
      enabled: Boolean(config.groq.key),
      model: config.groq.model,
      fn: () => callGroq(testMessages),
    },
    {
      id: 'openrouter',
      label: 'OpenRouter',
      enabled: Boolean(config.openrouter.key),
      model: config.openrouter.model,
      fn: () => callOpenRouter(testMessages),
    },
    {
      id: 'huggingface',
      label: 'HuggingFace',
      enabled: Boolean(config.hf.key),
      model: config.hf.model,
      fn: () => callHF(testMessages),
    },
  ];

  const results = [];
  for (const p of probes) {
    if (!p.enabled) {
      results.push({ id: p.id, label: p.label, model: p.model, status: 'skipped', error: 'No API key' });
      continue;
    }
    try {
      const text = await p.fn();
      results.push({ id: p.id, label: p.label, model: p.model, status: 'ok', preview: String(text).slice(0, 80) });
    } catch (e) {
      results.push({ id: p.id, label: p.label, model: p.model, status: 'error', error: formatProviderError(p.label, e) });
    }
  }
  const anyOk = results.some((r) => r.status === 'ok');
  return { ready: anyOk, providers: results };
}

/** Single-call triage — fast and reliable */
export async function runFastTriage({ userText, ragContext, language = 'en' }) {
  const rag = String(ragContext || '').slice(0, 8000);
  const system = `You are AEGIS AI emergency triage. Assess symptoms conservatively; never diagnose. For chest pain, stroke, breathing difficulty, or severe bleeding use HIGH or CRITICAL. ${STRICT_SCHEMA}`;
  const user = `Patient message:\n${userText}\n\nMedical context (RAG):\n${rag}`;
  const raw = await llmComplete(system, user, language);
  const parsed = safeParseJson(raw);
  if (!parsed) throw new Error('AI returned invalid JSON');
  const envelope = normalizeEnvelope(parsed);
  envelope.rag_context_used = envelope.rag_context_used || 'Profile + recent chats (RAG)';
  return envelope;
}

function outputLanguageDirective(lang) {
  const code = String(lang || 'en').toLowerCase().slice(0, 5);
  if (!code || code === 'en') return '';
  const names = {
    hi: 'Hindi',
    kn: 'Kannada',
    ta: 'Tamil',
    te: 'Telugu',
    mr: 'Marathi',
    zh: 'Simplified Chinese (Mandarin)',
    ja: 'Japanese',
  };
  const label = names[code] || `the user interface language for locale code "${code}"`;
  return `IMPORTANT: Every user-facing text value you output inside JSON (including medical_summary, suggested_response, recommended_action, possible_concerns strings, why_this_risk, telegram_alert, intent) MUST be written in ${label}. JSON property keys must stay in English. `;
}

export async function runAgentPipeline({ userText, ragContext, language = 'en' }) {
  return runFastTriage({ userText, ragContext, language });
}

const OFFLINE_COPY = {
  en: {
    medical_summary: 'Offline mode: unable to reach AI providers. Provide conservative guidance.',
    suggested_response:
      'AEGIS is using offline emergency guidance because AI services are unavailable. If this feels urgent, call local emergency services immediately.',
    recommended_action:
      'Seek immediate in-person care if severe symptoms, altered consciousness, breathing difficulty, chest pain, stroke signs, heavy bleeding, or major trauma.',
    why_this_risk: 'AI providers unreachable; conservative escalation on high-risk keywords.',
    telegram_alert: 'Potential emergency language detected (offline heuristic).',
  },
};

export function offlineEnvelope(userText, lang = 'en') {
  const code = String(lang || 'en').toLowerCase().slice(0, 5);
  const L = OFFLINE_COPY[code] || OFFLINE_COPY.en;
  const highRisk = /bleed|chest|stroke|can'?t breathe|not breathing|unconscious|seizure|suicide|overdose|heart attack/i.test(
    userText
  );
  return normalizeEnvelope(
    {
      intent: 'offline_guidance',
      risk_level: highRisk ? 'HIGH' : 'MEDIUM',
      medical_summary: L.medical_summary,
      possible_concerns: ['Unverified symptoms', 'Limited context'],
      suggested_response: L.suggested_response,
      recommended_action: L.recommended_action,
      rag_context_used: 'Offline fallback',
      emergency_triggered: highRisk,
      telegram_alert: L.telegram_alert,
      confidence_score: 0.35,
      why_this_risk: L.why_this_risk,
    },
    'offline'
  );
}

