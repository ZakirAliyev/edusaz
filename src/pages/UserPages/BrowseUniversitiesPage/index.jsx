import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetUniversitiesQuery } from '../../../services/apis/userApi';
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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

function BrowseUniversitiesPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: universities = [], isLoading } = useGetUniversitiesQuery(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');

  const filteredUniversities = universities.filter(uni => {
    const matchesQuery = !searchQuery || uni.name.toLowerCase().includes(searchQuery.toLowerCase()) || uni.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'All' || uni.country.toLowerCase() === selectedCountry.toLowerCase();
    return matchesQuery && matchesCountry;
  });

  return (
    <main id="browse-universities-page">
      <div className="bu-header">
        <div className="bu-badge">
          <UniversityIcon />
          {t('matchedUniversities.badge')}
        </div>
        
        <h1 className="bu-title">
          {t('matchedUniversities.title')}
        </h1>
        
        <p className="bu-subtitle">
          {t('hero.subtitle')}
        </p>
      </div>

      <div className="bu-filter-card">
        <div className="filter-group">
          <div className="filter-field">
            <span className="filter-label">{t('hero.labels.to')}</span>
            <div className="filter-input-wrap">
              <select className="filter-select" value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                <option value="All">{t('hero.placeholders.to')}</option>
                <option value="Azerbaijan">Azerbaijan</option>
                <option value="Turkey">Turkey</option>
                <option value="Germany">Germany</option>
                <option value="Poland">Poland</option>
              </select>
              <ChevronDownIcon />
            </div>
          </div>
          
          <div className="filter-field">
            <span className="filter-label">{t('hero.labels.field')}</span>
            <div className="filter-input-wrap">
              <input 
                type="text" 
                className="filter-select" 
                placeholder={t('hero.placeholders.field')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ cursor: 'text' }}
              />
              <SearchIcon />
            </div>
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="btn-apply-filters">
            <FilterIcon /> {t('hero.buttons.find')} ({filteredUniversities.length})
          </button>
        </div>
      </div>

      <div className="bu-grid-container">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading universities from backend...</div>
        ) : (
          <div className="bu-grid">
            {filteredUniversities.map(uni => (
              <Link to={`/universities/${uni.id}`} key={uni.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="bu-card">
                  <div className="bu-card-img-wrapper">
                    <img src={uni.logoUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"} alt={uni.name} className="bu-card-img" />
                    <div className="bu-card-tags">
                      <span className="bu-tag-match high">
                        <SparkleIcon /> 96% {t('matchedUniversities.match')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bu-card-body">
                    <div className="bu-card-header">
                      <div>
                        <h4 className="bu-card-title">{uni.name}</h4>
                        <p className="bu-card-location">{uni.city ? `${uni.city}, ${uni.country}` : uni.country}</p>
                      </div>
                      <span className="bu-card-ranking">{t('matchedUniversities.est')} {uni.establishedYear}</span>
                    </div>
                    
                    <p className="bu-card-program">{uni.description ? uni.description.substring(0, 60) + '...' : ''}</p>
                    
                    <div className="bu-card-stats">
                      <div className="bu-card-stat">
                        <span>{t('matchedUniversities.labels.tuition')}</span>
                        <strong>{uni.tuition || "$6,500/yr"}</strong>
                      </div>
                      <div className="bu-card-stat">
                        <span>{t('matchedUniversities.labels.acceptance')}</span>
                        <strong>{uni.acceptanceRate || "45%"}</strong>
                      </div>
                      <div className="bu-card-stat">
                        <span>{t('matchedUniversities.labels.language')}</span>
                        <strong>{uni.teachingLanguage || "English"}</strong>
                      </div>
                    </div>
                    
                    <div className="bu-card-footer">
                      <div className="bu-deadline">
                        {uni.deadline || "Apr 30"}
                      </div>
                      <button className="bu-card-btn">&rarr;</button>
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


