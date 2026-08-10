import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PartnerModal from '../../../components/UserComponents/PartnerModal';
import './index.scss';

const BuildingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4"/>
    <path d="M8 6h.01"/>
    <path d="M16 6h.01"/>
    <path d="M12 6h.01"/>
    <path d="M12 10h.01"/>
    <path d="M12 14h.01"/>
    <path d="M16 10h.01"/>
    <path d="M16 14h.01"/>
    <path d="M8 10h.01"/>
    <path d="M8 14h.01"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const GlobeOutlineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const RibbonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.4 12.8 19 22l-7-3-7 3 3.6-9.2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A5CFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);


function ForUniversitiesPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="for-universities-page">
      {/* Hero Section */}
      <section className="fu-hero">
        <div className="container">
          <div className="fu-hero-content">
            <span className="fu-badge">
              <BuildingIcon />
              {t('nav.forUniversities')}
            </span>
            <h1 className="fu-title">
              {t('hero.titlePart1')} <br />
              <span className="fu-highlight">{t('hero.titlePart2')}</span>
            </h1>
            <p className="fu-desc">
              {t('hero.subtitle')}
            </p>
            <div className="fu-actions">
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                {t('forUniversitiesSection.partnerBtn', 'Tərəfdaş Olun')} <span>&rarr;</span>
              </button>
              <Link to="/register" className="btn-secondary">
                {t('auth.createAccount')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="fu-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon"><UsersIcon /></div>
              <h3>500K+</h3>
              <p>{t('footer.stats.students')}</p>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><GlobeOutlineIcon /></div>
              <h3>35+</h3>
              <p>{t('footer.stats.countries')}</p>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><TargetIcon /></div>
              <h3>12K+</h3>
              <p>{t('footer.stats.universities')}</p>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><RibbonIcon /></div>
              <h3>94%</h3>
              <p>{t('matchedUniversities.match')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="fu-pricing">
        <div className="container">
          <div className="pricing-header">
            <span className="pricing-badge">{t('nav.forUniversities')}</span>
            <h2>{t('pricingSection.headerTitlePart1')} <span className="pricing-highlight">{t('pricingSection.headerTitlePart2')}</span></h2>
          </div>

          <div className="pricing-cards">
            {/* Verified Profile */}
            <div className="price-card">
              <div className="pc-header">
                <h3>{t('pricingSection.verifiedPartner')}</h3>
                <p>{t('pricingSection.verifiedDesc')}</p>
              </div>
              <div className="pc-price">
                <h2>$299<span>{t('pricingSection.perMonth')}</span></h2>
              </div>
              <button className="btn-outline" onClick={() => setIsModalOpen(true)}>
                {t('forUniversitiesSection.partnerBtn', 'Müraciət Et')}
              </button>
              <ul className="pc-features">
                <li><CheckIcon /> {t('pricingSection.f1')}</li>
                <li><CheckIcon /> {t('pricingSection.f2')}</li>
                <li><CheckIcon /> {t('pricingSection.f3')}</li>
                <li><CheckIcon /> {t('pricingSection.f4')}</li>
                <li><CheckIcon /> {t('pricingSection.f5')}</li>
              </ul>
            </div>

            {/* Premium */}
            <div className="price-card premium">
              <div className="popular-badge">{t('pricingSection.mostPopular')}</div>
              <div className="pc-header">
                <h3>{t('pricingSection.premiumTitle')}</h3>
                <p>{t('pricingSection.premiumDesc')}</p>
              </div>
              <div className="pc-price">
                <h2>$799<span>{t('pricingSection.perMonth')}</span></h2>
              </div>
              <button className="btn-solid" onClick={() => setIsModalOpen(true)}>
                {t('forUniversitiesSection.partnerBtn', 'Müraciət Et')}
              </button>
              <ul className="pc-features">
                <li><CheckIcon /> {t('pricingSection.f6')}</li>
                <li><CheckIcon /> {t('pricingSection.f7')}</li>
                <li><CheckIcon /> {t('pricingSection.f8')}</li>
                <li><CheckIcon /> {t('pricingSection.f9')}</li>
                <li><CheckIcon /> {t('pricingSection.f10')}</li>
                <li><CheckIcon /> {t('pricingSection.f11')}</li>
                <li><CheckIcon /> {t('pricingSection.f12')}</li>
              </ul>
            </div>

            {/* Custom */}
            <div className="price-card">
              <div className="pc-header">
                <h3>{t('pricingSection.enterpriseTitle')}</h3>
                <p>{t('pricingSection.enterpriseDesc')}</p>
              </div>
              <div className="pc-price">
                <h2>{t('pricingSection.customPrice')}</h2>
              </div>
              <button className="btn-outline" onClick={() => setIsModalOpen(true)}>
                {t('forUniversitiesSection.partnerBtn', 'Müraciət Et')}
              </button>
              <ul className="pc-features">
                <li><CheckIcon /> {t('pricingSection.f13')}</li>
                <li><CheckIcon /> {t('pricingSection.f14')}</li>
                <li><CheckIcon /> {t('pricingSection.f15')}</li>
                <li><CheckIcon /> {t('pricingSection.f16')}</li>
                <li><CheckIcon /> {t('pricingSection.f17')}</li>
                <li><CheckIcon /> {t('pricingSection.f18')}</li>
                <li><CheckIcon /> {t('pricingSection.f19')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PartnerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default ForUniversitiesPage;
