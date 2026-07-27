import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './index.scss';

const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

function Footer() {
  const { t } = useTranslation();

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
              {t('footer.desc')}
            </p>
            
            <div className="footer-stats">
              <div className="footer-stat">
                <h4>2,500+</h4>
                <p>{t('footer.stats.universities')}</p>
              </div>
              <div className="footer-stat">
                <h4>80+</h4>
                <p>{t('footer.stats.countries')}</p>
              </div>
              <div className="footer-stat">
                <h4>150K+</h4>
                <p>{t('footer.stats.scholarships')}</p>
              </div>
              <div className="footer-stat">
                <h4>500K+</h4>
                <p>{t('footer.stats.students')}</p>
              </div>
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>{t('footer.studentsTitle')}</h4>
              <ul>
                <li><Link to="/ai-discovery">{t('nav.aiDiscovery')}</Link></li>
                <li><Link to="/universities">{t('nav.browseUniversities')}</Link></li>
                <li><Link to="/scholarships">{t('nav.scholarships')}</Link></li>
                <li><Link to="/destinations">{t('nav.destinations')}</Link></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h4>{t('footer.universitiesTitle')}</h4>
              <ul>
                <li><Link to="/for-universities">{t('nav.forUniversities')}</Link></li>
                <li><Link to="/university-portal">{t('footer.universityDashboard')}</Link></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h4>{t('footer.platformTitle')}</h4>
              <ul>
                <li><Link to="/signin">{t('nav.signIn')}</Link></li>
                <li><Link to="/signin">{t('auth.createAccount')}</Link></li>
              </ul>
            </div>
          </div>
          
        </div>

        <div className="footer-bottom">
          <p>© 2026 EDUSAZ. {t('footer.rightsReserved')}</p>
          <div className="footer-legal">
            <a href="#">{t('footer.privacy')}</a>
            <a href="#">{t('footer.terms')}</a>
            <a href="#">{t('footer.cookies')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;