import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, GraduationCap, Languages, MapPin, PencilLine, School, SearchX } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetUniversitiesQuery, useGetCountriesQuery } from '../../../services/apis/userApi';
import { checkCountryMatch, checkLanguageMatch } from '../../../utils/filterUtils';
import ScrollToTop from '../../../components/Common/ScrollToTop';
import './index.scss';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80';

// Rankings arrive as free text ("#25 Global", "Top 5 National"), so read the first number.
const parseRank = (ranking) => {
  const match = String(ranking ?? '').match(/\d+/);
  return match ? parseInt(match[0], 10) : NaN;
};

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
      if (parseRank(uni.ranking) < 500) score += 4;
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
      list.sort((a, b) => (parseRank(a.ranking) || 999) - (parseRank(b.ranking) || 999));
    }

    return list;
  }, [universities, savedSelections, countries, targetLanguageKey, activeFilter, sortBy]);

  const bestMatch = matchedUniversities[0];
  const scholarshipCount = matchedUniversities.filter((u) => u.hasScholarship).length;
  const languageLabel = savedSelections.languageName
    ? t(`aiDiscovery.languages.${{ en: 'english', tr: 'turkish', az: 'azerbaijani', de: 'german', ru: 'russian', all: 'all' }[targetLanguageKey] || 'all'}`, savedSelections.languageName)
    : t('aiDiscovery.languages.all', 'Bütün Dillər');
  const estLabel = t('matchedUniversities.est', 'Əsası qoyulub').replace(/:\s*$/, '');
  const editAnswers = () => navigate('/ai-discovery');

  const filters = [
    { key: 'all', label: t('portal.all', 'Hamısı') },
    { key: 'scholarship', label: t('matchedUniversities.tags.scholarship', 'Təqaüdlü'), icon: GraduationCap },
    { key: 'english', label: t('aiDiscovery.languages.english', 'İngilis Dili'), icon: Languages },
  ];

  return (
    <main className="ds-page gr-page">
      <ScrollToTop />
      <div className="ds-container">
        {/* Header: result count + the answers that produced it */}
        <header className="ds-page-header gr-header" data-reveal>
          <span className="ds-eyebrow">{t('pages.matchResults.eyebrow', 'Uyğunluq testinin nəticələri')}</span>
          <h1 className="ds-title gr-header__title">
            {isLoading ? (
              t('common.loading', 'Yüklənir...')
            ) : (
              <>
                {t('aiDiscovery.foundCountPrefix', 'Sizin üçün')}{' '}
                <span className="gr-header__count">
                  {matchedUniversities.length} {t('topDestinations.countSuffix', 'universitet')}
                </span>{' '}
                {t('aiDiscovery.foundCountSuffix', 'tapıldı')}
              </>
            )}
          </h1>

          <div className="gr-answers">
            <span className="gr-answers__label">{t('pages.matchResults.yourAnswers', 'Cavablarınız')}</span>
            <ul className="gr-answers__list">
              <li className="gr-answer">
                <MapPin aria-hidden />
                <span className="gr-sr-only">{t('common.country', 'Ölkə')}: </span>
                {targetCountryName || t('pages.matchResults.anyCountry', 'İstənilən ölkə')}
              </li>
              <li className="gr-answer">
                <Languages aria-hidden />
                <span className="gr-sr-only">{t('matchedUniversities.labels.language', 'Tədris dili')}: </span>
                {languageLabel}
              </li>
            </ul>
            <button type="button" className="ds-btn ds-btn--secondary ds-btn--sm gr-answers__edit" onClick={editAnswers}>
              <PencilLine aria-hidden />
              {t('pages.matchResults.editAnswers', 'Cavabları dəyiş')}
            </button>
          </div>
        </header>

        {/* Short summary */}
        {!isLoading && matchedUniversities.length > 0 && (
          <dl className="gr-summary" data-reveal>
            {bestMatch && (
              <div className="gr-summary__item">
                <dt>{t('aiDiscovery.bestMatch', 'Ən Yüksək Uyğunluq')}</dt>
                <dd>
                  <Link to={`/universities/${bestMatch.id}`} className="gr-summary__link">{bestMatch.name}</Link>
                  <span className="gr-summary__score">{bestMatch.matchScore}%</span>
                </dd>
              </div>
            )}
            <div className="gr-summary__item">
              <dt>{t('aiDiscovery.scholarshipOpportunities', 'Təqaüd İmkanları')}</dt>
              <dd>
                {scholarshipCount} {t('topDestinations.countSuffix', 'universitet')}
              </dd>
            </div>
          </dl>
        )}

        {/* Toolbar: quick filters + sort */}
        <div className="gr-toolbar" data-reveal>
          <div className="gr-toolbar__filters" role="group" aria-label={t('pages.matchResults.filters', 'Filtrlər')}>
            {filters.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className="ds-chip"
                aria-pressed={activeFilter === key}
                onClick={() => setActiveFilter(key)}
              >
                {Icon && <Icon aria-hidden className="gr-chip-icon" />}
                {label}
              </button>
            ))}
          </div>
          <div className="gr-toolbar__sort">
            <label htmlFor="gr-sort" className="gr-toolbar__sort-label">
              {t('matchedUniversities.sortBy', 'Sırala')}
            </label>
            <select id="gr-sort" className="ds-select gr-toolbar__select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="match">{t('pages.matchResults.sortMatch', 'Uyğunluq balı üzrə')}</option>
              <option value="ranking">{t('aiDiscovery.sortRanking', 'Reytinq üzrə')}</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <ul className="gr-list" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="ds-card gr-card gr-card--skeleton" aria-hidden>
                <div className="ds-skeleton gr-card__media" />
                <div className="gr-card__body">
                  <div className="ds-skeleton" style={{ height: 18, width: '55%' }} />
                  <div className="ds-skeleton" style={{ height: 14, width: '35%' }} />
                  <div className="ds-skeleton" style={{ height: 14, width: '80%' }} />
                </div>
              </li>
            ))}
          </ul>
        ) : matchedUniversities.length === 0 ? (
          <div className="ds-empty gr-empty">
            <SearchX aria-hidden />
            <strong>{t('matchedUniversities.noResults', 'Seçilmiş filtrlərə uyğun universitet tapılmadı.')}</strong>
            <p>{t('pages.matchResults.emptyHint', 'Başqa ölkə və ya tədris dili seçərək yenidən yoxlayın.')}</p>
            <div className="gr-empty__actions">
              {activeFilter !== 'all' && (
                <button type="button" className="ds-btn ds-btn--secondary" onClick={() => setActiveFilter('all')}>
                  {t('pages.matchResults.clearFilter', 'Filtri sıfırla')}
                </button>
              )}
              <button type="button" className="ds-btn ds-btn--primary" onClick={editAnswers}>
                <PencilLine aria-hidden />
                {t('pages.matchResults.editAnswers', 'Cavabları dəyiş')}
              </button>
              <Link to="/universities" className="ds-btn ds-btn--ghost">
                {t('matchedUniversities.browseAll', 'Hamısına bax')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="gr-count" aria-live="polite">
              {matchedUniversities.length} {t('topDestinations.countSuffix', 'universitet')}
            </p>
            <ol className="gr-list">
              {matchedUniversities.map((uni, idx) => (
                <li key={uni.id} data-reveal style={{ '--delay': `${Math.min(idx, 5) * 60}ms` }}>
                  <Link to={`/universities/${uni.id}`} className="ds-card ds-card--interactive gr-card">
                    <div className="gr-card__media">
                      <School aria-hidden className="gr-card__placeholder" />
                      <img
                        src={uni.logoUrl || FALLBACK_IMAGE}
                        alt=""
                        loading="lazy"
                        onError={(e) => { e.currentTarget.hidden = true; }}
                      />
                      <span className="gr-card__rank">#{idx + 1}</span>
                    </div>

                    <div className="gr-card__body">
                      <div className="gr-card__head">
                        <div className="gr-card__titles">
                          <h2 className="gr-card__name">{uni.name}</h2>
                          <p className="gr-card__place">
                            <MapPin aria-hidden />
                            <span>{[uni.city, uni.country].filter(Boolean).join(', ')}</span>
                            {uni.ranking && <span className="gr-card__ranking">· {uni.ranking}</span>}
                          </p>
                        </div>
                        <div className="gr-score">
                          <span className="gr-score__value">{uni.matchScore}%</span>
                          <span className="gr-score__label">{t('matchedUniversities.matchBadge', 'Uyğunluq')}</span>
                          <span className="gr-score__track" aria-hidden>
                            <span className="gr-score__fill" style={{ width: `${uni.matchScore}%` }} />
                          </span>
                        </div>
                      </div>

                      {uni.description && <p className="gr-card__desc">{uni.description}</p>}

                      {(uni.tuition || uni.acceptanceRate || uni.teachingLanguage) && (
                        <dl className="gr-card__facts">
                          {uni.tuition && (
                            <div>
                              <dt>{t('matchedUniversities.labels.tuition', 'Ödəniş')}</dt>
                              <dd>{uni.tuition}</dd>
                            </div>
                          )}
                          {uni.acceptanceRate && (
                            <div>
                              <dt>{t('matchedUniversities.labels.acceptance', 'Qəbul')}</dt>
                              <dd>{uni.acceptanceRate}</dd>
                            </div>
                          )}
                          {uni.teachingLanguage && (
                            <div>
                              <dt>{t('matchedUniversities.labels.language', 'Tədris Dili')}</dt>
                              <dd>{uni.teachingLanguage}</dd>
                            </div>
                          )}
                        </dl>
                      )}

                      <div className="gr-card__foot">
                        <div className="gr-card__tags">
                          {uni.hasScholarship && (
                            <span className="ds-badge ds-badge--success">
                              {t('matchedUniversities.tags.scholarship', 'Təqaüd proqramı')}
                            </span>
                          )}
                          {uni.establishedYear && (
                            <span className="ds-badge">{estLabel} {uni.establishedYear}</span>
                          )}
                        </div>
                        <span className="gr-card__cta">
                          {t('pages.matchResults.viewUniversity', 'Universitetə bax')}
                          <ArrowRight aria-hidden className="gr-flip" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </main>
  );
}

export default AiDiscoveryResultsPage;
