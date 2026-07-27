import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import { useLoginUserMutation } from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import './index.scss';

const BrainIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M12 5v14" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

function SignInPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData).unwrap();
      const token = response.data?.accessToken || response.data;
      Cookies.set('userToken', token, { expires: 1 });
      toast.showSuccess(t('auth.loginSuccess') || "Uğurla daxil oldunuz!");
      
      // If email or saved role indicates university, redirect to portal
      const savedRole = localStorage.getItem('userRole');
      if (savedRole === 'university' || formData.email.includes('admin') || formData.email.includes('uni')) {
        navigate('/university-portal');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.showError(err.data?.message || err.error || "Daxil olma zamanı xəta baş verdi");
    }
  };


  return (
    <div className="signin-page">
      {/* Left Panel - Dark */}
      <div className="signin-left">
        <div className="sl-content">
          <div className="sl-logo-wrapper">
            <BrainIcon />
          </div>
          <h1>{t('auth.welcomeBack')}</h1>
          <p>{t('auth.subtitle')}</p>

          <div className="sl-stats-grid">
            <div className="sl-stat-card">
              <h3>2,500+</h3>
              <span>{t('hero.stats.universities')}</span>
            </div>
            <div className="sl-stat-card">
              <h3>150K+</h3>
              <span>{t('hero.stats.scholarships')}</span>
            </div>
            <div className="sl-stat-card">
              <h3>80+</h3>
              <span>{t('hero.stats.countries')}</span>
            </div>
            <div className="sl-stat-card">
              <h3>500K+</h3>
              <span>Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="signin-right">
        <div className="sr-content">
          <div className="sr-header">
            <h1>{t('auth.signInTitle')}</h1>
            <p>{t('auth.newToEdusaz')} <Link to="/register">{t('auth.createAccount')}</Link></p>
          </div>

          <form className="sr-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('auth.emailLabel')}</label>
              <div className="input-wrapper">
                <MailIcon />
                <input type="email" name="email" placeholder="you@example.com" onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>{t('auth.passwordLabel')}</label>
              </div>
              <div className="input-wrapper">
                <LockIcon />
                <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? '...' : t('auth.submitSignIn')} <span>&rarr;</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;

