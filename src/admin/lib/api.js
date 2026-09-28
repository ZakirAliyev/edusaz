import Cookies from 'js-cookie';
import { env } from '@/config/env';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Thin fetch wrapper for the admin panel.
 * Sends the auth token, unwraps `{ data }` envelopes and throws ApiError with a readable message.
 */
export async function apiRequest(path, { method = 'GET', body, formData, signal } = {}) {
  const headers = {};
  const token = Cookies.get('userToken');
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${env.apiBaseUrl}${path}`, { method, headers, body: payload, signal });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError('Serverlə əlaqə qurulmadı. İnternet bağlantısını və ya API-nin işlədiyini yoxlayın.', 0);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.message || json?.title || (res.status === 401 || res.status === 403
      ? 'Bu əməliyyat üçün icazəniz yoxdur. Yenidən daxil olun.'
      : `Sorğu uğursuz oldu (${res.status}).`);
    throw new ApiError(message, res.status);
  }
  return json && Object.prototype.hasOwnProperty.call(json, 'data') ? json.data : json;
}

export const errorMessage = (err, fallback = 'Xəta baş verdi.') =>
  err?.data?.message || err?.message || fallback;

export async function uploadFile(file, folder) {
  const formData = new FormData();
  formData.append('file', file);
  const data = await apiRequest(`/Upload?folder=${folder}`, { method: 'POST', formData });
  const url = data?.fileUrl || data?.relativeUrl;
  if (!url) throw new ApiError('Server faylın ünvanını qaytarmadı.', 500);
  return url;
}

export async function uploadFiles(files, folder) {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  try {
    const data = await apiRequest(`/Upload/multiple?folder=${folder}`, { method: 'POST', formData });
    return (Array.isArray(data) ? data : []).map((item) => item.fileUrl || item.relativeUrl).filter(Boolean);
  } catch (err) {
    if (err.status === 0) throw err;
    // Older API builds have no /multiple endpoint — upload one by one instead.
    const urls = [];
    for (const file of files) urls.push(await uploadFile(file, folder));
    return urls;
  }
}
