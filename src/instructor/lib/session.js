import Cookies from 'js-cookie';

const INSTRUCTOR_ROLES = ['teacher', 'coursecenter', 'instructor'];
const EMAIL_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

const decodeJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch {
    return null;
  }
};

/** Returns { email, role } for a signed-in instructor / course center, otherwise null. */
export function getInstructorSession() {
  const token = Cookies.get('userToken') || localStorage.getItem('instructorToken');
  const role = (localStorage.getItem('userRole') || '').toLowerCase();
  if (!token || !INSTRUCTOR_ROLES.includes(role)) return null;
  const payload = decodeJwt(token);
  const email = payload?.email || payload?.[EMAIL_CLAIM] || localStorage.getItem('userEmail') || '';
  return { email, role };
}

export function signOut() {
  Cookies.remove('userToken');
  ['userRole', 'userEmail', 'instructorToken'].forEach((k) => localStorage.removeItem(k));
  // Full page load so the panel stylesheet doesn't follow the user to the public site.
  window.location.href = '/signin';
}

export const roleLabel = (role) => (role === 'coursecenter' ? 'Tədris mərkəzi' : 'Müəllim');
