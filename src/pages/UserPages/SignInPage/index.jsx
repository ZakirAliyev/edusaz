import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { useLoginUserMutation } from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import { AuthField, AuthShell, AuthSubmit, PasswordField } from './AuthShell';
import { validateAuthField, validateAuthForm } from './authValidation';
import './index.scss';

function SignInPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();

  const [loginUser, { isLoading }] = useLoginUserMutation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const fieldRefs = { email: useRef(null), password: useRef(null) };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear or refresh an error once the user starts fixing that field.
    if (errors[name]) setErrors({ ...errors, [name]: validateAuthField(name, value, t) });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (value) setErrors((prev) => ({ ...prev, [name]: validateAuthField(name, value, t) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateAuthForm(formData, t);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(fieldRefs).find((name) => nextErrors[name]);
    if (firstInvalid) {
      fieldRefs[firstInvalid].current?.focus();
      return;
    }

    try {
      const response = await loginUser(formData).unwrap();
      const tokenData = response.data || response;
      const token = tokenData?.accessToken || tokenData;
      const role = tokenData?.role || 'Student';

      Cookies.set('userToken', token, { expires: 1 });
      localStorage.setItem('userRole', role.toLowerCase());
      localStorage.setItem('userEmail', tokenData?.email || formData.email);
      if (role.toLowerCase() === 'superadmin') {
        localStorage.setItem('isSuperAdmin', 'true');
      } else {
        localStorage.removeItem('isSuperAdmin');
      }
      if (tokenData?.firstName) {
        localStorage.setItem('userName', `${tokenData.firstName} ${tokenData.lastName || ''}`.trim());
      }
      if (tokenData?.universityId) {
        localStorage.setItem('universityId', tokenData.universityId);
      }

      toast.showSuccess(t('auth.loginSuccess'));

      if (role.toLowerCase() === 'superadmin') {
        navigate('/superadmin');
      } else if (role === 'UniversityAdmin') {
        navigate('/university-portal');
      } else if (role === 'Teacher' || role === 'CourseCenter') {
        navigate('/instructor-portal');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      toast.showError(err?.data?.message || t('auth.loginError'));
    }
  };

  return (
    <AuthShell className="si-page">
      <header className="au-head">
        <h1 className="au-title">{t('auth.signInTitle')}</h1>
        <p className="au-sub">{t('auth.welcomeBack')}</p>
      </header>

      <form className="au-form" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="signin-email"
          name="email"
          type="email"
          label={t('auth.emailLabel')}
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
          inputRef={fieldRefs.email}
          required
        />

        <PasswordField
          id="signin-password"
          name="password"
          label={t('auth.passwordLabel')}
          placeholder="••••••••"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          inputRef={fieldRefs.password}
          required
        />

        <AuthSubmit loading={isLoading}>{t('auth.submitSignIn')}</AuthSubmit>
      </form>

      <p className="au-switch">
        {t('auth.newToEdusaz')}
        <Link to="/register" className="ds-link">{t('auth.createAccount')}</Link>
      </p>
    </AuthShell>
  );
}

export default SignInPage;
