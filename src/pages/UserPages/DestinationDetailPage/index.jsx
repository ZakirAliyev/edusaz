import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Compass,
  GraduationCap,
  MapPin,
  Wallet,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  useGetCountryByIdQuery,
  useGetUniversitiesQuery,
  useGetProgramsQuery,
  useGetScholarshipsQuery,
} from '../../../services/apis/userApi';
import { resolveMediaUrl } from '../../../config/env';
import ScrollToTop from '../../../components/Common/ScrollToTop';
import './index.scss';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1400&q=70';
const onImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
};

// Unsplash URLs come sized for cards (w=800); ask for a wider render for the hero.
const heroSized = (url) => (url && /images\.unsplash\.com/.test(url) ? url.replace(/([?&])w=\d+/, '$1w=1600') : url);

function DetailSkeleton() {
  return (
    <main className="ds-page ddp-page" aria-busy="true">
      <div className="ds-container">
        <span className="ds-skeleton" style={{ display: 'block', width: 140, height: 20, marginBottom: 20 }} />
        <span className="ds-skeleton ddp-hero-skeleton" />
        <div className="ddp-facts" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="ds-skeleton" style={{ height: 76 }} />
          ))}
        </div>
        <div className="ddp-uni-grid" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="ds-skeleton" style={{ height: 280, borderRadius: 20 }} />
          ))}
        </div>
      </div>
    </main>
  );
}

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

  const flag = countryData?.flagEmoji || '';
  const countryName = countryData?.name || countryData?.defaultName || id.toUpperCase();
  const countryCode = (countryData?.code || id).toLowerCase();

  // Match universities by countryId OR country name/code
  const universities = allUniversities.filter(u => {
    if (!u) return false;
    if (countryData?.id && (u.countryId === countryData.id || u.CountryId === countryData.id)) return true;
    const uCountry = (u.country || u.Country || '').toLowerCase().trim();
    const cName = (countryName || '').toLowerCase().trim();
    const cDef = (countryData?.defaultName || '').toLowerCase().trim();
    // Guard against empty strings: ''.includes('') would match every university.
    if (!uCountry || !cName) return false;
    return uCountry === cName || (cDef && uCountry === cDef) || uCountry.includes(cName) || cName.includes(uCountry);
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

  // Match scholarships (the API exposes countryId / countryCode on each scholarship)
  const scholarships = allScholarships.filter(s => {
    if (!s) return false;
    if (s.universityId && uniIds.has(s.universityId)) return true;
    if (countryData?.id && s.countryId === countryData.id) return true;
    if (s.countryCode && s.countryCode.toLowerCase() === countryCode) return true;
    const sCountry = (s.country || '').toLowerCase().trim();
    const cName = (countryName || '').toLowerCase().trim();
    return sCountry === cName || (countryData?.defaultName && sCountry === countryData.defaultName.toLowerCase());
  });

  const isLoading = isCountryLoading || isUnisLoading;

  if (isLoading) {
    return <DetailSkeleton />;
  }

  const hasData = universities.length > 0 || programs.length > 0 || scholarships.length > 0;
  const heroImage = heroSized(resolveMediaUrl(countryData?.imageUrl)) || FALLBACK_IMAGE;

  const facts = [
    countryData?.averageCost && { key: 'cost', icon: Wallet, label: t('landing.destinations.cost', 'Orta xərc'), value: countryData.averageCost },
    { key: 'unis', icon: Building2, label: t('hero.stats.universities', 'Universitet'), value: universities.length },
    { key: 'programs', icon: BookOpen, label: t('pages.destinationDetail.programs', 'Proqram'), value: programs.length },
    { key: 'scholarships', icon: Award, label: t('hero.stats.scholarships', 'Təqaüd proqramı'), value: scholarships.length },
  ].filter(Boolean);

  return (
    <main className="ds-page ddp-page">
      <ScrollToTop />
      <div className="ds-container">
        <Link to="/destinations" className="ddp-back">
          <ArrowLeft aria-hidden className="ddp-flip" />
          {t('landing.destinations.all', 'Bütün ölkələr')}
        </Link>

        {/* Hero */}
        <section className="ddp-hero" data-reveal>
          <img src={heroImage} onError={onImgError} alt="" className="ddp-hero__img" />
          <span className="ddp-hero__overlay" aria-hidden />
          <div className="ddp-hero__body">
            {countryData?.label && <span className="ddp-hero__label">{countryData.label}</span>}
            <h1 className="ddp-hero__title">
              {flag && <span className="ddp-hero__flag" aria-hidden>{flag}</span>}
              {countryName}
            </h1>
            <p className="ddp-hero__lead">
              {t('pages.destinationDetail.subtitle', '{{country}} üzrə təhsil imkanları, universitetlər, ixtisaslar və təqaüdlər.', { country: countryName })}
            </p>
          </div>
        </section>

        {/* Key facts */}
        <dl className="ddp-facts" data-reveal style={{ '--cols': facts.length }}>
          {facts.map(({ key, icon: Icon, label, value }) => (
            <div key={key} className="ddp-fact">
              <dt>
                <Icon aria-hidden />
                {label}
              </dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        {/* Universities */}
        {universities.length > 0 && (
          <section className="ddp-section" aria-labelledby="ddp-unis-title">
            <div className="ddp-section__head" data-reveal>
              <h2 id="ddp-unis-title" className="ds-h2">
                {t('pages.destinationDetail.universitiesTitle', '{{country}} universitetləri', { country: countryName })}
              </h2>
              <span className="ds-badge">{universities.length}</span>
            </div>
            <ul className="ddp-uni-grid">
              {universities.map((uni, i) => (
                <li key={uni.id} data-reveal style={{ '--delay': `${Math.min(i % 4, 5) * 60}ms` }}>
                  <Link to={`/universities/${uni.id}`} className="ddp-uni">
                    <span className="ddp-uni__media">
                      <img
                        src={resolveMediaUrl(uni.images?.[0] || uni.logoUrl) || FALLBACK_IMAGE}
                        onError={onImgError}
                        alt=""
                        loading="lazy"
                      />
                      {uni.hasScholarship && (
                        <span className="ddp-uni__badge">{t('landing.universities.scholarship', 'Təqaüd var')}</span>
                      )}
                    </span>
                    <span className="ddp-uni__body">
                      <span className="ddp-uni__name">{uni.name}</span>
                      {(uni.city || uni.country) && (
                        <span className="ddp-uni__place">
                          <MapPin aria-hidden />
                          {[uni.city, uni.country].filter(Boolean).join(', ')}
                        </span>
                      )}
                      {uni.ranking && <span className="ddp-uni__rank">{uni.ranking}</span>}
                      {(uni.tuition || uni.teachingLanguage) && (
                        <span className="ddp-uni__facts">
                          {uni.tuition && (
                            <span>
                              <small>{t('landing.universities.tuition', 'Təhsil haqqı')}</small>
                              {uni.tuition}
                            </span>
                          )}
                          {uni.teachingLanguage && (
                            <span>
                              <small>{t('matchedUniversities.labels.language', 'Tədris dili')}</small>
                              {uni.teachingLanguage}
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Programs */}
        {programs.length > 0 && (
          <section className="ddp-section" aria-labelledby="ddp-programs-title">
            <div className="ddp-section__head" data-reveal>
              <h2 id="ddp-programs-title" className="ds-h2">
                {t('pages.destinationDetail.programsTitle', 'Tədris proqramları və ixtisaslar')}
              </h2>
              <span className="ds-badge">{programs.length}</span>
            </div>
            <ul className="ddp-programs" data-reveal>
              {programs.slice(0, 8).map((prog) => (
                <li key={prog.id} className="ddp-program">
                  <span className="ddp-program__icon" aria-hidden><GraduationCap /></span>
                  <div className="ddp-program__text">
                    <h3 className="ddp-program__name">{prog.name || prog.title}</h3>
                    <p className="ddp-program__meta">
                      {[prog.degreeLevel || prog.degree, prog.duration, prog.languageOfInstruction || prog.teachingLanguage].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {prog.tuitionFee && <span className="ddp-program__fee">{prog.tuitionFee}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Scholarships */}
        {scholarships.length > 0 && (
          <section className="ddp-section" aria-labelledby="ddp-sch-title">
            <div className="ddp-section__head" data-reveal>
              <h2 id="ddp-sch-title" className="ds-h2">
                {t('pages.destinationDetail.scholarshipsTitle', 'Təqaüdlər və qrantlar')}
              </h2>
              <Link to="/scholarships" className="ds-link">
                {t('pages.destinationDetail.allScholarships', 'Bütün təqaüdlər')} <ArrowRight aria-hidden className="ddp-flip" />
              </Link>
            </div>
            <ul className="ddp-sch-grid">
              {scholarships.slice(0, 6).map((s, i) => (
                <li key={s.id} className="ds-card ds-card--pad ddp-sch" data-reveal style={{ '--delay': `${Math.min(i % 3, 5) * 60}ms` }}>
                  <Award aria-hidden className="ddp-sch__icon" />
                  <h3 className="ds-h3">{s.name || s.title}</h3>
                  {s.amount && <p className="ddp-sch__amount">{s.coverage || s.amount}</p>}
                  {s.description && <p className="ddp-sch__desc">{s.description.slice(0, 120)}...</p>}
                  {s.deadline && (
                    <p className="ddp-sch__deadline">
                      {t('scholarshipsSection.deadline', 'Son müraciət')}: <strong>{s.deadline}</strong>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Empty state */}
        {!hasData && (
          <div className="ds-empty ddp-empty" data-reveal>
            <span className="ddp-empty__icon"><Building2 aria-hidden /></span>
            <strong>
              {t('pages.destinationDetail.emptyTitle', '{{country}} üzrə məlumatlar hazırlanır', { country: countryName })}
            </strong>
            <p>
              {t('pages.destinationDetail.emptyText', 'Bu ölkə üzrə tərəfdaş universitetlər və təqaüd proqramları tezliklə sistemə əlavə olunacaq.')}
            </p>
            <div className="ddp-empty__actions">
              <Link to="/destinations" className="ds-btn ds-btn--primary">
                <Compass aria-hidden /> {t('pages.destinationDetail.otherCountries', 'Digər ölkələrə bax')}
              </Link>
              <Link to="/universities" className="ds-btn ds-btn--secondary">
                <GraduationCap aria-hidden /> {t('pages.destinationDetail.allUniversities', 'Bütün universitetlər')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default DestinationDetailPage;
