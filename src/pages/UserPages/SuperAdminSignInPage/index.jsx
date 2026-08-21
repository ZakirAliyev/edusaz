import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { useLoginUserMutation } from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import './index.scss';

function SuperAdminSignInPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData).unwrap();
      const tokenData = response.data || response;
      const token = tokenData?.accessToken || tokenData;
      const role = tokenData?.role || '';

      if (role?.toLowerCase() !== 'superadmin') {
        toast.showError('Bu giriş paneli yalnız SuperAdmin üçündür!');
        return;
      }

      Cookies.set('userToken', token, { expires: 1 });
      localStorage.setItem('userRole', 'superadmin');
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('isSuperAdmin', 'true');
      toast.showSuccess('SuperAdmin Panelinə xoş gəldiniz! 🛡️');
      window.location.href = '/superadmin';
    } catch (err) {
      toast.showError(err?.data?.message || 'Giriş uğursuz oldu. Məlumatları yoxlayın.');
    }
  };

  return (
    <div className="sa-signin-page">
      {/* Left side */}
      <div className="sa-left">
        <div className="sa-left__inner">
          <div className="sa-shield">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="sa-left__title">SuperAdmin Portal</h1>
          <p className="sa-left__desc">
            EduSaz platformasını tam idarə et. Universitetlər, kurslar, təqaüdlər, istifadəçilər və bütün məlumatlar üzərində tam nəzarət.
          </p>

          <div className="sa-stats">
            <div className="sa-stat">
              <span className="sa-stat-icon">🏛️</span>
              <span>Universitetlər</span>
            </div>
            <div className="sa-stat">
              <span className="sa-stat-icon">📚</span>
              <span>Kurslar</span>
            </div>
            <div className="sa-stat">
              <span className="sa-stat-icon">👥</span>
              <span>İstifadəçilər</span>
            </div>
            <div className="sa-stat">
              <span className="sa-stat-icon">🎓</span>
              <span>Proqramlar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="sa-right">
        <div className="sa-form-card">
          <div className="sa-form-header">
            <div className="sa-form-icon">🛡️</div>
            <h2>SuperAdmin Girişi</h2>
            <p>Admin panelinə daxil olmaq üçün məlumatlarınızı daxil edin</p>
          </div>

          <form onSubmit={handleSubmit} className="sa-form">
            <div className="sa-field">
              <label>Email ünvanı</label>
              <div className="sa-input-wrap">
                <span className="sa-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="E-poçt ünvanınızı daxil edin"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="sa-field">
              <label>Parol</label>
              <div className="sa-input-wrap">
                <span className="sa-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#94a3b8" stroke="none">
                    <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7z"/>
                  </svg>
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                />
                <button type="button" className="sa-toggle-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="sa-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="sa-spinner">⏳ Daxil olunur...</span>
              ) : (
                <>🛡️ İdarə Panelinə Daxil Ol</>
              )}
            </button>
          </form>

          <div className="sa-form-footer">
            <Link to="/signin" className="sa-back-link">← Əsas Giriş Səhifəsinə Qayıt</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminSignInPage;
