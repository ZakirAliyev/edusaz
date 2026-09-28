import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, GraduationCap } from 'lucide-react';
import { AuthShell, AuthSteps } from '../SignInPage/AuthShell';
import './index.scss';

// Only the student account can be created from the public site.
const ROLES = [
  { value: 'student', icon: GraduationCap, titleKey: 'auth.studentRole', descKey: 'auth.studentDesc' },
];

function RegisterRolePage() {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleSelect = (role) => {
    setSelectedRole(role);
    localStorage.setItem('userRole', role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      navigate('/register/details', { state: { role: selectedRole } });
    }
  };

  return (
    <AuthShell className="rr-page">
      <AuthSteps current={1} total={2} />

      <header className="au-head">
        <h1 id="rr-title" className="au-title">{t('auth.whoAreYou')}</h1>
        <p className="au-sub">{t('auth.selectRole')}</p>
      </header>

      <div className="rr-options" role="radiogroup" aria-labelledby="rr-title">
        {ROLES.map(({ value, icon: Icon, titleKey, descKey }) => {
          const checked = selectedRole === value;
          return (
            <label key={value} className="rr-option" data-checked={checked ? 'true' : 'false'}>
              <input
                type="radio"
                name="account-role"
                value={value}
                className="rr-option__input"
                checked={checked}
                onChange={() => handleSelect(value)}
              />
              <span className="rr-option__icon" aria-hidden>
                <Icon />
              </span>
              <span className="rr-option__text">
                <span className="rr-option__title">{t(titleKey)}</span>
                <span className="rr-option__desc">{t(descKey)}</span>
              </span>
              <span className="rr-option__check" aria-hidden>
                <Check />
              </span>
            </label>
          );
        })}
      </div>

      <button
        type="button"
        className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block rr-continue"
        onClick={handleContinue}
        disabled={!selectedRole}
      >
        {t('auth.continue')}
      </button>

      <p className="au-switch">
        {t('pages.auth.haveAccount', 'Artıq hesabınız var?')}
        <Link to="/signin" className="ds-link">{t('auth.signInTitle')}</Link>
      </p>
    </AuthShell>
  );
}

export default RegisterRolePage;
