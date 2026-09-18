import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetUniversitiesQuery, useGetCountriesQuery } from '../../../services/apis/userApi';
import { checkCountryMatch, checkLanguageMatch } from '../../../utils/filterUtils';
import ScrollToTop from '../../../components/Common/ScrollToTop';
import './index.scss';

function AiDiscoveryResultsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Load user quiz selections
  const savedSelections = useMemo(() => {
    try {
      const data = localStorage.getItem('edusaz_ai_selections');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }, []);

  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('match');

  const { data: universities = [], isLoading } = useGetUniversitiesQuery(language);
  const { data: countries = [] } = useGetCountriesQuery(language);

  // Find country details if selected
  const selectedCountryObj = useMemo(() => {
    if (!savedSelections.countryTo) return null;
    return countries.find(c => 
      c.id === savedSelections.countryTo || 
      c.code === savedSelections.countryTo || 
      c.name?.toLowerCase() === (savedSelections.countryName || savedSelections.countryTo).toLowerCase()
    );
  }, [countries, savedSelections]);

  const targetCountryName = selectedCountryObj?.name || savedSelections.countryName || savedSelections.countryTo || '';
  const targetLanguageKey = savedSelections.teachingLanguage || 'all';

  // Compute matched score and filter universities
  const matchedUniversities = useMemo(() => {
    if (!universities || universities.length === 0) return [];

    let list = universities;

    // 1. Strict Country Filter (If user chose a country in step 1)
    if (savedSelections.countryTo) {
      list = list.filter(uni => checkCountryMatch(uni, savedSelections.countryTo, countries));
    }

    // 2. Teaching Language Filter (If user chose a specific language in step 2)
    if (targetLanguageKey && targetLanguageKey !== 'all') {
      list = list.filter(uni => checkLanguageMatch(uni, targetLanguageKey));
    }

    // Calculate match score
    list = list.map((uni) => {
      let score = 88; // baseline compatibility

      if (uni.hasScholarship) score += 6;
      if (uni.ranking && parseInt(uni.ranking) < 500) score += 4;
      score = Math.min(99, Math.max(75, Math.round(score)));

      return {
        ...uni,
        matchScore: score,
      };
    });

    // Secondary Filter pills
    if (activeFilter === 'scholarship') {
      list = list.filter((u) => u.hasScholarship);
    } else if (activeFilter === 'english') {
      list = list.filter((u) => (u.teachingLanguage || '').toLowerCase().includes('eng') || (u.teachingLanguage || '').toLowerCase().includes('ingilis'));
    }

    // Sort
    if (sortBy === 'match') {
      list.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'ranking') {
      list.sort((a, b) => (parseInt(a.ranking) || 999) - (parseInt(b.ranking) || 999));
    }

    return list;
  }, [universities, savedSelections, selectedCountryObj, targetLanguageKey, activeFilter, sortBy]);

  const bestMatch = matchedUniversities[0];
  const scholarshipCount = matchedUniversities.filter((u) => u.hasScholarship).length;

  return (
    <div className="results-page">
      <ScrollToTop />

      {/* Top Header Section */}
      <section className="results-header-section">
        <div className="results-header-content">
          <div className="ai-label">
            <span className="brain-icon">🧠</span> {t('aiDiscovery.analyzed', 'AI sizin profilinizi analiz etdi')}
          </div>
          <div className="header-title-row">
            <h1>
              {isLoading ? (
                t('common.loading', 'Universitetlər hesablanır...')
              ) : (
                <>{t('aiDiscovery.foundCountPrefix', 'Sizin üçün')} <span>{matchedUniversities.length} {t('topDestinations.countSuffix', 'universitet')}</span> {t('aiDiscovery.foundCountSuffix', 'tapıldı')}</>
              )}
            </h1>
            <button className="btn-refine" onClick={() => navigate('/ai-discovery')}>
              <span className="filter-icon">⚙️</span> {t('aiDiscovery.refine', 'Yenidən Seç')}
            </button>
          </div>
          <p className="summary-text">
            {[targetCountryName, savedSelections.languageName || (targetLanguageKey === 'all' ? t('aiDiscovery.languages.all', 'Bütün Dillər') : targetLanguageKey)].filter(Boolean).join(' · ')}
          </p>

          {/* Highlights Row */}
          {!isLoading && matchedUniversities.length > 0 && (
            <div className="highlights-row">
              {bestMatch && (
                <div className="highlight-item">
                  <div className="hl-icon">🏆</div>
                  <div className="hl-text">
                    <span className="hl-title">{t('aiDiscovery.bestMatch', 'Ən Yüksək Uyğunluq')}</span>
                    <span className="hl-value">{bestMatch.name} · {bestMatch.matchScore}%</span>
                  </div>
                </div>
              )}
              <div className="highlight-item">
                <div className="hl-icon">🎓</div>
                <div className="hl-text">
                  <span className="hl-title">{t('aiDiscovery.scholarshipOpportunities', 'Təqaüd İmkanları')}</span>
                  <span className="hl-value">{scholarshipCount} {t('topDestinations.countSuffix', 'universitetdə mövcuddur')}</span>
                </div>
              </div>
              {targetCountryName && (
                <div className="highlight-item">
                  <div className="hl-icon">🌍</div>
                  <div className="hl-text">
                    <span className="hl-title">{t('common.country', 'Ölkə')}</span>
                    <span className="hl-value">{targetCountryName}</span>
                  </div>
                </div>
              )}
              <div className="highlight-item">
                <div className="hl-icon">🗣️</div>
                <div className="hl-text">
                  <span className="hl-title">{t('matchedUniversities.labels.language', 'Tədris Dili')}</span>
                  <span className="hl-value">{savedSelections.languageName || t('aiDiscovery.languages.all', 'Bütün Dillər')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="results-main-section">
        <div className="results-layout">
          {/* List Column */}
          <div className="results-list-column">
            {/* Filter Pills */}
            <div className="filters-bar">
              <div className="filter-pills">
                <button
                  className={`pill ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  {t('portal.all', 'Hamısı')}
                </button>
                <button
                  className={`pill ${activeFilter === 'scholarship' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('scholarship')}
                >
                  <span className="emoji">🎓</span> {t('matchedUniversities.tags.scholarship', 'Təqaüdlü')}
                </button>
                <button
                  className={`pill ${activeFilter === 'english' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('english')}
                >
                  <span className="emoji">🇬🇧</span> {t('aiDiscovery.languages.english', 'İngilis Dili')}
                </button>
              </div>
              <div className="sort-by">
                <label>{t('matchedUniversities.sortBy', 'Sırala')}:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="match">{t('aiDiscovery.sortMatch', 'AI Uyğunluq Balı')}</option>
                  <option value="ranking">{t('aiDiscovery.sortRanking', 'Reytinq üzrə')}</option>
                </select>
              </div>
            </div>

            {/* University Cards */}
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                {t('common.loading', 'Universitetlər yüklənir...')}
              </div>
            ) : matchedUniversities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                {t('matchedUniversities.noResults', 'Seçilmiş filtrlərə uyğun universitet tapılmadı.')}
              </div>
            ) : (
              <div className="university-cards-list">
                {matchedUniversities.map((uni, idx) => (
                  <Link
                    to={`/universities/${uni.id}`}
                    key={uni.id}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="uni-card">
                      <div
                        className="uni-image"
                        style={{
                          backgroundImage: `url(${
                            uni.logoUrl ||
                            'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80'
                          })`,
                        }}
                      >
                        {uni.hasScholarship && (
                          <div className="badge-scholarship">🎓 {t('matchedUniversities.tags.scholarship', 'Təqaüd var')}</div>
                        )}
                      </div>
                      <div className="uni-info">
                        <div className="uni-top-row">
                          <div className="match-badge">
                            ⭐ {uni.matchScore}% {t('matchedUniversities.matchBadge', 'Uyğunluq')} <span className="rank-num">#{idx + 1}</span>
                          </div>
                        </div>
                        <h3>{uni.name}</h3>
                        <p className="location">
                          {[uni.city, uni.country].filter(Boolean).join(', ')}
                          {uni.ranking ? ` · #${uni.ranking}` : ''}
                        </p>
                        {uni.description && (
                          <div className="program-name">
                            {uni.description.slice(0, 85)}...
                          </div>
                        )}

                        <div className="uni-stats">
                          {uni.tuition && (
                            <div className="stat">
                              <span className="label">{t('matchedUniversities.labels.tuition', 'Ödəniş')}</span>
                              <span className="val">{uni.tuition}</span>
                            </div>
                          )}
                          {uni.acceptanceRate && (
                            <div className="stat">
                              <span className="label">{t('matchedUniversities.labels.acceptance', 'Qəbul')}</span>
                              <span className="val">{uni.acceptanceRate}</span>
                            </div>
                          )}
                          {uni.teachingLanguage && (
                            <div className="stat">
                              <span className="label">{t('matchedUniversities.labels.language', 'Tədris Dili')}</span>
                              <span className="val">{uni.teachingLanguage}</span>
                            </div>
                          )}
                        </div>

                        <div className="uni-tags">
                          {uni.teachingLanguage && <span className="tag">{uni.teachingLanguage}</span>}
                          {uni.hasScholarship && <span className="tag">{t('matchedUniversities.tags.scholarship', 'Təqaüd proqramı')}</span>}
                          {uni.establishedYear && (
                            <span className="tag">{t('matchedUniversities.est', 'Qurulma')}: {uni.establishedYear}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AiDiscoveryResultsPage;
