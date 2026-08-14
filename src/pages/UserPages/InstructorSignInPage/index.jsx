import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useInstructorLoginMutation, useInstructorRegisterMutation } from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import './index.scss';

function InstructorSignInPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const i = (key) => t(`instructor.${key}`, { defaultValue: key });

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', displayName: '', expertise: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const [instructorLogin, { isLoading: isLoggingIn }] = useInstructorLoginMutation();
  const [instructorRegister, { isLoading: isRegistering }] = useInstructorRegisterMutation();

  const isLoading = isLoggingIn || isRegistering;

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password required';
    if (mode === 'register') {
      if (!form.firstName) errs.firstName = 'First name required';
      if (!form.lastName) errs.lastName = 'Last name required';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
      if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (mode === 'login') {
        const res = await instructorLogin({ email: form.email, password: form.password }).unwrap();
        if (res?.data?.accessToken) {
          localStorage.setItem('instructorToken', res.data.accessToken);
          localStorage.setItem('instructorEmail', form.email);
          localStorage.setItem('isInstructor', 'true');
          toast?.success?.('Welcome back! 🎓');
          navigate('/instructor-portal');
        }
      } else {
        await instructorRegister({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          displayName: form.displayName || `${form.firstName} ${form.lastName}`,
          expertise: form.expertise
        }).unwrap();
        toast?.success?.('Account created! Please sign in.');
        setMode('login');
        setForm(f => ({ ...f, password: '', firstName: '', lastName: '' }));
      }
    } catch (err) {
      toast?.error?.(err?.data?.message || (mode === 'login' ? 'Invalid credentials' : 'Registration failed'));
    }
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  return (
    <div className="instructor-signin">
      {/* Background */}
      <div className="isignin__bg">
        <div className="isignin__bg-orb isignin__bg-orb--1" />
        <div className="isignin__bg-orb isignin__bg-orb--2" />
        <div className="isignin__bg-orb isignin__bg-orb--3" />
        <div className="isignin__grid" />
      </div>

      {/* Left panel — branding */}
      <div className="isignin__left">
        <Link to="/" className="isignin__logo">
          <div className="isignin__logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#7A5CFF"/>
              <path d="M12 6V18M6 12H18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span>EDUSAZ</span>
        </Link>

        <div className="isignin__left-content">
          <div className="isignin__badge">🎓 Instructor Platform</div>
          <h1 className="isignin__left-title">
            Share your <span className="isignin__gradient-text">knowledge</span> with the world
          </h1>
          <p className="isignin__left-desc">
            Join thousands of expert instructors teaching on EduSaz. Create courses, reach global students, and earn revenue.
          </p>

          <div className="isignin__features">
            {[
              { icon: '📊', title: 'Full Analytics', desc: 'Track students, revenue & performance' },
              { icon: '🌍', title: '31 Languages', desc: 'Your courses auto-translated globally' },
              { icon: '💰', title: 'Earn Revenue', desc: 'Set your own prices and discounts' },
              { icon: '🎯', title: 'Easy Tools', desc: 'Udemy-style course builder' },
            ].map((f, i) => (
              <div key={i} className="isignin__feature">
                <span className="isignin__feature-icon">{f.icon}</span>
                <div>
                  <div className="isignin__feature-title">{f.title}</div>
                  <div className="isignin__feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="isignin__stats">
          {[
            { value: '12K+', label: 'Instructors' },
            { value: '500K+', label: 'Students' },
            { value: '31', label: 'Languages' },
          ].map((s, i) => (
            <div key={i} className="isignin__stat">
              <div className="isignin__stat-value">{s.value}</div>
              <div className="isignin__stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="isignin__right">
        <div className="isignin__card">
          {/* Mode toggle */}
          <div className="isignin__toggle">
            <button
              className={`isignin__toggle-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              {i('signIn')}
            </button>
            <button
              className={`isignin__toggle-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              {i('register')}
            </button>
          </div>

          <h2 className="isignin__card-title">
            {mode === 'login' ? i('loginTitle') : i('register')}
          </h2>
          <p className="isignin__card-subtitle">
            {mode === 'login' ? i('loginSubtitle') : 'Create your instructor account'}
          </p>

          <form onSubmit={handleSubmit} className="isignin__form">
            {mode === 'register' && (
              <>
                <div className="isignin__row">
                  <div className="isignin__field">
                    <label>First Name</label>
                    <input
                      name="firstName" value={form.firstName} onChange={handleChange}
                      placeholder="First name" className={errors.firstName ? 'error' : ''}
                    />
                    {errors.firstName && <span className="isignin__error">{errors.firstName}</span>}
                  </div>
                  <div className="isignin__field">
                    <label>Last Name</label>
                    <input
                      name="lastName" value={form.lastName} onChange={handleChange}
                      placeholder="Last name" className={errors.lastName ? 'error' : ''}
                    />
                    {errors.lastName && <span className="isignin__error">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="isignin__field">
                  <label>{i('displayName')}</label>
                  <input
                    name="displayName" value={form.displayName} onChange={handleChange}
                    placeholder="How you'll appear to students"
                  />
                </div>

                <div className="isignin__field">
                  <label>{i('expertise')}</label>
                  <input
                    name="expertise" value={form.expertise} onChange={handleChange}
                    placeholder="e.g. Web Development, Data Science..."
                  />
                </div>
              </>
            )}

            <div className="isignin__field">
              <label>Email</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder={i('emailPlaceholder')} className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="isignin__error">{errors.email}</span>}
            </div>

            <div className="isignin__field">
              <label>Password</label>
              <div className="isignin__pass-wrap">
                <input
                  name="password" type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} placeholder={i('passwordPlaceholder')}
                  className={errors.password ? 'error' : ''}
                />
                <button type="button" className="isignin__pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="isignin__error">{errors.password}</span>}
            </div>

            {mode === 'register' && (
              <div className="isignin__field">
                <label>Confirm Password</label>
                <input
                  name="confirmPassword" type="password" value={form.confirmPassword}
                  onChange={handleChange} placeholder="Repeat your password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="isignin__error">{errors.confirmPassword}</span>}
              </div>
            )}

            <button type="submit" className="isignin__submit" disabled={isLoading}>
              {isLoading ? (
                <span className="isignin__spinner" />
              ) : (
                mode === 'login' ? 'Sign In →' : 'Create Account →'
              )}
            </button>
          </form>

          <div className="isignin__footer">
            <Link to="/" className="isignin__back">← Back to EduSaz</Link>
            <Link to="/university-portal" className="isignin__alt-link">University Portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorSignInPage;
