import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetCountriesQuery } from '../../../services/apis/userApi';
import './index.scss';

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const fallbackImages = {
  az: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
  tr: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
  de: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=800&q=80',
  uk: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  ca: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80',
  my: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
  pl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  hu: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  it: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=800&q=80',
  ae: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
};

function DestinationsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: apiCountries = [], isLoading } = useGetCountriesQuery(language);

  const handleImageError = (e, code) => {
    if (fallbackImages[code] && e.target.src !== fallbackImages[code]) {
      e.target.src = fallbackImages[code];
    } else {
      e.target.style.display = 'none';
    }
  };

  return (
    <div className="destinations-page">
      <div className="dp-header">
        <span className="dp-badge">
          <GlobeIcon />
          {t('topDestinations.badge')}
        </span>
        <h1 className="dp-title">
          {t('topDestinations.title')}
        </h1>
        <p className="dp-subtitle">
          {t('hero.subtitle')}
        </p>
      </div>

      <div className="dp-grid-wrapper">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading backend destinations...</div>
        ) : (
          <div className="dp-grid">
            {apiCountries.map(dest => (
              <div key={dest.id} className="dp-card">
                <div className="dp-card-img-container">
                  <img
                    src={dest.imageUrl || fallbackImages[dest.code]}
                    alt={dest.name}
                    className="dp-card-img"
                    onError={(e) => handleImageError(e, dest.code)}
                  />
                </div>
                <div className="dp-card-content">
                  <div className="dp-card-header">
                    <div className="dp-country">
                      <span className="dp-flag">{dest.flagEmoji || '🌐'}</span>
                    </div>
                    <span className="dp-label">{dest.label}</span>
                  </div>
                  <h3 className="dp-name">{dest.name}</h3>
                  <p className="dp-stats">
                    {dest.universityCount} {t('topDestinations.countSuffix')} &bull; {dest.averageCost}
                  </p>
                  <Link to={`/destinations/${dest.code || dest.id}`} className="dp-explore-link">
                    {t('destinations.explore')} <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DestinationsPage;
