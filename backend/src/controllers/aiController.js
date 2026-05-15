import { appendChat, recentChats, addHistoryEntry, findUserById } from '../database/db.js';
import { offlineEnvelope, hasAiProviders, probeAiProviders, runFastTriage } from '../services/aiService.js';
import { sendTelegramMessage } from '../services/telegramService.js';
import { sendMail } from '../services/emailService.js';
import { escapeHtml } from '../utils/htmlEscape.js';
import { config } from '../config/index.js';

function buildRag(user) {
  const profile = user?.profile || {};
  const hist = recentChats(user.id, 20)
    .map((c) => `${c.role}: ${c.content}`)
    .join('\n');
  return [
    `Allergies: ${(profile.allergies || []).join(', ')}`,
    `Medications: ${(profile.medications || []).join(', ')}`,
    `Conditions: ${(profile.conditions || []).join(', ')}`,
    `Blood group: ${profile.bloodGroup || ''}`,
    `Notes: ${profile.notes || ''}`,
    `Recent chat:\n${hist}`,
  ].join('\n');
}

async function resolveEnvelope(message, rag, language) {
  if (!hasAiProviders()) {
    return {
      envelope: offlineEnvelope(message, language),
      source: 'offline',
      error: 'No AI API keys in backend .env (OPENROUTER_API_KEY, GROQ_API_KEY, or HF_API_KEY)',
    };
  }
  try {
    const envelope = await runFastTriage({ userText: message, ragContext: rag, language });
    return { envelope, source: 'live' };
  } catch (e) {
    if (config.nodeEnv !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[AEGIS AI]', e.message);
    }
    return {
      envelope: offlineEnvelope(message, language),
      source: 'offline',
      error: e.message || 'AI request failed',
    };
  }
}

export async function triage(req, res) {
  try {
    const { message, lat, lng, language: bodyLang } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message required' });
    const user = findUserById(req.user.sub);
    if (!user) return res.status(401).json({ error: 'User not found — sign in again' });
    const language = bodyLang || user?.settings?.language || 'en';
    const rag = buildRag(user);

    const { envelope, source, error } = await resolveEnvelope(message, rag, language);

    appendChat(user.id, 'assistant', JSON.stringify(envelope), { kind: 'triage' });

    let telegramStatus = 'queued';
    let emailStatus = 'queued';
    if (envelope.emergency_triggered) {
      const text =
        envelope.telegram_alert ||
        `AEGIS EMERGENCY\nUser: ${user.email}\nRisk: ${envelope.risk_level}\nSummary: ${envelope.medical_summary}\nGPS: ${lat},${lng}`;
      const tgChat = user.settings?.telegramChatId || config.telegram.chatId;
      const mailTo = user.settings?.alertEmail || user.email;
      const [tg, em] = await Promise.all([
        sendTelegramMessage(text, tgChat),
        sendMail({
          to: mailTo,
          subject: `AEGIS EMERGENCY — ${envelope.risk_level}`,
          html: `<pre>${escapeHtml(text)}</pre>`,
          text,
        }),
      ]);
      telegramStatus = tg.ok ? 'sent' : tg.status === 'skipped' ? 'skipped' : 'failed';
      emailStatus = em.ok ? 'sent' : em.status === 'skipped' ? 'skipped' : 'failed';
    } else {
      telegramStatus = 'skipped';
      emailStatus = 'skipped';
    }

    const history = addHistoryEntry(user.id, {
      title: envelope.intent || 'AI triage',
      risk: envelope.risk_level,
      telegramStatus,
      emailStatus,
      summary: envelope.medical_summary,
      payload: envelope,
      location: lat && lng ? { lat, lng } : null,
    });

    res.json({
      envelope,
      alerts: { telegramStatus, emailStatus },
      historyId: history.id,
      meta: { source, error: error || null },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function chat(req, res) {
  try {
    const { message, language: bodyLang } = req.body || {};
    if (!message) return res.status(400).json({ error: 'message required' });
    const user = findUserById(req.user.sub);
    if (!user) return res.status(401).json({ error: 'User not found — sign in again' });
    const language = bodyLang || user?.settings?.language || 'en';
    const rag = buildRag(user);
    appendChat(user.id, 'user', message, { kind: 'chat' });

    const { envelope, source, error } = await resolveEnvelope(message, rag, language);

    appendChat(user.id, 'assistant', envelope.suggested_response, { kind: 'chat', envelope });
    res.json({ reply: envelope.suggested_response, envelope, meta: { source, error: error || null } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function aiStatus(_req, res) {
  try {
    const status = await probeAiProviders();
    res.json({
      hasKeys: hasAiProviders(),
      models: {
        groq: config.groq.model,
        openrouter: config.openrouter.model,
        huggingface: config.hf.model,
      },
      ...status,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
