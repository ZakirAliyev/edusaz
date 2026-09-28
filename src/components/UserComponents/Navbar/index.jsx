import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import { LayoutDashboard, LogOut, Menu, UserRound, X } from 'lucide-react';
import BrandLogo from '../../Common/BrandLogo.jsx';
import { LanguageSelector } from '../LanguageSelector';
import '../../../landing/i18n';
import './index.scss';

const LINKS = [
  { to: '/universities', key: 'nav.browseUniversities' },
  { to: '/scholarships', key: 'nav.scholarships' },
  { to: '/courses', key: 'nav.courses', fallback: 'Kurslar' },
  { to: '/destinations', key: 'nav.destinations' },
  { to: '/for-universities', key: 'nav.forUniversities' },
  { to: '/talents', key: 'nav.talents', fallback: 'Gizli Bacarıqlar' },
];

const PANEL_ROUTES = {
  superadmin: '/superadmin',
  universityadmin: '/university-portal',
  instructor: '/instructor-portal',
  teacher: '/instructor-portal',
  coursecenter: '/instructor-portal',
};

function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState({ loggedIn: false, role: '' });

  useEffect(() => {
    setSession({ loggedIn: !!Cookies.get('userToken'), role: (localStorage.getItem('userRole') || '').toLowerCase() });
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll and allow Escape while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const signOut = () => {
    Cookies.remove('userToken');
    ['userRole', 'userEmail', 'isSuperAdmin'].forEach((k) => localStorage.removeItem(k));
    setSession({ loggedIn: false, role: '' });
    navigate('/');
  };

  const panelRoute = PANEL_ROUTES[session.role];
  const accountLink = panelRoute ? (
    <Link to={panelRoute} className="sn-btn sn-btn--outline">
      <LayoutDashboard aria-hidden />
      {t('landing.nav.dashboard')}
    </Link>
  ) : (
    <Link to="/profile" className="sn-btn sn-btn--outline">
      <UserRound aria-hidden />
      {t('nav.profile')}
    </Link>
  );

  return (
    <>
    <header id="navbar" className={`sn${scrolled || menuOpen ? ' is-scrolled' : ''}${menuOpen ? ' is-open' : ''}`}>
      <div className="sn__inner">
        <Link to="/" className="sn__logo" aria-label="Edusaz">
          <BrandLogo size={30} />
        </Link>

        <nav className="sn__links" aria-label="Əsas menyu">
          {LINKS.map(({ to, key, fallback }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sn__link${isActive ? ' is-active' : ''}`}>
              {t(key, fallback ? { defaultValue: fallback } : undefined)}
            </NavLink>
          ))}
        </nav>

        <div className="sn__actions">
          <LanguageSelector />
          {session.loggedIn ? (
            <>
              {accountLink}
              <button type="button" className="sn-icon-btn" onClick={signOut} aria-label={t('nav.exit')} title={t('nav.exit')}>
                <LogOut aria-hidden />
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="sn__signin">
                {t('nav.signIn')}
              </Link>
              <Link to="/register" className="sn-btn sn-btn--primary">
                {t('landing.nav.start')}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="sn-icon-btn sn__toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="sn-mobile"
          aria-label={menuOpen ? t('landing.nav.close') : t('landing.nav.menu')}
        >
          {menuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
        </button>
      </div>
    </header>

    {/* Rendered outside <header>: its backdrop-filter would otherwise trap this fixed panel inside the 72px bar. */}
    <div id="sn-mobile" className="sn sn__drawer" hidden={!menuOpen}>
        <nav className="sn__drawer-links" aria-label="Mobil menyu">
          {LINKS.map(({ to, key, fallback }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sn__drawer-link${isActive ? ' is-active' : ''}`}>
              {t(key, fallback ? { defaultValue: fallback } : undefined)}
            </NavLink>
          ))}
        </nav>
        <div className="sn__drawer-footer">
          <LanguageSelector isMobile />
          {session.loggedIn ? (
            <div className="sn__drawer-actions">
              {accountLink}
              <button type="button" className="sn-btn sn-btn--ghost" onClick={signOut}>
                <LogOut aria-hidden />
                {t('nav.exit')}
              </button>
            </div>
          ) : (
            <div className="sn__drawer-actions">
              <Link to="/signin" className="sn-btn sn-btn--outline">
                {t('nav.signIn')}
              </Link>
              <Link to="/register" className="sn-btn sn-btn--primary">
                {t('landing.nav.start')}
              </Link>
            </div>
          )}
        </div>
    </div>
    </>
  );
}

export default Navbar;
