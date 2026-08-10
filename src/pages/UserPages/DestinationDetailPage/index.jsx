import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetCountryByIdQuery, useGetUniversitiesByCountryQuery, useGetUniversitiesQuery } from '../../../services/apis/userApi';
import './index.scss';

function DestinationDetailPage() {
  const { id = 'az' } = useParams();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data: countryData, isLoading: isCountryLoading } = useGetCountryByIdQuery({ idOrCode: id, lang: language });
  
  const { data: countryUnis = [], isLoading: isCountryUnisLoading } = useGetUniversitiesByCountryQuery(
    { countryId: countryData?.id, lang: language },
    { skip: !countryData?.id }
  );

  const { data: allUnis = [], isLoading: isAllUnisLoading } = useGetUniversitiesQuery(language);

  // STRICTLY filter universities belonging to THIS country
  const rawUnis = (countryUnis && countryUnis.length > 0) 
    ? countryUnis 
    : allUnis.filter(u => 
        (countryData?.id && u.countryId === countryData.id) ||
        (countryData?.code && u.countryCode?.toLowerCase() === countryData.code.toLowerCase()) ||
        u.countryCode?.toLowerCase() === id.toLowerCase() || 
        u.country?.toLowerCase().includes(id.toLowerCase())
      );

  // Deduplicate universities by ID or name
  const finalUnis = rawUnis.filter((uni, index, self) =>
    index === self.findIndex(t => t.id === uni.id || t.name?.toLowerCase() === uni.name?.toLowerCase())
  );

  const flag = countryData?.flagEmoji || '🌐';
  const countryName = countryData?.name || id.toUpperCase();
  const heroImage = countryData?.imageUrl || "https://images.unsplash.com/photo-1600122553956-618d3615291f?auto=format&fit=crop&w=1920&q=80";

  return (
    <div className="destination-detail-page">
      {/* Hero Banner */}
      <section 
        className="dest-hero" 
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url("${heroImage}")` }}
      >
        <div className="dest-hero-content">
          <span className="dest-flag">{flag}</span>
          <h1>{t('destinations.explore')} {countryName}</h1>
          <p>{finalUnis.length} {t('topDestinations.countSuffix')}</p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="dest-stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <h2>{countryData?.universityCount || finalUnis.length}</h2>
            <p>{t('footer.stats.universities')}</p>
          </div>
          <div className="stat-card">
            <h2>{countryData?.averageCost || "$2,000 - $8,000"}</h2>
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
        {isCountryLoading || isCountryUnisLoading || isAllUnisLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading universities from backend...</div>
        ) : finalUnis.length === 0 ? (
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              {countryName} ölkəsində hələ ki qeydə alınmış universitet tapılmadı
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '24px' }}>
              Bu ölkə üçün backend bazasında yeni universitetlər əlavə olunduqca burada avtomatik görünəcəkdir.
            </p>
            <Link to="/destinations" style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#7A5CFF',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '100px',
                fontWeight: '600',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}>
                Bütün Ölkələrə Bax
              </button>
            </Link>
          </div>
        ) : (
          <div className="unis-grid">
            {finalUnis.map(uni => (
              <Link to={`/universities/${uni.id}`} key={uni.id} className="uni-card-link">
                <div className="uni-card">
                  <div className="uni-image" style={{ backgroundImage: `url(${uni.logoUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"})` }}>
                    <div className="badges-top">
                      <span className="match-badge">⭐ 96% {t('matchedUniversities.match')}</span>
                      {uni.hasScholarship && (
                        <span className="scholarship-badge">🎓 {t('matchedUniversities.scholarship')}</span>
                      )}
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
          <Link to="/universities" style={{ textDecoration: 'none' }}>
            <button className="btn-find-programs">
              {t('hero.buttons.find')} <span>✨</span>
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default DestinationDetailPage;
