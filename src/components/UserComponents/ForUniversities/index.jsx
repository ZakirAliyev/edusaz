import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PartnerModal from '../PartnerModal';
import './index.scss';

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const TrendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

function ForUniversities() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const features = [
    {
      icon: <ShieldIcon />,
      title: t('forUniversitiesSection.feature1Title'),
      desc: t('forUniversitiesSection.feature1Desc')
    },
    {
      icon: <TrendIcon />,
      title: t('forUniversitiesSection.feature2Title'),
      desc: t('forUniversitiesSection.feature2Desc')
    },
    {
      icon: <TargetIcon />,
      title: t('forUniversitiesSection.feature3Title'),
      desc: t('forUniversitiesSection.feature3Desc')
    },
    {
      icon: <BarChartIcon />,
      title: t('forUniversitiesSection.feature4Title'),
      desc: t('forUniversitiesSection.feature4Desc')
    }
  ];

  return (
    <section id="for-universities">
      <div className="fu-inner">
        <div className="fu-content">
          <div className="fu-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10v12" />
              <path d="M20 10v12" />
              <path d="M4 10l8-8 8 8" />
              <path d="M12 22v-8" />
            </svg>
            {t('forUniversitiesSection.badge')}
          </div>
          
          <h2 className="fu-title">
            {t('forUniversitiesSection.titlePart1')} <br />
            <span className="fu-title-colored">{t('forUniversitiesSection.titlePart2')}</span>
          </h2>
          
          <p className="fu-subtitle">
            {t('forUniversitiesSection.subtitle')}
          </p>

          <div className="fu-stats">
            <div className="fu-stat-card">
              <h3>12K+</h3>
              <p>{t('forUniversitiesSection.monthlyLeads')}</p>
            </div>
            <div className="fu-stat-card">
              <h3>94%</h3>
              <p>{t('forUniversitiesSection.leadScore')}</p>
            </div>
            <div className="fu-stat-card">
              <h3>35+</h3>
              <p>{t('forUniversitiesSection.sourceCountries')}</p>
            </div>
            <div className="fu-stat-card">
              <h3>180+</h3>
              <p>{t('forUniversitiesSection.partnerUnis')}</p>
            </div>
          </div>
        </div>

        <div className="fu-features">
          <div className="features-list">
            {features.map((feature, idx) => (
              <div className="feature-item" key={idx}>
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <div className="feature-text">
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="btn-partner" onClick={() => setIsModalOpen(true)}>
            {t('forUniversitiesSection.partnerBtn')} <ArrowRightIcon />
          </button>
        </div>
      </div>

      <PartnerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}

export default ForUniversities;
