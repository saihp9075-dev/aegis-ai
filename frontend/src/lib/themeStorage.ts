const DARK_KEY = 'aegis_dark_mode';

export function readStoredDarkMode(): boolean | null {
  if (typeof localStorage === 'undefined') return null;
  const v = localStorage.getItem(DARK_KEY);
  if (v === '0') return false;
  if (v === '1') return true;
  return null;
}

export function writeStoredDarkMode(dark: boolean) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DARK_KEY, dark ? '1' : '0');
}
