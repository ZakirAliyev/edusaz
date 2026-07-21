import { Link, useNavigate } from 'react-router-dom';
import './index.scss';

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

function RegisterDetailsPage() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/ai-discovery');
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
            <h2>Create your account</h2>
            <p>Already registered? <Link to="/signin">Sign in</Link></p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Your name" />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Minimum 8 characters" />
            </div>

            <button type="submit" className="btn-submit">
              Create Account <span>&rarr;</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterDetailsPage;
