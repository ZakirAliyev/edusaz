import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Building2, Globe2, Search, SearchX, Wallet, X } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetCountriesQuery } from '../../../services/apis/userApi';
import ScrollToTop from '../../../components/Common/ScrollToTop';
import './index.scss';

function DestinationsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const { data: countries = [], isLoading } = useGetCountriesQuery(language);

  const filtered = countries.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="ds-page dp-page">
      <ScrollToTop />
      <div className="ds-container">
        <header className="ds-page-header dp-header" data-reveal>
          <span className="ds-eyebrow">{t('topDestinations.badge', 'Ölkələr')}</span>
          <div className="dp-header__row">
            <div className="dp-header__text">
              <h1 className="ds-title">{t('topDestinations.title', 'Dünya üzrə Təhsil Mərkəzləri')}</h1>
              <p className="ds-lead">
                {t('topDestinations.subtitle', 'Xarici ölkələrdəki universitet və kurs imkanlarını kəşf et')}
              </p>
            </div>

            <div className="dp-search">
              <label htmlFor="dp-search-input" className="dp-sr-only">
                {t('common.search', 'Ölkə axtar...')}
              </label>
              <Search aria-hidden className="dp-search__icon" />
              <input
                id="dp-search-input"
                type="search"
                className="ds-input dp-search__input"
                placeholder={t('common.search', 'Ölkə axtar...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="dp-search__clear"
                  onClick={() => setSearch('')}
                  aria-label={t('pages.destinations.clearSearch', 'Axtarışı təmizlə')}
                >
                  <X aria-hidden />
                </button>
              )}
            </div>
          </div>
        </header>

        {!isLoading && countries.length > 0 && (
          <p className="dp-count ds-muted" aria-live="polite">
            {t('pages.destinations.count', '{{count}} ölkə', { count: filtered.length })}
          </p>
        )}

        {isLoading ? (
          <ul className="dp-grid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} aria-hidden>
                <span className="ds-skeleton dp-skeleton" />
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <div className="ds-empty dp-empty">
            {countries.length === 0 ? <Globe2 aria-hidden /> : <SearchX aria-hidden />}
            <strong>{t('pages.destinations.notFound', 'Heç bir ölkə tapılmadı.')}</strong>
            {search && (
              <button type="button" className="ds-btn ds-btn--secondary ds-btn--sm" onClick={() => setSearch('')}>
                {t('pages.destinations.clearSearch', 'Axtarışı təmizlə')}
              </button>
            )}
          </div>
        ) : (
          <ul className="dp-grid">
            {filtered.map((country, i) => (
              <li key={country.id} data-reveal style={{ '--delay': `${Math.min(i % 3, 5) * 60}ms` }}>
                <Link to={`/destinations/${country.code || country.id}`} className="dp-card">
                  {/* Countries have no photos of their own, so the card leads with the flag. */}
                  <span className="dp-card__top">
                    <span className="dp-card__flag" aria-hidden>
                      {country.flagEmoji || <Globe2 />}
                    </span>
                    {country.label && <span className="ds-badge ds-badge--brand dp-card__label">{country.label}</span>}
                    <ArrowUpRight aria-hidden className="dp-card__arrow" />
                  </span>
                  <span className="dp-card__body">
                    <span className="dp-card__name">{country.name}</span>
                    <span className="dp-card__meta">
                      <span>
                        <Building2 aria-hidden />
                        {t('landing.destinations.count', '{{count}} universitet', { count: country.universityCount || 0 })}
                      </span>
                      {country.averageCost && (
                        <span>
                          <Wallet aria-hidden />
                          <span className="dp-sr-only">{t('landing.destinations.cost', 'Orta xərc')}: </span>
                          {country.averageCost}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default DestinationsPage;
