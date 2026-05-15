import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../../data');
const dbPath = path.join(dataDir, 'aegis-db.json');

const defaultDb = {
  users: [],
  histories: [],
  medicineReminders: [],
  chatThreads: [],
  sosLogs: [],
};

function readDb() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify(defaultDb, null, 2), 'utf8');
      return structuredClone(defaultDb);
    }
    const raw = fs.readFileSync(dbPath, 'utf8');
    return { ...defaultDb, ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultDb);
  }
}

function writeDb(db) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
}

export function getDb() {
  return readDb();
}

export function saveDb(db) {
  writeDb(db);
}

export function createUser(payload) {
  const db = getDb();
  const user = {
    id: uuid(),
    email: payload.email.toLowerCase(),
    passwordHash: payload.passwordHash,
    name: payload.name || 'Operator',
    avatarUrl: payload.avatarUrl || '',
    googleId: payload.googleId || '',
    profile: {
      bloodGroup: 'O+',
      dob: '',
      allergies: [],
      medications: [],
      conditions: [],
      notes: '',
    },
    settings: {
      language: 'en',
      darkMode: true,
      largeText: false,
      telegramChatId: '',
      telegramGroupId: '',
      alertEmail: payload.email.toLowerCase(),
    },
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  saveDb(db);
  return user;
}

export function findUserByEmail(email) {
  const db = getDb();
  return db.users.find((u) => u.email === email.toLowerCase());
}

export function findUserById(id) {
  const db = getDb();
  return db.users.find((u) => u.id === id);
}

export function findUserByGoogleId(googleId) {
  const db = getDb();
  return db.users.find((u) => u.googleId === googleId);
}

export function updateUser(id, patch) {
  const db = getDb();
  const idx = db.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  const cur = db.users[idx];
  db.users[idx] = {
    ...cur,
    ...patch,
    profile: { ...cur.profile, ...(patch.profile || {}) },
    settings: { ...cur.settings, ...(patch.settings || {}) },
  };
  saveDb(db);
  return db.users[idx];
}

export function addHistoryEntry(userId, entry) {
  const db = getDb();
  const row = { id: uuid(), userId, createdAt: new Date().toISOString(), ...entry };
  db.histories.unshift(row);
  saveDb(db);
  return row;
}

export function listHistory(userId) {
  return getDb().histories.filter((h) => h.userId === userId);
}

export function addMedicine(userId, med) {
  const db = getDb();
  const row = { id: uuid(), userId, createdAt: new Date().toISOString(), ...med };
  db.medicineReminders.push(row);
  saveDb(db);
  return row;
}

export function updateMedicine(userId, id, patch) {
  const db = getDb();
  const idx = db.medicineReminders.findIndex((m) => m.id === id && m.userId === userId);
  if (idx === -1) return null;
  db.medicineReminders[idx] = { ...db.medicineReminders[idx], ...patch };
  saveDb(db);
  return db.medicineReminders[idx];
}

export function deleteMedicine(userId, id) {
  const db = getDb();
  const idx = db.medicineReminders.findIndex((m) => m.id === id && m.userId === userId);
  if (idx === -1) return false;
  db.medicineReminders.splice(idx, 1);
  saveDb(db);
  return true;
}

export function listMedicines(userId) {
  return getDb().medicineReminders.filter((m) => m.userId === userId);
}

export function appendChat(userId, role, content, meta = {}) {
  const db = getDb();
  const row = { id: uuid(), userId, role, content, meta, createdAt: new Date().toISOString() };
  db.chatThreads.push(row);
  if (db.chatThreads.length > 500) db.chatThreads.splice(0, db.chatThreads.length - 500);
  saveDb(db);
  return row;
}

export function recentChats(userId, limit = 30) {
  return getDb()
    .chatThreads.filter((c) => c.userId === userId)
    .slice(-limit);
}

export function addSosLog(userId, log) {
  const db = getDb();
  const row = { id: uuid(), userId, createdAt: new Date().toISOString(), ...log };
  db.sosLogs.unshift(row);
  saveDb(db);
  return row;
}

export function listSosLogs(userId) {
  return getDb().sosLogs.filter((s) => s.userId === userId);
}
