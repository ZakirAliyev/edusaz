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

const FlagIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" x2="4" y1="22" y2="15"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const BookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const GradCapIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
  </svg>
);

function Hero() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { data: countries = [] } = useGetCountriesQuery(language);

  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('');

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (toCountry) queryParams.set('country', toCountry);
    if (fieldOfStudy) queryParams.set('field', fieldOfStudy);
    if (degreeLevel) queryParams.set('level', degreeLevel);
    
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
          <div className="search-grid">

            <div className="search-field">
              <span className="field-label">{t('hero.labels.from')}</span>
              <div className="field-row">
                <FlagIcon />
                <select className="field-select" value={fromCountry} onChange={(e) => setFromCountry(e.target.value)}>
                  <option value="" disabled hidden>{t('hero.placeholders.from')}</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.code}>{c.flagEmoji} {c.name}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
            </div>

            <div className="search-field">
              <span className="field-label">{t('hero.labels.to')}</span>
              <div className="field-row">
                <MapPinIcon />
                <select className="field-select" value={toCountry} onChange={(e) => setToCountry(e.target.value)}>
                  <option value="" disabled hidden>{t('hero.placeholders.to')}</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.flagEmoji} {c.name}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
            </div>

            <div className="search-field">
              <span className="field-label">{t('hero.labels.field')}</span>
              <div className="field-row">
                <BookIcon />
                <select className="field-select" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)}>
                  <option value="" disabled hidden>{t('hero.placeholders.field')}</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Medicine">Medicine</option>
                </select>
                <ChevronIcon />
              </div>
            </div>

            <div className="search-field">
              <span className="field-label">{t('hero.labels.level')}</span>
              <div className="field-row">
                <GradCapIcon />
                <select className="field-select" value={degreeLevel} onChange={(e) => setDegreeLevel(e.target.value)}>
                  <option value="" disabled hidden>{t('hero.placeholders.level')}</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                </select>
                <ChevronIcon />
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="search-actions">
            <button className="btn-find" onClick={handleSearch}>
              <SearchIcon />
              <span>{t('hero.buttons.find')}</span>
            </button>
            <button className="btn-ai" onClick={() => navigate('/ai-discovery')}>
              <SparklesIcon />
              <span>{t('hero.buttons.ai')}</span>
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
