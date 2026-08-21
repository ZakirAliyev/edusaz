import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    <div className="dp-page">
      <ScrollToTop />

      {/* Header */}
      <div className="dp-header">
        <div className="dp-header-inner">
          <span className="dp-badge">🌍 {t('topDestinations.badge') || 'Ölkələr'}</span>
          <h1>{t('topDestinations.title') || 'Dünya üzrə Təhsil Mərkəzləri'}</h1>
          <p>{t('topDestinations.subtitle') || 'Xarici ölkələrdəki universitet və kurs imkanlarını kəşf et'}</p>

          {/* Search */}
          <div className="dp-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder={t('common.search') || 'Ölkə axtar...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="dp-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Country Grid */}
      <div className="dp-body">
        {isLoading ? (
          <div className="dp-loading">
            <div className="dp-spinner" />
            <p>Yüklənir...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="dp-empty">
            <span>🔍</span>
            <p>Heç bir ölkə tapılmadı.</p>
          </div>
        ) : (
          <div className="dp-grid">
            {filtered.map((country) => (
              <Link
                key={country.id}
                to={`/destinations/${country.code || country.id}`}
                className="dp-card"
              >
                <span className="dp-flag">{country.flagEmoji || '🌐'}</span>
                <div className="dp-card-info">
                  <span className="dp-name">{country.name}</span>
                  {country.universityCount > 0 && (
                    <span className="dp-count">{country.universityCount} universitet</span>
                  )}
                </div>
                <svg className="dp-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DestinationsPage;
