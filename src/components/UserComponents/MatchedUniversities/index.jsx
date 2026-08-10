import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetUniversitiesQuery } from '../../../services/apis/userApi';
import './index.scss';

const BuildingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10v12"/>
    <path d="M20 10v12"/>
    <path d="M4 22h16"/>
    <path d="M2 10h20"/>
    <path d="M12 2l-8 4v4h16V6z"/>
  </svg>
);

const ScholarshipIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

function MatchedUniversities() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { data: apiUniversities = [], isLoading } = useGetUniversitiesQuery(language);

  return (
    <section id="matched-universities">
      <div className="mu-inner">
        <div className="mu-header">
          <div className="mu-header-left">
            <span className="mu-badge">
              <BuildingIcon />
              {t('matchedUniversities.badge')}
            </span>
            <h2 className="mu-title">{t('matchedUniversities.title')}</h2>
          </div>
          <button className="btn-browse-all" onClick={() => navigate('/universities')}>
            {t('matchedUniversities.browseAll')} &gt;
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading backend universities...</div>
        ) : (
          <div className="mu-grid">
            {(Array.isArray(apiUniversities) ? apiUniversities : (apiUniversities?.data || [])).slice(0, 6).map(uni => (
              <Link to={`/universities/${uni.id}`} key={uni.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="mu-card">
                  <div className="mu-card-img-wrapper">
                    <img src={uni.logoUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80"} alt={uni.name} className="mu-card-img" />
                    <div className="mu-card-tags">
                      <div className="mu-tag-match" style={{ backgroundColor: "#10b981" }}>
                        <SparkleIcon /> 96% {t('matchedUniversities.match')}
                      </div>
                      {uni.hasScholarship && (
                        <div className="mu-tag-scholarship">
                          <ScholarshipIcon /> {t('matchedUniversities.scholarship')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mu-card-body">
                    <div className="mu-card-header">
                      <h3 className="mu-uni-name">{uni.name}</h3>
                      <span className="mu-uni-rank">{uni.ranking || (`${t('matchedUniversities.est')} ${uni.establishedYear}`)}</span>

                    </div>
                    
                    <span className="mu-uni-location">{uni.city ? `${uni.city}, ${uni.country}` : uni.country}</span>
                    <span className="mu-uni-program">{uni.description ? uni.description.substring(0, 50) + "..." : "Bachelor in Computer Science"}</span>


                    <div className="mu-uni-stats">
                      <div className="stat-box">
                        <span className="stat-label">{t('matchedUniversities.labels.tuition')}</span>
                        <span className="stat-val">{uni.tuition || "$6,500/yr"}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">{t('matchedUniversities.labels.acceptance')}</span>
                        <span className="stat-val">{uni.acceptanceRate || "45%"}</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">{t('matchedUniversities.labels.language')}</span>
                        <span className="stat-val">{uni.teachingLanguage || "English"}</span>
                      </div>
                    </div>

                    <div className="mu-card-footer">
                      <div className="mu-deadline">
                        <CalendarIcon /> {uni.deadline || "Apr 30, 2025"}
                      </div>
                      <ChevronIcon />
                    </div>
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

export default MatchedUniversities;


