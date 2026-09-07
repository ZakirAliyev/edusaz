import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetUniversitiesQuery, useGetCountriesQuery, useGetProgramsQuery } from '../../../services/apis/userApi';
import './index.scss';

const UniversityIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10v12" />
    <path d="M20 10v12" />
    <path d="M4 10l8-8 8 8" />
    <path d="M12 22v-8" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
  </svg>
);

const ScholarshipIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
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

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
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

function BrowseUniversitiesPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: universities = [], isLoading: isLoadingUnis } = useGetUniversitiesQuery(language);
  const { data: countries = [] } = useGetCountriesQuery(language);
  const { data: programs = [] } = useGetProgramsQuery({ lang: language });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({ country: 'All', query: '' });
  const [showDropdown, setShowDropdown] = useState(false);

  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    setShowDropdown(false);
    setAppliedFilters({
      country: selectedCountry,
      query: searchQuery
    });
  };

  const selectAutocompleteItem = (value) => {
    setSearchQuery(value);
    setShowDropdown(false);
    setAppliedFilters({
      country: selectedCountry,
      query: value
    });
  };

  const resetFilters = () => {
    setSelectedCountry('All');
    setSearchQuery('');
    setShowDropdown(false);
    setAppliedFilters({ country: 'All', query: '' });
  };

  // Filter matching programs & universities for live autocomplete dropdown
  const queryLower = searchQuery.toLowerCase().trim();
  const matchingPrograms = queryLower ? programs.filter(p => 
    p.title?.toLowerCase().includes(queryLower) ||
    p.fieldOfStudy?.toLowerCase().includes(queryLower) ||
    p.universityName?.toLowerCase().includes(queryLower)
  ).slice(0, 5) : [];

  const matchingUnis = queryLower ? universities.filter(u =>
    u.name?.toLowerCase().includes(queryLower) ||
    u.country?.toLowerCase().includes(queryLower)
  ).slice(0, 3) : [];

  // Universities linked with programs matching search query
  const filteredUniversities = universities.filter(uni => {
    const activeCountry = appliedFilters.country;
    const activeQuery = appliedFilters.query.toLowerCase().trim();

    const matchesCountry = activeCountry === 'All' || 
                           uni.country.toLowerCase() === activeCountry.toLowerCase() ||
                           uni.countryCode?.toLowerCase() === activeCountry.toLowerCase() ||
                           uni.countryId === activeCountry;

    // Check if university matches name, country, or any associated programs in programs API
    const uniPrograms = programs.filter(p => p.universityId === uni.id);
    const matchesProgram = uniPrograms.some(p => 
      p.title?.toLowerCase().includes(activeQuery) ||
      p.fieldOfStudy?.toLowerCase().includes(activeQuery) ||
      p.degreeLevel?.toLowerCase().includes(activeQuery)
    );

    const matchesQuery = !activeQuery || 
                         uni.name.toLowerCase().includes(activeQuery) || 
                         uni.country.toLowerCase().includes(activeQuery) ||
                         matchesProgram;

    return matchesCountry && matchesQuery;
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
              <select 
                className="filter-select" 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                <option value="All">{t('hero.placeholders.to')}</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.flagEmoji} {c.name}</option>
                ))}
              </select>
              <ChevronDownIcon />
            </div>
          </div>
          
          <div className="filter-field" ref={searchContainerRef}>
            <span className="filter-label">{t('hero.labels.field')}</span>
            <div className="filter-input-wrap">
              <input 
                type="text" 
                className="filter-select" 
                placeholder={t('hero.placeholders.field')} 
                value={searchQuery}
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ cursor: 'text' }}
              />
              <SearchIcon />

              {/* Live Autocomplete Dropdown List */}
              {showDropdown && queryLower.length > 0 && (
                <div className="autocomplete-dropdown">
                  {matchingPrograms.length > 0 && (
                    <div style={{ padding: '4px 14px', fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>
                      {t('portal.programs', 'İXTİSASLAR').toUpperCase()} ({matchingPrograms.length})
                    </div>
                  )}

                  {matchingPrograms.map((prog) => (
                    <div 
                      key={prog.id} 
                      className="autocomplete-item" 
                      onClick={() => selectAutocompleteItem(prog.title || prog.fieldOfStudy)}
                    >
                      <div className="ac-icon">
                        <BookOpenIcon />
                      </div>
                      <div className="ac-content">
                        <span className="ac-title">{prog.title}</span>
                        <span className="ac-sub">{prog.universityName ? `${prog.universityName} • ` : ''}{prog.degreeLevel}</span>
                      </div>
                    </div>
                  ))}

                  {matchingUnis.length > 0 && (
                    <div style={{ padding: '8px 14px 4px', fontSize: '0.65rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>
                      {t('matchedUniversities.badge', 'UNİVERSİTETLƏR').toUpperCase()} ({matchingUnis.length})
                    </div>
                  )}

                  {matchingUnis.map((uni) => (
                    <div 
                      key={uni.id} 
                      className="autocomplete-item" 
                      onClick={() => selectAutocompleteItem(uni.name)}
                    >
                      <div className="ac-icon">
                        <UniversityIcon />
                      </div>
                      <div className="ac-content">
                        <span className="ac-title">{uni.name}</span>
                        <span className="ac-sub">{uni.country}</span>
                      </div>
                    </div>
                  ))}

                  {matchingPrograms.length === 0 && matchingUnis.length === 0 && (
                    <div className="ac-empty">
                      {t('search.noMatchesFound', 'Uyğun ixtisas və ya universitet tapılmadı')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="btn-apply-filters" onClick={handleSearch}>
            <FilterIcon /> {t('hero.buttons.find')} ({filteredUniversities.length})
          </button>
        </div>
      </div>

      <div className="bu-grid-container">
        {isLoadingUnis ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>{t('profile.saving', 'Loading...')}</div>
        ) : filteredUniversities.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '50px 30px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '40px auto',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: '#f1f5f9', marginBottom: '20px' }}>
              <SearchXIcon />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              {t('search.noResultsTitle', 'Axtarışınıza uyğun universitet tapılmadı')}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '24px' }}>
              {t('search.noResultsDesc', 'Seçilmiş ölkə və ya ixtisas meyarlarına cavab verən universitet tapılmadı. Filtrləri sıfırlayaraq bütün universitetləri nəzərdən keçirə bilərsiniz.')}
            </p>
            <button 
              onClick={resetFilters}
              style={{
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '100px',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
              }}
            >
              {t('search.resetFiltersBtn', 'Filtrləri Sıfırla')}
            </button>
          </div>
        ) : (
          <div className="bu-grid">
            {filteredUniversities.map(uni => (
              <Link to={`/universities/${uni.id}`} key={uni.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="mu-card">
                  <div className="mu-card-img-wrapper">
                    <img src={uni.logoUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"} alt={uni.name} className="mu-card-img" />
                    <div className="mu-card-tags">
                      <div className="mu-tag-match" style={{ backgroundColor: "#10b981" }}>
                        <SparkleIcon /> 96% {t('matchedUniversities.match')}
                      </div>
                      {uni.hasScholarship && (
                        <div className="mu-tag-scholarship">
                          <ScholarshipIcon /> {t('matchedUniversities.scholarship')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mu-card-body">
                    <div className="mu-card-header">
                      <h3 className="mu-uni-name">{uni.name}</h3>
                      <span className="mu-uni-rank">{uni.ranking || (`${t('matchedUniversities.est')} ${uni.establishedYear}`)}</span>
                    </div>

                    <span className="mu-uni-location">{uni.city ? `${uni.city}, ${uni.country}` : uni.country}</span>
                    <span className="mu-uni-program">{uni.description ? uni.description.substring(0, 50) + '...' : 'Bachelor in Computer Science'}</span>

                    <div className="mu-uni-stats">
                      <div className="stat-box">
                        <span className="stat-label">{t('matchedUniversities.labels.tuition')}</span>
                        <span className="stat-val">{uni.tuition || '$6,500/yr'}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">{t('matchedUniversities.labels.acceptance')}</span>
                        <span className="stat-val">{uni.acceptanceRate || '45%'}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">{t('matchedUniversities.labels.language')}</span>
                        <span className="stat-val">{uni.teachingLanguage || 'English'}</span>
                      </div>
                    </div>

                    <div className="mu-card-footer">
                      <div className="mu-deadline">
                        <CalendarIcon /> {uni.deadline || 'Apr 30, 2025'}
                      </div>
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
