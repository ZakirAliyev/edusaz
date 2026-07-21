import { Link } from 'react-router-dom';
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
  return (
    <div className="signin-page">
      {/* Left Panel - Dark */}
      <div className="signin-left">
        <div className="sl-content">
          <div className="sl-logo-wrapper">
            <BrainIcon />
          </div>
          <h1>Welcome back to EDUSAZ</h1>
          <p>Your path to the world's best universities<br />continues here.</p>

          <div className="sl-stats-grid">
            <div className="sl-stat-card">
              <h3>2,500+</h3>
              <span>Universities</span>
            </div>
            <div className="sl-stat-card">
              <h3>150K+</h3>
              <span>Scholarships</span>
            </div>
            <div className="sl-stat-card">
              <h3>80+</h3>
              <span>Countries</span>
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
            <h1>Sign in</h1>
            <p>New to EDUSAZ? <Link to="/register">Create free account</Link></p>
          </div>

          <div className="sr-social">
            <button className="btn-social">Continue with Google</button>
            <button className="btn-social">Continue with Apple</button>
          </div>

          <div className="sr-divider">
            <span>or email</span>
          </div>

          <form className="sr-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <MailIcon />
                <input type="email" placeholder="you@example.com" />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <a href="#forgot" className="forgot-link">Forgot?</a>
              </div>
              <div className="input-wrapper">
                <LockIcon />
                <input type="password" placeholder="••••••••" />
                <button type="button" className="btn-toggle-visibility">
                  <EyeIcon />
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit">
              Sign In <span>&rarr;</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
