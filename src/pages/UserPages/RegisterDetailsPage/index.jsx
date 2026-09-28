import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { useRegisterUserMutation } from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import { AuthField, AuthShell, AuthSteps, AuthSubmit, PasswordField } from '../SignInPage/AuthShell';
import { validateAuthField, validateAuthForm } from '../SignInPage/authValidation';
import './index.scss';

const FIELD_ORDER = ['firstName', 'lastName', 'email', 'password'];

function RegisterDetailsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [registerUser, { isLoading: isUserLoading }] = useRegisterUserMutation();
  const isLoading = isUserLoading;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const fieldRefs = {
    firstName: useRef(null),
    lastName: useRef(null),
    email: useRef(null),
    password: useRef(null),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name]);
    if (firstInvalid) {
      fieldRefs[firstInvalid].current?.focus();
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      await registerUser(payload).unwrap();
      toast.showSuccess("Qeydiyyat uğurla tamamlandı! 🎓 Zəhmət olmasa daxil olun.");
      navigate('/signin');
    } catch (err) {
      const errorMessage = err?.data?.message || err?.data || err?.error || t('auth.registerError') || "Qeydiyyat zamanı xəta baş verdi.";
      toast.showError(errorMessage);
    }
  };

  const fieldProps = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
    inputRef: fieldRefs[name],
    required: true,
  });

  return (
    <AuthShell className="rd-page">
      <AuthSteps current={2} total={2} />

      <header className="au-head">
        <h1 className="au-title">{t('auth.submitRegister')}</h1>
      </header>

      <form className="au-form" onSubmit={handleSubmit} noValidate>
        <div className="au-row">
          <AuthField
            id="register-first-name"
            type="text"
            label={t('auth.firstName')}
            placeholder={t('auth.firstName')}
            autoComplete="given-name"
            {...fieldProps('firstName')}
          />
          <AuthField
            id="register-last-name"
            type="text"
            label={t('auth.lastName')}
            placeholder={t('auth.lastName')}
            autoComplete="family-name"
            {...fieldProps('lastName')}
          />
        </div>

        <AuthField
          id="register-email"
          type="email"
          label={t('auth.emailLabel')}
          icon={Mail}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          {...fieldProps('email')}
        />

        <PasswordField
          id="register-password"
          label={t('auth.passwordLabel')}
          placeholder="••••••••"
          autoComplete="new-password"
          {...fieldProps('password')}
        />

        <AuthSubmit loading={isLoading}>{t('auth.submitRegister')}</AuthSubmit>
      </form>

      <p className="au-switch">
        {t('pages.auth.haveAccount', 'Artıq hesabınız var?')}
        <Link to="/signin" className="ds-link">{t('auth.signInTitle')}</Link>
      </p>
    </AuthShell>
  );
}

export default RegisterDetailsPage;
