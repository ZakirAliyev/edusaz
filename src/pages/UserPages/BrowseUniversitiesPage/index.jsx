import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Compass, GraduationCap, MapPin, RotateCcw, SearchX } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetUniversitiesQuery, useGetCountriesQuery } from '../../../services/apis/userApi';
import { checkCountryMatch, checkLanguageMatch } from '../../../utils/filterUtils';
import { resolveMediaUrl } from '../../../config/env';
import './index.scss';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=70';

const onImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
};

const TEACHING_LANGUAGES = [
  { id: 'All', key: 'all', name: 'Bütün dillər' },
  { id: 'en', key: 'english', name: 'İngilis dili' },
  { id: 'tr', key: 'turkish', name: 'Türk dili' },
  { id: 'az', key: 'azerbaijani', name: 'Azərbaycan dili' },
  { id: 'de', key: 'german', name: 'Alman dili' },
  { id: 'ru', key: 'russian', name: 'Rus dili' }
];

const SKELETON_COUNT = 6;

function UniversityCard({ uni, index }) {
  const { t } = useTranslation();
  const cover = resolveMediaUrl(uni.images?.[0] || uni.logoUrl) || FALLBACK_IMAGE;
  const location = [uni.city, uni.country].filter(Boolean).join(', ');
  const mainLanguage = uni.teachingLanguage ? uni.teachingLanguage.split(/[,/]/)[0].trim() : '';

  return (
    <li className="bu-grid__item" data-reveal style={{ '--delay': `${Math.min(index % 6, 5) * 60}ms` }}>
      <Link to={`/universities/${uni.id}`} className="bu-card ds-card ds-card--interactive">
        <span className="bu-card__media">
          <img src={cover} onError={onImgError} alt="" loading="lazy" />
          {uni.hasScholarship && (
            <span className="bu-card__badge">
              <GraduationCap aria-hidden />
              {t('matchedUniversities.tags.scholarship', 'Təqaüdlü')}
            </span>
          )}
        </span>

        <span className="bu-card__body">
          <span className="bu-card__name">{uni.name}</span>
          {location && (
            <span className="bu-card__place">
              <MapPin aria-hidden />
              {location}
            </span>
          )}

          {(uni.ranking || uni.establishedYear) && (
            <span className="bu-card__meta">
              {uni.ranking && <span className="bu-card__rank">{uni.ranking}</span>}
              {uni.establishedYear && (
                <span>
                  {t('matchedUniversities.est', 'Əsası qoyulub:')} {uni.establishedYear}
                </span>
              )}
            </span>
          )}

          <span className="bu-card__spacer" aria-hidden />
          <span className="bu-card__facts">
            <span className="bu-card__fact">
              <small>{t('matchedUniversities.labels.tuition', 'Təhsil haqqı')}</small>
              <span>{uni.tuition || '—'}</span>
            </span>
            <span className="bu-card__fact">
              <small>{t('matchedUniversities.labels.acceptance', 'Qəbul faizi')}</small>
              <span>{uni.acceptanceRate || '—'}</span>
            </span>
            <span className="bu-card__fact">
              <small>{t('matchedUniversities.labels.language', 'Tədris dili')}</small>
              <span title={uni.teachingLanguage || undefined}>{mainLanguage || '—'}</span>
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

function BrowseUniversitiesPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const { data: universities = [], isLoading: isLoadingUnis } = useGetUniversitiesQuery(language);
  const { data: countries = [] } = useGetCountriesQuery(language);

  const initialCountry = searchParams.get('country') || 'All';
  const initialLang = searchParams.get('lang') || 'All';

  const [appliedFilters, setAppliedFilters] = useState({ country: initialCountry, language: initialLang });

  // Keep filters in sync with ?country=&lang= (e.g. coming from the landing search).
  useEffect(() => {
    const cParam = searchParams.get('country') || 'All';
    const lParam = searchParams.get('lang') || 'All';
    setAppliedFilters({ country: cParam, language: lParam });
  }, [searchParams]);

  const setFilter = (key, value) => {
    setAppliedFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setAppliedFilters({ country: 'All', language: 'All' });
  };

  const hasActiveFilters = appliedFilters.country !== 'All' || appliedFilters.language !== 'All';

  // The URL may carry a country id or code; show the matching option in the select.
  const countryValue = useMemo(() => {
    const active = String(appliedFilters.country);
    if (active === 'All') return 'All';
    const match = countries.find(
      (c) => String(c.id) === active || (c.code && c.code.toLowerCase() === active.toLowerCase())
    );
    return match ? match.id : 'All';
  }, [appliedFilters.country, countries]);

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
    <main className="ds-page bu-page" id="browse-universities-page">
      <div className="ds-container">
        <header className="ds-page-header bu-header">
          <p className="ds-eyebrow">{t('matchedUniversities.badge', 'Universitetlər')}</p>
          <h1 className="ds-title">{t('pages.universities.title', 'Xaricdə təhsil üçün universitetlər')}</h1>
          <p className="ds-lead">
            {t(
              'pages.universities.lead',
              'Ölkəyə və tədris dilinə görə seçin, təhsil haqqını və qəbul faizini müqayisə edin, bəyəndiyiniz universitetə birbaşa müraciət edin.'
            )}
          </p>
        </header>

        <section className="bu-filters" aria-label={t('pages.universities.filters', 'Filtrlər')} data-reveal>
          <div className="bu-filters__fields">
            <div className="ds-field bu-filters__field">
              <label className="ds-label" htmlFor="bu-country">
                {t('pages.universities.country', 'Ölkə')}
              </label>
              <select
                id="bu-country"
                className="ds-select"
                value={countryValue}
                onChange={(e) => setFilter('country', e.target.value)}
              >
                <option value="All">{t('pages.universities.allCountries', 'Bütün ölkələr')}</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.flagEmoji ? `${c.flagEmoji} ` : ''}{c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ds-field bu-filters__field">
              <label className="ds-label" htmlFor="bu-language">
                {t('matchedUniversities.labels.language', 'Tədris dili')}
              </label>
              <select
                id="bu-language"
                className="ds-select"
                value={appliedFilters.language}
                onChange={(e) => setFilter('language', e.target.value)}
              >
                {TEACHING_LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {t(`aiDiscovery.languages.${lang.key}`, lang.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bu-filters__side">
            <p className="bu-filters__count" aria-live="polite">
              {isLoadingUnis ? (
                <span className="ds-skeleton bu-filters__count-skeleton" aria-hidden />
              ) : (
                t('pages.universities.count', '{{count}} universitet', { count: filteredUniversities.length })
              )}
            </p>
            {hasActiveFilters && (
              <button type="button" className="ds-btn ds-btn--ghost ds-btn--sm" onClick={resetFilters}>
                <RotateCcw aria-hidden />
                {t('pages.universities.reset', 'Sıfırla')}
              </button>
            )}
            <Link to="/ai-discovery" className="ds-btn ds-btn--soft ds-btn--sm">
              <Compass aria-hidden />
              {t('pages.universities.discovery', 'Mənə uyğun olanı tap')}
            </Link>
          </div>
        </section>

        {isLoadingUnis ? (
          <ul className="bu-grid" aria-busy="true" aria-label={t('common.loading', 'Yüklənir...')}>
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <li key={i} className="bu-grid__item">
                <div className="bu-card bu-card--skeleton ds-card" aria-hidden>
                  <span className="bu-card__media ds-skeleton" />
                  <span className="bu-card__body">
                    <span className="ds-skeleton bu-sk bu-sk--title" />
                    <span className="ds-skeleton bu-sk bu-sk--line" />
                    <span className="ds-skeleton bu-sk bu-sk--facts" />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : filteredUniversities.length === 0 ? (
          <div className="ds-empty bu-empty">
            <SearchX aria-hidden />
            <strong>{t('matchedUniversities.noResults', 'Seçilmiş filtrlərə uyğun universitet tapılmadı.')}</strong>
            {hasActiveFilters && (
              <p>{t('pages.universities.emptyHint', 'Başqa ölkə və ya tədris dili seçin.')}</p>
            )}
            {hasActiveFilters && (
              <button type="button" className="ds-btn ds-btn--secondary" onClick={resetFilters}>
                {t('pages.universities.showAll', 'Bütün universitetləri göstər')}
                <ArrowRight aria-hidden className="bu-flip" />
              </button>
            )}
          </div>
        ) : (
          <ul className="bu-grid">
            {filteredUniversities.map((uni, i) => (
              <UniversityCard key={uni.id} uni={uni} index={i} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default BrowseUniversitiesPage;
