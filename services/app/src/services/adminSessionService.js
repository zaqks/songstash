const STORAGE_KEY = 'admin_session';
const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

function now() {
  return Date.now();
}

export function saveAdminToken(token) {
  if (!token) return;
  const payload = {
    token,
    expiresAt: now() + THREE_MONTHS_MS,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to persist admin token to localStorage', e);
  }
}

export function loadAdminToken() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.token) return '';
    if (parsed.expiresAt && now() > parsed.expiresAt) {
      // expired
      clearAdminToken();
      return '';
    }
    return parsed.token;
  } catch (e) {
    console.warn('Failed to read admin token from localStorage', e);
    return '';
  }
}

export function clearAdminToken() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear admin token from localStorage', e);
  }
}

export function hasValidAdminToken() {
  return Boolean(loadAdminToken());
}

export default {
  saveAdminToken,
  loadAdminToken,
  clearAdminToken,
  hasValidAdminToken,
};
