import { findUserById } from '../database/db.js';
import { sendTelegramMessage } from '../services/telegramService.js';

export async function testTelegram(req, res) {
  try {
    const user = findUserById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const chatId = user.settings?.telegramChatId || '';
    const text = `AEGIS · test message\nUser: ${user.email}\nUTC: ${new Date().toISOString()}`;
    const r = await sendTelegramMessage(text, chatId || undefined);
    res.json({ ok: r.ok, status: r.status, error: r.error || null });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Telegram test failed' });
  }
}
