import axios from 'axios';
import { config } from '../config/index.js';

export async function sendTelegramMessage(text, chatIdOverride) {
  const token = config.telegram.token;
  const chatId = chatIdOverride || config.telegram.chatId || config.telegram.groupId;
  if (!token || !chatId) {
    return { ok: false, status: 'skipped', error: 'Telegram not configured' };
  }
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const deadlineMs = 18_000;
  try {
    await Promise.race([
      axios.post(url, { chat_id: chatId, text }, { timeout: 15_000 }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Telegram timed out after ${deadlineMs / 1000}s`)), deadlineMs);
      }),
    ]);
    return { ok: true, status: 'sent' };
  } catch (e) {
    return { ok: false, status: 'failed', error: e?.response?.data?.description || e.message };
  }
}
