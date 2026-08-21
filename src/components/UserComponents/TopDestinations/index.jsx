import { Link, useNavigate } from 'react-router-dom';
import './index.scss';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetCountriesQuery } from '../../../services/apis/userApi';

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

function TopDestinations() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { data: apiCountries = [], isLoading } = useGetCountriesQuery(language);

  return (
    <section id="top-destinations">
      <div className="td-inner">
        <div className="td-header">
          <div className="td-header-left">
            <span className="td-badge">
              <GlobeIcon />
              {t('topDestinations.badge') || 'Ölkələr'}
            </span>
            <h2 className="td-title">{t('topDestinations.title') || 'Dünyanın ən populyar təhsil ölkələri'}</h2>
          </div>
          <button className="btn-view-all" onClick={() => navigate('/destinations')}>
            {t('topDestinations.viewAll') || 'Hamısına bax'} &gt;
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Ölkələr yüklənir...</div>
        ) : (
          <div className="td-grid">
            {(Array.isArray(apiCountries) ? apiCountries : (apiCountries?.data || [])).slice(0, 10).map(dest => (
              <Link to={`/destinations/${dest.code || dest.id}`} key={dest.id} className="td-card-link">
                <div className="td-card">
                  <div className="td-card-flag-wrapper">
                    <span className="td-flag">{dest.flagEmoji || '🌐'}</span>
                  </div>
                  <div className="td-card-content">
                    <h3 className="td-card-name">{dest.name}</h3>
                    <div className="td-meta-row">
                      <span className="td-count">🏛️ {dest.universityCount || 0} universitet</span>
                    </div>
                    {dest.label && <span className="td-label">{dest.label}</span>}
                  </div>
                  <div className="td-arrow-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TopDestinations;
