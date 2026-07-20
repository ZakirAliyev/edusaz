import { useState } from 'react';
import './index.scss';
import { useTranslation } from "react-i18next";

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="brain-svg">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M12 5v14" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sparkles-svg">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" fill="currentColor"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z" fill="currentColor"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" fill="currentColor"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

function Navbar() {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <section id="navbar">
            <div className="container">
                <nav className="nav-wrapper">
                    {/* Logo Section */}
                    <div className="logo-section">
                        <div className="logo-icon-wrapper">
                            <BrainIcon />
                        </div>
                        <span className="logo-text">
                            EDU<span className="logo-text-saz">SAZ</span>
                        </span>
                    </div>

                    {/* Desktop Menu Links */}
                    <ul className="nav-links">
                        <li>
                            <a href="#browse-universities" className="nav-link-item">
                                {t('nav.browseUniversities')}
                            </a>
                        </li>
                        <li>
                            <a href="#scholarships" className="nav-link-item">
                                {t('nav.scholarships')}
                            </a>
                        </li>
                        <li>
                            <a href="#destinations" className="nav-link-item">
                                {t('nav.destinations')}
                            </a>
                        </li>
                        <li>
                            <a href="#for-universities" className="nav-link-item">
                                {t('nav.forUniversities')}
                            </a>
                        </li>
                    </ul>

                    {/* Action Buttons */}
                    <div className="nav-actions">
                        <a href="#signin" className="btn-signin">
                            {t('nav.signIn')}
                        </a>
                        <button className="btn-ai-discovery">
                            <span>{t('nav.aiDiscovery')}</span>
                            <SparklesIcon />
                        </button>
                    </div>

                    {/* Mobile Menu Toggle Button */}
                    <button className="mobile-toggle-btn" onClick={toggleMenu} aria-label="Toggle Menu">
                        {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </nav>
            </div>

            {/* Mobile Drawer Overlay & Content */}
            <div className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-drawer-content">
                    <ul className="mobile-nav-links">
                        <li>
                            <a href="#browse-universities" className="mobile-nav-link-item" onClick={toggleMenu}>
                                {t('nav.browseUniversities')}
                            </a>
                        </li>
                        <li>
                            <a href="#scholarships" className="mobile-nav-link-item" onClick={toggleMenu}>
                                {t('nav.scholarships')}
                            </a>
                        </li>
                        <li>
                            <a href="#destinations" className="mobile-nav-link-item" onClick={toggleMenu}>
                                {t('nav.destinations')}
                            </a>
                        </li>
                        <li>
                            <a href="#for-universities" className="mobile-nav-link-item" onClick={toggleMenu}>
                                {t('nav.forUniversities')}
                            </a>
                        </li>
                    </ul>
                    <div className="mobile-nav-actions">
                        <a href="#signin" className="mobile-btn-signin" onClick={toggleMenu}>
                            {t('nav.signIn')}
                        </a>
                        <button className="mobile-btn-ai-discovery" onClick={toggleMenu}>
                            <span>{t('nav.aiDiscovery')}</span>
                            <SparklesIcon />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Navbar;