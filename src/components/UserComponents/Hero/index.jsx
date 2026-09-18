import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetCountriesQuery } from '../../../services/apis/userApi';
import './index.scss';

const SparklesIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const LanguageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7A5CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const TEACHING_LANGUAGES = [
  { id: 'All', key: 'all', name: 'Bütün Dillər' },
  { id: 'en', key: 'english', name: 'İngilis dili' },
  { id: 'tr', key: 'turkish', name: 'Türk dili' },
  { id: 'az', key: 'azerbaijani', name: 'Azərbaycan dili' },
  { id: 'de', key: 'german', name: 'Alman dili' },
  { id: 'ru', key: 'russian', name: 'Rus dili' }
];

function Hero() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { data: countries = [] } = useGetCountriesQuery(language);

  const [toCountry, setToCountry] = useState('All');
  const [teachingLanguage, setTeachingLanguage] = useState('All');

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (toCountry && toCountry !== 'All') queryParams.set('country', toCountry);
    if (teachingLanguage && teachingLanguage !== 'All') queryParams.set('lang', teachingLanguage);
    
    navigate(`/universities?${queryParams.toString()}`);
  };

  return (
    <section id="hero">
      <div className="hero-inner">
        {/* Heading */}
        <h1 className="hero-title">
          {t('hero.titlePart1')}<br />
          <span className="hero-title-colored">{t('hero.titlePart2')}</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">{t('hero.subtitle')}</p>

        {/* Search Card */}
        <div className="search-card">
          <div className="search-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>

            {/* Field 1: Country */}
            <div className="search-field">
              <span className="field-label">{t('hero.labels.from', 'TƏHSİL ALMAQ İSTƏYİRƏM')}</span>
              <div className="field-row">
                <MapPinIcon />
                <select className="field-select" value={toCountry} onChange={(e) => setToCountry(e.target.value)}>
                  <option value="All">{t('hero.placeholders.from', 'Ölkəni seçin')}</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.flagEmoji || '🌍'} {c.name}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
            </div>

            {/* Field 2: Teaching Language */}
            <div className="search-field">
              <span className="field-label">{t('matchedUniversities.labels.language', 'TƏDRİS DİLİ').toUpperCase()}</span>
              <div className="field-row">
                <LanguageIcon />
                <select className="field-select" value={teachingLanguage} onChange={(e) => setTeachingLanguage(e.target.value)}>
                  {TEACHING_LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id}>
                      {t(`aiDiscovery.languages.${lang.key}`, lang.name)}
                    </option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="search-actions">
            <button className="btn-find" onClick={handleSearch}>
              <SearchIcon />
              <span>{t('hero.buttons.find', 'Universitetləri Tap')}</span>
            </button>
            <button className="btn-ai" onClick={() => navigate('/ai-discovery')}>
              <SparklesIcon />
              <span>{t('hero.buttons.ai', 'AI Axtarış')}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">2,500+</span>
            <span className="stat-text">{t('hero.stats.universities')}</span>
          </div>
          <span className="stat-dot" />
          <div className="stat-item">
            <span className="stat-number">80+</span>
            <span className="stat-text">{t('hero.stats.countries')}</span>
          </div>
          <span className="stat-dot" />
          <div className="stat-item">
            <span className="stat-number">150K+</span>
            <span className="stat-text">{t('hero.stats.scholarships')}</span>
          </div>
          <span className="stat-dot" />
          <div className="stat-item">
            <span className="stat-number">45+</span>
            <span className="stat-text">{t('hero.stats.languages')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
