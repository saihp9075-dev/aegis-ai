import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { hasAiProviders, probeAiProviders } from './services/aiService.js';
import { apiLimiter } from './middleware/rateLimit.js';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const corsStaticOrigins = new Set([
  config.frontendUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (corsStaticOrigins.has(origin)) return callback(null, true);
      if (config.nodeEnv !== 'production') {
        // Reflect any browser Origin (LAN IP, ngrok, etc.). Required when frontend uses
        // absolute VITE_API_URL — otherwise chat/SOS fail CORS outside localhost:5173.
        try {
          const u = new URL(origin);
          if (u.protocol === 'http:' || u.protocol === 'https:') return callback(null, true);
        } catch {
          /* ignore */
        }
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiLimiter);

app.get('/health', (_req, res) => res.json({ ok: true, service: 'aegis-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Optional: serve built frontend in production
const dist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(dist));
app.get('*', (_req, res, next) => {
  if (_req.path.startsWith('/api')) return next();
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) next();
  });
});

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`AEGIS backend listening on :${config.port}`);
  if (hasAiProviders()) {
    probeAiProviders()
      .then((s) => {
        const ok = s.providers.filter((p) => p.status === 'ok').map((p) => p.label);
        // eslint-disable-next-line no-console
        console.log(`[AEGIS AI] Live providers: ${ok.length ? ok.join(', ') : 'none (offline fallback only)'}`);
      })
      .catch(() => {});
  } else {
    // eslint-disable-next-line no-console
    console.warn('[AEGIS AI] No API keys — triage/chat will use offline guidance only');
  }
});
