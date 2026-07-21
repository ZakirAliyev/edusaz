import './index.scss';

const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

function Footer() {
  return (
    <footer id="footer">
      <div className="footer-inner">
        <div className="footer-main">
          
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon-wrap">
                <LogoIcon />
              </div>
              <span>EDUSAZ</span>
            </div>
            
            <p className="footer-desc">
              The world's most intelligent platform for finding, comparing, and applying to universities globally.
            </p>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <h4>2,500+</h4>
                <p>Universities</p>
              </div>
              <div className="footer-stat">
                <h4>80+</h4>
                <p>Countries</p>
              </div>
              <div className="footer-stat">
                <h4>150K+</h4>
                <p>Scholarships</p>
              </div>
              <div className="footer-stat">
                <h4>500K+</h4>
                <p>Students</p>
              </div>
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>STUDENTS</h4>
              <ul>
                <li><a href="#">AI Discovery</a></li>
                <li><a href="#">Browse Universities</a></li>
                <li><a href="#">Scholarships</a></li>
                <li><a href="#">Destinations</a></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h4>UNIVERSITIES</h4>
              <ul>
                <li><a href="#">For Universities</a></li>
                <li><a href="#">University Dashboard</a></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h4>PLATFORM</h4>
              <ul>
                <li><a href="#">Sign In</a></li>
                <li><a href="#">Register</a></li>
              </ul>
            </div>
          </div>
          
        </div>

        <div className="footer-bottom">
          <p>© 2024 EDUSAZ. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;