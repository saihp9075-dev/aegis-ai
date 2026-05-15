import { addSosLog, findUserById } from '../database/db.js';
import { sendTelegramMessage } from '../services/telegramService.js';
import { sendMail } from '../services/emailService.js';
import { escapeHtml } from '../utils/htmlEscape.js';
import { config } from '../config/index.js';

export async function dispatchSos(req, res) {
  try {
    const { lat, lng, accuracy, risk, notes, tracking } = req.body || {};
    const user = findUserById(req.user.sub);
    if (!user) return res.status(401).json({ error: 'User not found — sign in again' });
    const maps = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : '';
    const profile = user.profile || {};

    const body = [
      '🚨 AEGIS SOS DISPATCH',
      `Time: ${new Date().toISOString()}`,
      `User: ${user.name} (${user.email})`,
      `Blood: ${profile.bloodGroup || '—'}`,
      `Allergies: ${(profile.allergies || []).join(', ') || '—'}`,
      `Medications: ${(profile.medications || []).join(', ') || '—'}`,
      `Conditions: ${(profile.conditions || []).join(', ') || '—'}`,
      `Notes: ${profile.notes || '—'}`,
      `Risk/context: ${risk || 'SOS'}`,
      `Extra: ${notes || '—'}`,
      `GPS: ${lat},${lng}`,
      `Accuracy (m): ${accuracy ?? '—'}`,
      `Maps: ${maps}`,
      `Tracking: ${tracking ? 'LIVE' : 'SNAPSHOT'}`,
    ].join('\n');

    const results = { telegram: { status: 'queued' }, email: { status: 'queued' } };

    const tgChat = user.settings?.telegramChatId || config.telegram.chatId;
    const tgGroup = user.settings?.telegramGroupId || config.telegram.groupId;
    const mailTo = user.settings?.alertEmail || user.email;

    const [tgPrimary, em] = await Promise.all([
      sendTelegramMessage(body, tgChat),
      sendMail({
        to: mailTo,
        subject: 'AEGIS SOS — Emergency dispatch',
        html: `<pre style="font-family:monospace">${escapeHtml(body)}</pre>`,
        text: body,
      }),
    ]);
    results.telegram = tgPrimary.ok
      ? { status: 'sent' }
      : { status: tgPrimary.status === 'skipped' ? 'skipped' : 'failed', error: tgPrimary.error };
    results.email = em.ok
      ? { status: 'sent' }
      : { status: em.status === 'skipped' ? 'skipped' : 'failed', error: em.error };

    if (tgGroup && tgGroup !== tgChat) {
      sendTelegramMessage(body, tgGroup).catch(() => {});
    }

    const log = addSosLog(user.id, {
      lat,
      lng,
      accuracy,
      maps,
      telegramStatus: results.telegram.status,
      emailStatus: results.email.status,
      body,
    });

    res.json({ ok: true, results, logId: log.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
