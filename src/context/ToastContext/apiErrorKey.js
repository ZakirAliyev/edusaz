// Maps an RTK Query / fetch error to a translation key, so users never see raw server text
// (which is often Azerbaijani-only or technical). Returns null when nothing specific applies.
const MESSAGE_PATTERNS = [
  [/invalid credentials|email və ya şifrə|şifrə yanlış|incorrect password/i, 'toast.auth.invalidCredentials'],
  [/already in use|already exists|artıq qeydiyyat|artıq istifadə|artıq mövcud/i, 'toast.auth.emailTaken'],
  [/fayl növü|file type|not supported|dəstəklənmir/i, 'toast.errors.unsupportedFile'],
];

export function apiErrorKey(err) {
  if (!err) return null;
  const status = err.status ?? err.originalStatus;
  if (status === 'FETCH_ERROR' || err.name === 'TypeError') return 'toast.errors.network';
  if (status === 'TIMEOUT_ERROR') return 'toast.errors.timeout';

  const data = err.data;
  const text = [data?.message, data?.title, typeof data === 'string' ? data : '', err.message].filter(Boolean).join(' ');
  for (const [pattern, key] of MESSAGE_PATTERNS) {
    if (pattern.test(text)) return key;
  }

  const code = Number(status);
  if (code === 401) return 'toast.errors.unauthorized';
  if (code === 403) return 'toast.errors.forbidden';
  if (code === 404) return 'toast.errors.notFound';
  if (code === 413) return 'toast.errors.tooLarge';
  if (code === 415) return 'toast.errors.unsupportedFile';
  // 400/422 fall through to the caller's action-specific message (e.g. "registration failed").
  if (code >= 500 || status === 'PARSING_ERROR') return 'toast.errors.server';
  return null;
}
