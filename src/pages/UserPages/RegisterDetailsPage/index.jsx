import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegisterUserMutation } from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import './index.scss';

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function RegisterDetailsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || localStorage.getItem('userRole') || 'student';
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData).unwrap();
      toast.showSuccess(t('auth.registerSuccess') + " 📧 E-poçtunuza təsdiq məktubu göndərildi.");
      navigate('/signin');
    } catch (err) {
      toast.showError(t('auth.registerError'));
    }
  };




  return (
    <div className="register-details-page">
      <div className="register-container">
        {/* Stepper */}
        <div className="stepper">
          <div className="step completed">
            <CheckIcon />
          </div>
          <div className="step-line completed"></div>
          <div className="step active">2</div>
        </div>

        {/* Card */}
        <div className="register-card">
          <div className="rc-header">
            <h2>{t('auth.submitRegister')}</h2>
            <p><Link to="/signin">{t('auth.signInTitle')}</Link></p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('auth.firstName')}</label>
              <input type="text" name="firstName" placeholder={t('auth.firstName')} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>{t('auth.lastName')}</label>
              <input type="text" name="lastName" placeholder={t('auth.lastName')} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>{t('auth.emailLabel')}</label>
              <input type="email" name="email" placeholder="you@example.com" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>{t('auth.passwordLabel')}</label>
              <input type="password" name="password" placeholder="Minimum 8 characters" onChange={handleChange} required />
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? '...' : t('auth.submitRegister')} <span>&rarr;</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterDetailsPage;

