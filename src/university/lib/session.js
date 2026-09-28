import Cookies from 'js-cookie';

const ALLOWED_ROLES = ['universityadmin', 'superadmin'];
const EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

const decodeJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
};

/** Returns { email, role } for a signed-in university admin, otherwise null. */
export function getUniversitySession() {
  const token = Cookies.get('userToken');
  const role = (localStorage.getItem('userRole') || '').toLowerCase();
  if (!token || !ALLOWED_ROLES.includes(role)) return null;
  const payload = decodeJwt(token);
  const email = payload?.email || payload?.[EMAIL_CLAIM] || localStorage.getItem('userEmail') || '';
  return { email, role };
}

export function signOut() {
  Cookies.remove('userToken');
  ['userRole', 'userEmail', 'userName', 'universityId'].forEach((k) => localStorage.removeItem(k));
  // Full page load so the panel stylesheet doesn't follow the user to the public site.
  window.location.href = '/signin';
}

// The API stores new applications as "Applied"; older rows also use "New" / "Under Review".
export const LEAD_STATUSES = [
  { value: 'Applied', label: 'Yeni', tone: 'info' },
  { value: 'UnderReview', label: 'Baxılır', tone: 'warning' },
  { value: 'Accepted', label: 'Qəbul edildi', tone: 'success' },
  { value: 'Rejected', label: 'İmtina', tone: 'danger' },
];
export const normalizeLeadStatus = (status) => {
  const s = (status || '').replace(/\s+/g, '').toLowerCase();
  if (!s || s === 'new' || s === 'applied') return 'Applied';
  return LEAD_STATUSES.find((x) => x.value.toLowerCase() === s)?.value || status;
};
export const isNewLead = (lead) => normalizeLeadStatus(lead.status) === 'Applied';
export const leadStatusMeta = (status) => {
  const value = normalizeLeadStatus(status);
  return LEAD_STATUSES.find((s) => s.value === value) || { value, label: value, tone: 'neutral' };
};
