export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TriageEnvelope = {
  intent: string;
  risk_level: RiskLevel | string;
  medical_summary: string;
  possible_concerns: string[];
  suggested_response: string;
  recommended_action: string;
  rag_context_used: string;
  emergency_triggered: boolean;
  telegram_alert: string;
  confidence_score: number;
  why_this_risk: string;
};

export type UserProfile = {
  bloodGroup: string;
  dob: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  notes: string;
};

export type UserSettings = {
  language: string;
  darkMode: boolean;
  largeText: boolean;
  telegramChatId: string;
  telegramGroupId: string;
  alertEmail: string;
};

export type AegisUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  profile: UserProfile;
  settings: UserSettings;
};

export type HistoryItem = {
  id: string;
  createdAt: string;
  title: string;
  risk: string;
  telegramStatus: string;
  emailStatus: string;
  summary?: string;
  payload?: unknown;
};

export type HospitalRow = {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  distanceKm: number;
  directionsUrl: string;
  osmUrl: string;
};
