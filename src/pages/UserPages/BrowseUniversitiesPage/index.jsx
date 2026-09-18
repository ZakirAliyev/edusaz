import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetUniversitiesQuery, useGetCountriesQuery } from '../../../services/apis/userApi';
import { checkCountryMatch, checkLanguageMatch } from '../../../utils/filterUtils';
import './index.scss';

const UniversityIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10v12" />
    <path d="M20 10v12" />
    <path d="M4 10l8-8 8 8" />
    <path d="M12 22v-8" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const SearchXIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="8" x2="14" y2="14"/>
    <line x1="14" y1="8" x2="8" y2="14"/>
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

function BrowseUniversitiesPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const { data: universities = [], isLoading: isLoadingUnis } = useGetUniversitiesQuery(language);
  const { data: countries = [] } = useGetCountriesQuery(language);

  const initialCountry = searchParams.get('country') || 'All';
  const initialLang = searchParams.get('lang') || 'All';

  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLang);
  const [appliedFilters, setAppliedFilters] = useState({ country: initialCountry, language: initialLang });

  useEffect(() => {
    const cParam = searchParams.get('country') || 'All';
    const lParam = searchParams.get('lang') || 'All';
    setSelectedCountry(cParam);
    setSelectedLanguage(lParam);
    setAppliedFilters({ country: cParam, language: lParam });
  }, [searchParams]);

  const handleSearch = () => {
    setAppliedFilters({
      country: selectedCountry,
      language: selectedLanguage
    });
  };

  const resetFilters = () => {
    setSelectedCountry('All');
    setSelectedLanguage('All');
    setAppliedFilters({ country: 'All', language: 'All' });
  };

  // Universities filtered by selected Country and selected Teaching Language
  const filteredUniversities = useMemo(() => {
    return universities.filter(uni => {
      const activeCountry = appliedFilters.country;
      const activeLang = appliedFilters.language;

      const matchesCountry = checkCountryMatch(uni, activeCountry, countries);
      const matchesLang = checkLanguageMatch(uni, activeLang);

      return matchesCountry && matchesLang;
    });
  }, [universities, countries, appliedFilters]);

  return (
    <main id="browse-universities-page">
      <div className="bu-header">
        <div className="bu-badge">
          <UniversityIcon />
          {t('matchedUniversities.badge', 'UNİVERSİTETLƏR')}
        </div>
        
        <h1 className="bu-title">
          {t('matchedUniversities.title', 'Bütün Universitetlər')}
        </h1>
        
        <p className="bu-subtitle">
          {t('hero.subtitle', 'Bizə özünüz haqqında danışın. Süni İntellektimiz sizi dünyanın ən yaxşı universitetləri ilə uyğunlaşdırır.')}
        </p>
      </div>

      {/* Filter Card: Country & Teaching Language */}
      <div className="bu-filter-card">
        <div className="filter-group">
          {/* Field 1: Country */}
          <div className="filter-field">
            <span className="filter-label">{t('hero.labels.from', 'TƏHSİL ALMAQ İSTƏYİRƏM')}</span>
            <div className="filter-input-wrap">
              <select 
                className="filter-select" 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="All">{t('hero.placeholders.from', 'Ölkəni seçin')}</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.flagEmoji || '🌍'} {c.name}</option>
                ))}
              </select>
              <ChevronDownIcon />
            </div>
          </div>
          
          {/* Field 2: Teaching Language */}
          <div className="filter-field">
            <span className="filter-label">{t('matchedUniversities.labels.language', 'TƏDRİS DİLİ').toUpperCase()}</span>
            <div className="filter-input-wrap">
              <select 
                className="filter-select" 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {TEACHING_LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {t(`aiDiscovery.languages.${lang.key}`, lang.name)}
                  </option>
                ))}
              </select>
              <ChevronDownIcon />
            </div>
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="btn-apply-filters" onClick={handleSearch}>
            <FilterIcon /> {t('hero.buttons.find', 'Universitetləri Tap')} ({filteredUniversities.length})
          </button>
          <Link to="/ai-discovery" style={{ textDecoration: 'none' }}>
            <button className="btn-use-ai">
              <SparkleIcon /> {t('hero.buttons.ai', 'AI Axtarış')}
            </button>
          </Link>
        </div>
      </div>

      <div className="bu-grid-container">
        {isLoadingUnis ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            {t('common.loading', 'Universitetlər yüklənir...')}
          </div>
        ) : filteredUniversities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <SearchXIcon />
            <p style={{ marginTop: '16px', fontSize: '1.1rem' }}>
              {t('matchedUniversities.noResults', 'Seçilmiş filtrlərə uyğun universitet tapılmadı.')}
            </p>
            <button 
              onClick={resetFilters} 
              style={{
                marginTop: '12px',
                padding: '8px 20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#7A5CFF'
              }}
            >
              {t('portal.all', 'Bütün Universitetləri Göstər')}
            </button>
          </div>
        ) : (
          <div className="bu-grid">
            {filteredUniversities.map((uni) => (
              <Link 
                to={`/universities/${uni.id}`} 
                key={uni.id} 
                className="mu-card-link"
              >
                <div className="mu-card">
                  <div className="mu-card-img-wrapper">
                    <img 
                      src={uni.logoUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80'} 
                      alt={uni.name} 
                      className="mu-card-img" 
                      loading="lazy"
                    />
                    <div className="mu-card-tags">
                      {uni.hasScholarship && (
                        <span className="mu-tag-scholarship">
                          🎓 {t('matchedUniversities.tags.scholarship', 'Təqaüdlü')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mu-card-body">
                    <div className="mu-card-header">
                      <h3 className="mu-uni-name" title={uni.name}>{uni.name}</h3>
                      {uni.ranking && (
                        <span className="mu-uni-rank">#{uni.ranking}</span>
                      )}
                    </div>

                    <span className="mu-uni-location">
                      📍 {[uni.city, uni.country].filter(Boolean).join(', ')}
                    </span>

                    {uni.teachingLanguage && (
                      <span className="mu-uni-program">
                        🗣️ {uni.teachingLanguage}
                      </span>
                    )}

                    <div className="mu-uni-stats">
                      <div className="stat-box">
                        <span className="stat-label">{t('matchedUniversities.labels.tuition', 'Təhsil Haqqı')}</span>
                        <span className="stat-val">{uni.tuition || '$3,000'}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">{t('matchedUniversities.labels.acceptance', 'Qəbul')}</span>
                        <span className="stat-val">{uni.acceptanceRate || '45%'}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">{t('matchedUniversities.labels.language', 'Dil')}</span>
                        <span className="stat-val">{uni.teachingLanguage ? uni.teachingLanguage.split(',')[0] : 'English'}</span>
                      </div>
                    </div>

                    <div className="mu-card-footer">
                      <span className="mu-deadline">
                        📅 {uni.establishedYear ? `${t('matchedUniversities.est', 'Qurulma')}: ${uni.establishedYear}` : '2026/2027'}
                      </span>
                      <ChevronRightIcon />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default BrowseUniversitiesPage;
