import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetUniversitiesQuery } from '../../../services/apis/userApi';
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

  // Compute matched score and format summary
  const summaryParts = [
    savedSelections.fieldOfStudy || 'General',
    savedSelections.countryTo || savedSelections.countryFrom || 'Global',
    savedSelections.educationLevel || 'Bachelor',
    savedSelections.budget || 'Flexible Budget',
  ].filter(Boolean);

  const matchedUniversities = useMemo(() => {
    if (!universities || universities.length === 0) return [];

    let list = universities.map((uni, idx) => {
      let score = 98 - idx * 4;
      if (savedSelections.countryTo && uni.country?.toLowerCase().includes(savedSelections.countryTo.toLowerCase())) {
        score += 5;
      }
      if (uni.hasScholarship) score += 3;
      score = Math.min(99, Math.max(70, score));

      return {
        ...uni,
        matchScore: score,
      };
    });

    // Filter pills
    if (activeFilter === 'scholarship') {
      list = list.filter((u) => u.hasScholarship);
    } else if (activeFilter === 'english') {
      list = list.filter((u) => u.teachingLanguage?.toLowerCase().includes('eng') || !u.teachingLanguage);
    }

    // Sort
    if (sortBy === 'match') {
      list.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'ranking') {
      list.sort((a, b) => (parseInt(a.ranking) || 999) - (parseInt(b.ranking) || 999));
    }

    return list;
  }, [universities, savedSelections, activeFilter, sortBy]);

  const bestMatch = matchedUniversities[0];
  const scholarshipCount = universities.filter((u) => u.hasScholarship).length;

  return (
    <div className="results-page">
      <ScrollToTop />

      {/* Top Header Section */}
      <section className="results-header-section">
        <div className="results-header-content">
          <div className="ai-label">
            <span className="brain-icon">🧠</span> {t('aiDiscovery.analyzed') || 'AI sizin profilinizi analiz etdi'}
          </div>
          <div className="header-title-row">
            <h1>
              {isLoading ? (
                'Universitetlər hesablanır...'
              ) : (
                <>Sizin üçün <span>{matchedUniversities.length} universitet</span> tapıldı</>
              )}
            </h1>
            <button className="btn-refine" onClick={() => navigate('/ai-discovery')}>
              <span className="filter-icon">⚙️</span> {t('aiDiscovery.refine') || 'Yenidən Seç'}
            </button>
          </div>
          <p className="summary-text">{summaryParts.join(' · ')}</p>

          {/* Highlights Row */}
          {!isLoading && matchedUniversities.length > 0 && (
            <div className="highlights-row">
              {bestMatch && (
                <div className="highlight-item">
                  <div className="hl-icon">🏆</div>
                  <div className="hl-text">
                    <span className="hl-title">Ən Yüksək Uyğunluq</span>
                    <span className="hl-value">{bestMatch.name} · {bestMatch.matchScore}%</span>
                  </div>
                </div>
              )}
              <div className="highlight-item">
                <div className="hl-icon">🎓</div>
                <div className="hl-text">
                  <span className="hl-title">Təqaüd İmkanları</span>
                  <span className="hl-value">{scholarshipCount} universitetdə mövcuddur</span>
                </div>
              </div>
              <div className="highlight-item">
                <div className="hl-icon">🌍</div>
                <div className="hl-text">
                  <span className="hl-title">Ölkə Seçimi</span>
                  <span className="hl-value">{savedSelections.countryTo || 'Beynəlxalq'}</span>
                </div>
              </div>
              <div className="highlight-item">
                <div className="hl-icon">⚡</div>
                <div className="hl-text">
                  <span className="hl-title">Tədris Dərəcəsi</span>
                  <span className="hl-value">{savedSelections.educationLevel || 'Bakalavr'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="results-main-section">
        <div className="results-layout">
          {/* Left Column - List */}
          <div className="results-list-column">
            {/* Filter Pills */}
            <div className="filters-bar">
              <div className="filter-pills">
                <button
                  className={`pill ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  Hamısı
                </button>
                <button
                  className={`pill ${activeFilter === 'scholarship' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('scholarship')}
                >
                  <span className="emoji">🎓</span> Təqaüdlü
                </button>
                <button
                  className={`pill ${activeFilter === 'english' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('english')}
                >
                  <span className="emoji">🇬🇧</span> İngilis Dili
                </button>
              </div>
              <div className="sort-by">
                <label>Sırala:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="match">AI Uyğunluq Balı</option>
                  <option value="ranking">Reytinq üzrə</option>
                </select>
              </div>
            </div>

            {/* University Cards */}
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                Universitetlər yüklənir...
              </div>
            ) : matchedUniversities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                Seçilmiş filtrlərə uyğun universitet tapılmadı.
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
                          <div className="badge-scholarship">🎓 Təqaüd var</div>
                        )}
                      </div>
                      <div className="uni-info">
                        <div className="uni-top-row">
                          <div className="match-badge">
                            ⭐ {uni.matchScore}% Uyğunluq <span className="rank-num">#{idx + 1}</span>
                          </div>
                        </div>
                        <h3>{uni.name}</h3>
                        <p className="location">
                          {[uni.city, uni.country].filter(Boolean).join(', ')}
                          {uni.ranking ? ` · ${uni.ranking}` : ''}
                        </p>
                        {uni.description && (
                          <div className="program-name">
                            {uni.description.slice(0, 80)}...
                          </div>
                        )}

                        <div className="uni-stats">
                          {uni.tuition && (
                            <div className="stat">
                              <span className="label">Ödəniş</span>
                              <span className="val">{uni.tuition}</span>
                            </div>
                          )}
                          {uni.acceptanceRate && (
                            <div className="stat">
                              <span className="label">Qəbul</span>
                              <span className="val">{uni.acceptanceRate}</span>
                            </div>
                          )}
                          {uni.teachingLanguage && (
                            <div className="stat">
                              <span className="label">Tədris Dili</span>
                              <span className="val">{uni.teachingLanguage}</span>
                            </div>
                          )}
                        </div>

                        <div className="uni-tags">
                          {uni.teachingLanguage && <span className="tag">{uni.teachingLanguage}</span>}
                          {uni.hasScholarship && <span className="tag">Təqaüd proqramı</span>}
                          {uni.establishedYear && (
                            <span className="tag">Qurulma: {uni.establishedYear}</span>
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
