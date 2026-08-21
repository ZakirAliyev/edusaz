import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './index.scss';

const GradCapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

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
    <div className="register-role-page">
      <div className="register-container">
        {/* Stepper */}
        <div className="stepper">
          <div className="step active">1</div>
          <div className="step-line"></div>
          <div className="step">2</div>
        </div>

        {/* Card */}
        <div className="register-card">
          <div className="rc-header">
            <h2>{t('auth.whoAreYou')}</h2>
            <p>{t('auth.selectRole')}</p>
          </div>

          <div className="role-options">
            <div
              className={`role-option ${selectedRole === 'student' ? 'selected' : ''}`}
              onClick={() => handleSelect('student')}
            >
              <div className="role-icon">
                <GradCapIcon />
              </div>
              <div className="role-text">
                <h4>{t('auth.studentRole')}</h4>
                <p>{t('auth.studentDesc')}</p>
              </div>
            </div>
          </div>

          <div className="register-actions">
            <button
              className={`btn-continue ${selectedRole ? 'active' : ''}`}
              onClick={handleContinue}
              disabled={!selectedRole}
            >
              {t('auth.continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterRolePage;

