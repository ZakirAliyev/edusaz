// Client-side checks shared by the sign-in and register forms.
// They mirror the old native `required` / `type="email"` rules, only with inline messages.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAuthField(name, value, t) {
  const v = typeof value === 'string' ? value.trim() : value;

  switch (name) {
    case 'email':
      if (!v) return t('pages.auth.errors.emailRequired', 'E-poçt ünvanını daxil edin');
      if (!EMAIL_RE.test(v)) return t('pages.auth.errors.emailInvalid', 'Düzgün e-poçt ünvanı daxil edin');
      return '';
    case 'password':
      return value ? '' : t('pages.auth.errors.passwordRequired', 'Şifrəni daxil edin');
    case 'firstName':
      return v ? '' : t('pages.auth.errors.firstNameRequired', 'Adınızı daxil edin');
    case 'lastName':
      return v ? '' : t('pages.auth.errors.lastNameRequired', 'Soyadınızı daxil edin');
    default:
      return '';
  }
}

/** Returns an object of { field: message } for every invalid field (empty when the form is valid). */
export function validateAuthForm(values, t) {
  return Object.keys(values).reduce((acc, name) => {
    const message = validateAuthField(name, values[name], t);
    if (message) acc[name] = message;
    return acc;
  }, {});
}
