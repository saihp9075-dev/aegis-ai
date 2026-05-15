import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load repo-root .env first (common when copying .env.example to project root), then backend/.env, then cwd.
const repoRootEnv = path.resolve(__dirname, '../../../.env');
const backendEnv = path.resolve(__dirname, '../../.env');
dotenv.config({ path: repoRootEnv });
dotenv.config({ path: backendEnv, override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8787,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  openrouter: {
    key: process.env.OPENROUTER_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free',
  },
  groq: {
    key: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },
  hf: {
    key: process.env.HF_API_KEY || '',
    model: process.env.HF_MODEL || 'meta-llama/Llama-3.2-3B-Instruct',
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
    groupId: process.env.TELEGRAM_GROUP_ID || '',
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER || '',
    /** Gmail app passwords are often copied with spaces; SMTP expects 16 chars without spaces. */
    pass: String(process.env.EMAIL_PASS || '').replace(/\s+/g, ''),
    from: process.env.EMAIL_FROM || 'AEGIS AI <noreply@aegis.local>',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    /** Must match Google Cloud "Authorized redirect URIs" exactly (e.g. https://api.example.com/api/auth/google/callback) */
    redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
  },
  /** Optional fallback when Overpass returns no rows (Places API — separate key from OAuth). */
  googlePlaces: {
    key: process.env.GOOGLE_PLACES_API_KEY || '',
  },
  osmUserAgent: process.env.OSM_USER_AGENT || 'AEGIS-AI-Healthcare-OS/1.0',
};
