import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import {
  useGetCountryByIdQuery,
  useGetUniversitiesQuery,
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

  const { data: allUniversities = [], isLoading: isUnisLoading } = useGetUniversitiesQuery(language);
  const { data: allPrograms = [] } = useGetProgramsQuery(language);
  const { data: allScholarships = [] } = useGetScholarshipsQuery(language);

  const flag = countryData?.flagEmoji || '🌐';
  const countryName = countryData?.name || countryData?.defaultName || id.toUpperCase();
  const countryCode = countryData?.code?.toLowerCase() || id.toLowerCase();

  // Match universities by countryId OR country name/code
  const universities = allUniversities.filter(u => {
    if (!u) return false;
    if (countryData?.id && (u.countryId === countryData.id || u.CountryId === countryData.id)) return true;
    const uCountry = (u.country || u.Country || '').toLowerCase().trim();
    const cName = (countryName || '').toLowerCase().trim();
    const cDef = (countryData?.defaultName || '').toLowerCase().trim();
    return uCountry === cName || uCountry === cDef || uCountry.includes(cName) || cName.includes(uCountry);
  });

  // Match programs by university or country
  const uniIds = new Set(universities.map(u => u.id));
  const programs = allPrograms.filter(p => {
    if (!p) return false;
    if (p.universityId && uniIds.has(p.universityId)) return true;
    const pCountry = (p.country || '').toLowerCase().trim();
    const cName = (countryName || '').toLowerCase().trim();
    return pCountry === cName || (countryData?.defaultName && pCountry === countryData.defaultName.toLowerCase());
  });

  // Match scholarships
  const scholarships = allScholarships.filter(s => {
    if (!s) return false;
    if (s.universityId && uniIds.has(s.universityId)) return true;
    const sCountry = (s.country || '').toLowerCase().trim();
    const cName = (countryName || '').toLowerCase().trim();
    return sCountry === cName || (countryData?.defaultName && sCountry === countryData.defaultName.toLowerCase());
  });

  const isLoading = isCountryLoading || isUnisLoading;

  if (isLoading) {
    return (
      <div className="ddp-loading">
        <div className="ddp-spinner" />
        <p>Məlumatlar yüklənir...</p>
      </div>
    );
  }

  const hasData = universities.length > 0 || programs.length > 0 || scholarships.length > 0;

  return (
    <div className="ddp-page">
      <ScrollToTop />

      {/* Single Clean Hero Section */}
      <section className="ddp-hero">
        <div className="ddp-hero-inner">
          <div className="ddp-flag-badge">
            <span className="ddp-flag">{flag}</span>
          </div>
          <h1>{countryName}</h1>
          <p className="ddp-subtitle">
            {countryName} üzrə təhsil imkanları, universitetlər, ixtisaslar və təqaüdlər.
          </p>

          <div className="ddp-summary-chips">
            <span className="ddp-chip">🏛️ {universities.length} universitet</span>
            <span className="ddp-chip">📚 {programs.length} proqram</span>
            <span className="ddp-chip">🏆 {scholarships.length} təqaüd</span>
          </div>

          <div>
            <Link to="/destinations" className="ddp-back">
              ← Bütün ölkələr
            </Link>
          </div>
        </div>
      </section>

      {/* Content Body */}
      <div className="ddp-body">
        {/* Universities Section */}
        {universities.length > 0 && (
          <section className="ddp-section">
            <h2>🏛️ {countryName} Universitetləri ({universities.length})</h2>
            <div className="ddp-uni-grid">
              {universities.map((uni) => (
                <Link key={uni.id} to={`/university/${uni.id}`} className="ddp-uni-card">
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

        {/* Programs Section */}
        {programs.length > 0 && (
          <section className="ddp-section">
            <h2>📚 Tədris Proqramları və İxtisaslar ({programs.length})</h2>
            <div className="ddp-program-list">
              {programs.slice(0, 8).map((prog) => (
                <div key={prog.id} className="ddp-program-item">
                  <div>
                    <h3>{prog.name || prog.title}</h3>
                    <p>{[prog.degreeLevel || prog.degree, prog.duration, prog.languageOfInstruction || prog.teachingLanguage].filter(Boolean).join(' · ')}</p>
                  </div>
                  {prog.tuitionFee && <span className="ddp-fee">{prog.tuitionFee}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Scholarships Section */}
        {scholarships.length > 0 && (
          <section className="ddp-section">
            <h2>🏆 Təqaüdlər və Qrantlar ({scholarships.length})</h2>
            <div className="ddp-scholar-grid">
              {scholarships.slice(0, 6).map((s) => (
                <div key={s.id} className="ddp-scholar-card">
                  <h3>{s.name || s.title}</h3>
                  {s.amount && <p className="ddp-scholar-amount">💰 {s.coverage || s.amount}</p>}
                  {s.description && <p className="ddp-scholar-desc">{s.description.slice(0, 120)}...</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Clean Single Empty State if no data */}
        {!hasData && (
          <div className="ddp-empty-card">
            <div className="empty-icon-box">🏛️</div>
            <h3>{countryName} üzrə məlumatlar hazırlanır</h3>
            <p>Bu ölkə üzrə tərəfdaş universitetlər və təqaüd proqramları tezliklə sistemə əlavə olunacaq.</p>
            <div className="empty-actions">
              <Link to="/destinations" className="ddp-back-btn">
                🌍 Digər Ölkələrə Bax
              </Link>
              <Link to="/browse-universities" className="ddp-back-btn secondary">
                🎓 Bütün Universitetlər
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DestinationDetailPage;

