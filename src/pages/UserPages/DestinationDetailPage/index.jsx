import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import {
  useGetCountryByIdQuery,
  useGetUniversitiesByCountryQuery,
  useGetProgramsQuery,
  useGetScholarshipsQuery,
} from '../../../services/apis/userApi';
import ScrollToTop from '../../../components/Common/ScrollToTop';
import './index.scss';

function DestinationDetailPage() {
  const { id = 'az' } = useParams();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data: countryData, isLoading: isCountryLoading } = useGetCountryByIdQuery({
    idOrCode: id,
    lang: language,
  });

  const { data: universities = [], isLoading: isUnisLoading } = useGetUniversitiesByCountryQuery(
    { countryId: countryData?.id, lang: language },
    { skip: !countryData?.id }
  );

  const { data: programs = [] } = useGetProgramsQuery(
    { lang: language, countryId: countryData?.id },
    { skip: !countryData?.id }
  );

  const { data: scholarships = [] } = useGetScholarshipsQuery(
    { lang: language, countryId: countryData?.id },
    { skip: !countryData?.id }
  );

  const isLoading = isCountryLoading || isUnisLoading;
  const flag = countryData?.flagEmoji || '🌐';
  const countryName = countryData?.name || id.toUpperCase();

  if (isLoading) {
    return (
      <div className="ddp-loading">
        <div className="ddp-spinner" />
        <p>Yüklənir...</p>
      </div>
    );
  }

  return (
    <div className="ddp-page">
      <ScrollToTop />

      {/* Hero */}
      <section className="ddp-hero">
        <div className="ddp-hero-inner">
          <span className="ddp-flag">{flag}</span>
          <h1>{countryName}</h1>
          <div className="ddp-summary-chips">
            {universities.length > 0 && (
              <span className="ddp-chip">🏛️ {universities.length} universitet</span>
            )}
            {programs.length > 0 && (
              <span className="ddp-chip">📚 {programs.length} proqram</span>
            )}
            {scholarships.length > 0 && (
              <span className="ddp-chip">🏆 {scholarships.length} təqaüd</span>
            )}
          </div>
          <Link to="/destinations" className="ddp-back">← Bütün ölkələr</Link>
        </div>
      </section>

      {/* Content */}
      <div className="ddp-body">

        {/* Universities */}
        {universities.length > 0 && (
          <section className="ddp-section">
            <h2>🏛️ {countryName} Universitetləri</h2>
            <div className="ddp-uni-grid">
              {universities.map((uni) => (
                <Link key={uni.id} to={`/universities/${uni.id}`} className="ddp-uni-card">
                  {uni.logoUrl && (
                    <div className="ddp-uni-logo">
                      <img src={uni.logoUrl} alt={uni.name} />
                    </div>
                  )}
                  <div className="ddp-uni-info">
                    <h3>{uni.name}</h3>
                    <p className="ddp-uni-loc">{[uni.city, uni.country].filter(Boolean).join(', ')}</p>
                    <div className="ddp-uni-meta">
                      {uni.tuition && <span>💰 {uni.tuition}</span>}
                      {uni.teachingLanguage && <span>🗣️ {uni.teachingLanguage}</span>}
                      {uni.ranking && <span>🏅 {uni.ranking}</span>}
                    </div>
                  </div>
                  <svg className="ddp-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Programs */}
        {programs.length > 0 && (
          <section className="ddp-section">
            <h2>📚 Proqramlar</h2>
            <div className="ddp-program-list">
              {programs.slice(0, 6).map((prog) => (
                <div key={prog.id} className="ddp-program-item">
                  <div>
                    <h3>{prog.name || prog.title}</h3>
                    <p>{[prog.degree, prog.duration].filter(Boolean).join(' · ')}</p>
                  </div>
                  {prog.tuitionFee && <span className="ddp-fee">{prog.tuitionFee}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Scholarships */}
        {scholarships.length > 0 && (
          <section className="ddp-section">
            <h2>🏆 Təqaüdlər</h2>
            <div className="ddp-scholar-grid">
              {scholarships.slice(0, 6).map((s) => (
                <div key={s.id} className="ddp-scholar-card">
                  <h3>{s.name || s.title}</h3>
                  {s.amount && <p className="ddp-scholar-amount">💰 {s.amount}</p>}
                  {s.description && <p className="ddp-scholar-desc">{s.description.slice(0, 100)}...</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No data at all */}
        {universities.length === 0 && programs.length === 0 && scholarships.length === 0 && (
          <div className="ddp-empty">
            <span>{flag}</span>
            <h3>{countryName}</h3>
            <p>Bu ölkə üçün hələ ki məlumat yoxdur.</p>
            <Link to="/destinations" className="ddp-back-btn">← Bütün ölkələrə qayıt</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default DestinationDetailPage;
