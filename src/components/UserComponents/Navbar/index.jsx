import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './index.scss';
import { useTranslation } from "react-i18next";
import { LanguageSelector } from '../LanguageSelector';

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

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

function Navbar() {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const isLightMode = location.pathname !== '/';

    useEffect(() => {
        const token = Cookies.get('userToken');
        const role = localStorage.getItem('userRole');
        setIsLoggedIn(!!token);
        setUserRole(role);
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSignOut = () => {
        Cookies.remove('userToken');
        localStorage.removeItem('userRole');
        setIsLoggedIn(false);
        setUserRole(null);
        navigate('/');
    };

    return (
        <section id="navbar" className={`${isScrolled ? 'scrolled' : ''} ${isLightMode ? 'light-mode' : ''}`}>
            <div className="container">
                <nav className="nav-wrapper">
                    {/* Logo Section */}
                    <Link to="/" className="logo-section">
                        <img
                          src="/edusaz-yan.png"
                          alt="Edusaz Logo"
                          style={{  
                            height: "40px",
                            width: "auto",
                            objectFit: "contain",
                            filter: (isLightMode || isScrolled) ? "none" : "brightness(0) invert(1)",
                            transition: "filter 0.3s ease"
                          }}
                        />
                    </Link>

                    {/* Desktop Menu Links */}
                    <ul className="nav-links">
                        <li>
                            <NavLink to="/universities" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                                {t('nav.browseUniversities')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/courses" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                                {t('nav.courses', { defaultValue: 'Courses' })}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/scholarships" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                                {t('nav.scholarships')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/destinations" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                                {t('nav.destinations')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/for-universities" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                                {t('nav.forUniversities')}
                            </NavLink>
                        </li>
                    </ul>

                    {/* Action Buttons & Language Selector */}
                    <div className="nav-actions">
                        <LanguageSelector />

                        {isLoggedIn ? (
                            <div className="logged-in-profile">
                                <Link to={
                                    userRole === 'Instructor' || userRole === 'instructor' || localStorage.getItem('isInstructor') === 'true' ? '/instructor-portal' :
                                    userRole === 'University' || userRole === 'university' ? '/university-portal' :
                                    userRole === 'Admin' || userRole === 'admin' ? '/superadmin' : '/profile'
                                } className="btn-profile">
                                    <UserIcon /> {
                                        localStorage.getItem('isInstructor') === 'true' ? 'Instructor Portal' :
                                        userRole === 'University' || userRole === 'university' ? t('nav.portal') : t('nav.profile')
                                    }
                                </Link>
                                <button className="btn-signout" onClick={handleSignOut}>
                                    {t('nav.exit')}
                                </button>
                            </div>
                        ) : (
                            <Link to="/signin" className="btn-signin">
                                {t('nav.signIn')}
                            </Link>
                        )}

                        <button className="btn-ai-discovery" onClick={() => navigate('/ai-discovery')}>
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
                            <NavLink to="/universities" className={({ isActive }) => `mobile-nav-link-item ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
                                {t('nav.browseUniversities')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/scholarships" className={({ isActive }) => `mobile-nav-link-item ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
                                {t('nav.scholarships')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/destinations" className={({ isActive }) => `mobile-nav-link-item ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
                                {t('nav.destinations')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/for-universities" className={({ isActive }) => `mobile-nav-link-item ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
                                {t('nav.forUniversities')}
                            </NavLink>
                        </li>
                    </ul>
                    <div className="mobile-nav-actions">
                        <LanguageSelector isMobile={true} />
                        {isLoggedIn ? (
                            <button className="mobile-btn-signin" onClick={() => { handleSignOut(); toggleMenu(); }}>
                                {t('nav.exit')}
                            </button>
                        ) : (

                            <Link to="/signin" className="mobile-btn-signin" onClick={toggleMenu}>
                                {t('nav.signIn')}
                            </Link>
                        )}
                        <button className="mobile-btn-ai-discovery" onClick={() => { toggleMenu(); navigate('/ai-discovery'); }}>
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