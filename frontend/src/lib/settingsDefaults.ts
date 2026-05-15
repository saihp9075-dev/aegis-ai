import type { UserSettings } from '@/types/aegis';
import { readStoredDarkMode } from '@/lib/themeStorage';

export const SETTINGS_DEFAULTS: UserSettings = {
  language: 'en',
  darkMode: true,
  largeText: false,
  telegramChatId: '',
  telegramGroupId: '',
  alertEmail: '',
};

export function mergeUserSettings(partial?: Partial<UserSettings> | null): UserSettings {
  const storedDark = readStoredDarkMode();
  const base = { ...SETTINGS_DEFAULTS };
  if (storedDark !== null && partial?.darkMode === undefined) {
    base.darkMode = storedDark;
  }
  return { ...base, ...(partial || {}) };
}
