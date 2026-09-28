import Cookies from 'js-cookie';

export const isSuperAdminSession = () => {
  const token = Cookies.get('userToken');
  const role = (localStorage.getItem('userRole') || '').toLowerCase();
  return !!token && (role === 'superadmin' || localStorage.getItem('isSuperAdmin') === 'true');
};

export const saveSuperAdminSession = (token, email) => {
  Cookies.set('userToken', token, { expires: 1, sameSite: 'strict', secure: window.location.protocol === 'https:' });
  localStorage.setItem('userRole', 'superadmin');
  localStorage.setItem('userEmail', email);
  localStorage.setItem('isSuperAdmin', 'true');
};

export const clearSession = () => {
  Cookies.remove('userToken');
  ['userRole', 'userEmail', 'isSuperAdmin', 'superadmin_token'].forEach((k) => localStorage.removeItem(k));
};

export const currentAdminEmail = () => localStorage.getItem('userEmail') || 'superadmin';
