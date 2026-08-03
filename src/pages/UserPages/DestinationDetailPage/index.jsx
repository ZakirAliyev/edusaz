import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetUniversitiesQuery } from '../../../services/apis/userApi';
import './index.scss';

const countryFlagMap = {
  az: '🇦🇿', tr: '🇹🇷', de: '🇩🇪', uk: '🇬🇧', ca: '🇨🇦', my: '🇲🇾', pl: '🇵🇱', hu: '🇭🇺', it: '🇮🇹', ae: '🇦🇪'
};

function DestinationDetailPage() {
  const { id = 'az' } = useParams();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { data: universities = [], isLoading } = useGetUniversitiesQuery(language);
  
  const destId = id.toLowerCase();
  const flag = countryFlagMap[destId] || '🌐';
  const countryName = t(`destinations.labels.${destId}`) || id.toUpperCase();

  // Filter universities by country ID or fallback
  const filteredUnis = universities.filter(u => 
    u.country.toLowerCase().includes(destId) || destId.includes(u.country.toLowerCase())
  );
  const displayUnis = filteredUnis.length > 0 ? filteredUnis : universities.slice(0, 4);

  return (
    <div className="destination-detail-page">
      {/* Hero Banner */}
      <section 
        className="dest-hero" 
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1600122553956-618d3615291f?auto=format&fit=crop&w=1920&q=80")` }}
      >
        <div className="dest-hero-content">
          <span className="dest-flag">{flag}</span>
          <h1>{t('destinations.explore')} {countryName}</h1>
          <p>{displayUnis.length} {t('topDestinations.countSuffix')}</p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="dest-stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <h2>{displayUnis.length}</h2>
            <p>{t('footer.stats.universities')}</p>
          </div>
          <div className="stat-card">
            <h2>$2,000 - $8,000</h2>
            <p>{t('matchedUniversities.labels.tuition')}</p>
          </div>
          <div className="stat-card">
            <h2>$400 - $900</h2>
            <p>Living cost / mo</p>
          </div>
          <div className="stat-card">
            <h2>~85%</h2>
            <p>Visa success rate</p>
          </div>
        </div>
      </section>

      {/* Universities List */}
      <section className="dest-unis-section">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading universities from backend...</div>
        ) : (
          <div className="unis-grid">
            {displayUnis.map(uni => (
              <Link to={`/universities/${uni.id}`} key={uni.id} className="uni-card-link">
                <div className="uni-card">
                  <div className="uni-image" style={{ backgroundImage: `url(${uni.logoUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"})` }}>
                    <div className="badges-top">
                      <span className="match-badge">⭐ 96% {t('matchedUniversities.match')}</span>
                      <span className="scholarship-badge">🎓 {t('matchedUniversities.scholarship')}</span>
                    </div>
                  </div>
                  <div className="uni-info">
                    <div className="uni-title-row">
                      <h3>{uni.name}</h3>
                      <span className="uni-rank">{uni.ranking || (`${t('matchedUniversities.est')} ${uni.establishedYear}`)}</span>
                    </div>
                    <p className="location">{flag} {uni.city ? `${uni.city}, ${uni.country}` : uni.country}</p>
                    <p className="program">{uni.description ? uni.description.substring(0, 50) + "..." : "Bachelor Program"}</p>
                    
                    <div className="uni-metrics">
                      <div className="metric">
                        <span className="label">{t('matchedUniversities.labels.tuition')}</span>
                        <span className="val">{uni.tuition || "$6,500/yr"}</span>
                      </div>
                      <div className="metric">
                        <span className="label">{t('matchedUniversities.labels.acceptance')}</span>
                        <span className="val">{uni.acceptanceRate || "42%"}</span>
                      </div>
                      <div className="metric">
                        <span className="label">{t('matchedUniversities.labels.language')}</span>
                        <span className="val">{uni.teachingLanguage || "English"}</span>
                      </div>
                    </div>
                    
                    <div className="uni-footer">
                      <span className="deadline">📅 {uni.deadline || "Apr 30, 2025"}</span>
                      <span className="arrow">&rsaquo;</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="find-programs-action">
          <button className="btn-find-programs">
            {t('hero.buttons.find')} <span>✨</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default DestinationDetailPage;

