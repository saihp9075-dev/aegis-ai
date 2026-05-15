import axios from 'axios';
import type { AegisUser, TriageEnvelope } from '@/types/aegis';

/** Dev: relative `/api/` + Vite proxy. Prod: set VITE_API_URL to backend root including `/api`, e.g. `https://api.example.com/api/` */
function resolveApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  const fallback = '/api';
  if (!raw) {
    return fallback.endsWith('/') ? fallback : `${fallback}/`;
  }
  let base = raw.endsWith('/') ? raw : `${raw}/`;
  if (base.startsWith('http://') || base.startsWith('https://')) {
    try {
      const u = new URL(base);
      const path = u.pathname.replace(/\/+$/, '');
      if (!path.endsWith('/api')) {
        u.pathname = `${path === '' ? '' : path}/api`.replace(/\/+/g, '/');
        base = u.toString();
        if (!base.endsWith('/')) base = `${base}/`;
      }
    } catch {
      /* keep base */
    }
  }
  return base;
}

const baseURL = resolveApiBase();

/** Same base the axios client uses (for OAuth redirect URL, etc.). */
export function getResolvedApiBase(): string {
  return baseURL;
}

const api = axios.create({
  baseURL,
  /** LLM + network can be slow; avoid infinite hang (SOS/email was blocking the API for minutes). */
  timeout: 120_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aegis_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function login(email: string, password: string) {
  const { data } = await api.post<{ token: string; user: AegisUser }>('auth/login', { email, password });
  return data;
}

export async function register(email: string, password: string, name?: string) {
  const { data } = await api.post<{ token: string; user: AegisUser }>('auth/register', { email, password, name });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<{ user: AegisUser }>('auth/me');
  return data.user;
}

export async function saveProfile(profile: Partial<AegisUser['profile']>) {
  const { data } = await api.patch<{ user: AegisUser }>('auth/profile', profile);
  return data.user;
}

export async function saveSettings(settings: Partial<AegisUser['settings']>) {
  const { data } = await api.patch<{ user: AegisUser }>('auth/settings', settings);
  return data.user;
}

export async function triage(message: string, lat?: number, lng?: number, language?: string) {
  const { data } = await api.post<{
    envelope: TriageEnvelope;
    alerts: { telegramStatus: string; emailStatus: string };
    historyId: string;
    meta?: { source?: string; error?: string | null };
  }>('ai/triage', { message, lat, lng, language });
  return data;
}

export async function chat(message: string, language?: string) {
  const { data } = await api.post<{
    reply: string;
    envelope: TriageEnvelope;
    meta?: { source?: string; error?: string | null };
  }>('ai/chat', { message, language });
  return data;
}

export async function dispatchSos(body: {
  lat?: number;
  lng?: number;
  accuracy?: number;
  risk?: string;
  notes?: string;
  tracking?: boolean;
}) {
  const { data } = await api.post('sos/dispatch', body, { timeout: 55_000 });
  return data as {
    ok: boolean;
    results: { telegram: { status: string; error?: string }; email: { status: string; error?: string } };
    logId: string;
  };
}

export async function fetchHospitals(lat: number, lon: number) {
  const { data } = await api.get<{ label: string; hospitals: unknown[]; warning?: string | null }>('hospitals', {
    params: { lat, lon },
  });
  return data;
}

export async function fetchHistory() {
  const { data } = await api.get<{ items: unknown[] }>('history');
  return data.items;
}

export async function fetchMedicines() {
  const { data } = await api.get<{ items: unknown[] }>('medicines');
  return data.items;
}

export async function createMedicine(item: Record<string, unknown>) {
  const { data } = await api.post<{ item: unknown }>('medicines', item);
  return data.item;
}

export async function patchMedicine(id: string, item: Record<string, unknown>) {
  const { data } = await api.patch<{ item: unknown }>(`medicines/${id}`, item);
  return data.item;
}

export async function deleteMedicine(id: string) {
  await api.delete(`medicines/${id}`);
}

export async function testTelegram() {
  const { data } = await api.post<{ ok: boolean; status: string; error?: string | null }>('telegram/test');
  return data;
}

export async function downloadIncidentPdf(payload: Record<string, unknown>) {
  const res = await api.post('pdf/incident', payload, { responseType: 'blob' });
  return res.data as Blob;
}

/** Full URL to start Google OAuth (browser redirect). Matches axios API base (includes /api/). */
export function getGoogleOAuthStartUrl() {
  return `${getResolvedApiBase()}auth/google`;
}

export { api };
