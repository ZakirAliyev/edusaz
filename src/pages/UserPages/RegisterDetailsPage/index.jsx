import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useRegisterUserMutation } from '../../../services/apis/userApi';
import './index.scss';

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function RegisterDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'student';
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
      navigate('/signin');
    } catch (err) {
      alert("Registration failed: " + (err.data?.message || err.error || "Unknown error"));
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
            <h2>Create your account</h2>
            <p>Already registered? <Link to="/signin">Sign in</Link></p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="you@example.com" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Minimum 8 characters" onChange={handleChange} required />
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Account'} <span>&rarr;</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterDetailsPage;
