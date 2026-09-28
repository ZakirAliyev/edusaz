import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Building2,
  ChevronDown,
  Compass,
  Globe2,
  Languages,
  Lightbulb,
  MapPin,
  Search,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useGetCountriesQuery, useGetScholarshipsQuery, useGetUniversitiesQuery } from '../services/apis/userApi';
import { resolveMediaUrl } from '../config/env';
import './i18n';
import './landing.scss';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=75';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=70';
const TEACHING_LANGUAGES = ['en', 'tr', 'az', 'de', 'ru'];

const asArray = (d) => (Array.isArray(d) ? d : []);
const onImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
};

function SectionHead({ title, subtitle, action }) {
  return (
    <div className="lp-section-head" data-reveal>
      <div>
        <h2 className="lp-h2">{title}</h2>
        {subtitle && <p className="lp-lead">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Hero({ countries, universities, scholarshipCount }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState('');
  const featured = universities.find((u) => u.hasScholarship && u.logoUrl) || universities[0];

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (country) params.set('country', country);
    if (language) params.set('lang', language);
    navigate(`/universities${params.toString() ? `?${params}` : ''}`);
  };

  const stats = [
    [universities.length, t('landing.stats.universities')],
    [countries.length, t('landing.stats.countries')],
    [scholarshipCount, t('landing.stats.scholarships')],
    [31, t('landing.stats.languages')],
  ].filter(([value]) => value > 0);

  return (
    <section className="lp-hero">
      <div className="lp-container lp-hero__grid">
        <div className="lp-hero__copy">
          <p className="lp-eyebrow">
            <span className="lp-eyebrow__dot" aria-hidden />
            {t('landing.hero.eyebrow')}
          </p>
          <h1 className="lp-h1">
            {t('landing.hero.titleA')} <em>{t('landing.hero.titleAccent')}</em>
          </h1>
          <p className="lp-hero__subtitle">{t('landing.hero.subtitle')}</p>

          <form className="lp-search" onSubmit={submit} role="search">
            <label className="lp-search__field">
              <span className="lp-search__label">{t('landing.hero.where')}</span>
              <span className="lp-search__control">
                <MapPin aria-hidden />
                <select value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="">{t('landing.hero.anyCountry')}</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.flagEmoji ? `${c.flagEmoji} ` : ''}
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden className="lp-search__chevron" />
              </span>
            </label>
            <label className="lp-search__field">
              <span className="lp-search__label">{t('landing.hero.language')}</span>
              <span className="lp-search__control">
                <Languages aria-hidden />
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="">{t('landing.hero.anyLanguage')}</option>
                  {TEACHING_LANGUAGES.map((code) => (
                    <option key={code} value={code}>
                      {t(`landing.langs.${code}`)}
                    </option>
                  ))}
                </select>
                <ChevronDown aria-hidden className="lp-search__chevron" />
              </span>
            </label>
            <button type="submit" className="lp-btn lp-btn--primary lp-search__submit">
              <Search aria-hidden />
              {t('landing.hero.cta')}
            </button>
          </form>

          <Link to="/ai-discovery" className="lp-hero__quiz">
            {t('landing.hero.quiz')}
            <ArrowRight aria-hidden />
          </Link>

          {stats.length > 0 && (
            <dl className="lp-stats">
              {stats.map(([value, label]) => (
                <div key={label} className="lp-stats__item">
                  <dt className="lp-stats__value">{value}</dt>
                  <dd className="lp-stats__label">{label}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="lp-hero__visual">
          <img className="lp-hero__photo" src={HERO_IMAGE} alt={t('landing.hero.imageAlt')} width="700" height="820" fetchPriority="high" />
          {featured && (
            <Link to={`/universities/${featured.id}`} className="lp-float lp-float--uni">
              <img src={resolveMediaUrl(featured.logoUrl) || FALLBACK_IMAGE} onError={onImgError} alt="" className="lp-float__logo" />
              <span className="lp-float__body">
                <span className="lp-float__title">{featured.name}</span>
                <span className="lp-float__meta">
                  {[featured.city, featured.country].filter(Boolean).join(', ')}
                </span>
                {featured.tuition && (
                  <span className="lp-float__meta">
                    {t('landing.card.tuition')}: <strong>{featured.tuition}</strong>
                  </span>
                )}
              </span>
            </Link>
          )}
          {scholarshipCount > 0 && (
            <Link to="/scholarships" className="lp-float lp-float--chip">
              <Wallet aria-hidden />
              <span>
                <strong>{scholarshipCount}</strong> {t('landing.card.openScholarships')}
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function UniversityMarquee({ universities }) {
  const { t } = useTranslation();
  const items = universities.filter((u) => u.name).slice(0, 16);
  if (items.length < 4) return null;
  return (
    <section className="lp-marquee" aria-label={t('landing.marquee.title')}>
      <p className="lp-marquee__title">{t('landing.marquee.title')}</p>
      <div className="lp-marquee__viewport">
        <ul className="lp-marquee__track">
          {[...items, ...items].map((u, i) => (
            <li key={`${u.id}-${i}`} aria-hidden={i >= items.length}>
              <img src={resolveMediaUrl(u.logoUrl) || FALLBACK_IMAGE} onError={onImgError} alt="" loading="lazy" className="lp-marquee__logo" />
              {u.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Features({ universityCount, scholarshipCount, countryCount }) {
  const { t } = useTranslation();
  const tiles = [
    { key: 'universities', to: '/universities', icon: Building2, count: universityCount, size: 'lg' },
    { key: 'scholarships', to: '/scholarships', icon: Wallet, count: scholarshipCount, size: 'lg' },
    { key: 'courses', to: '/courses', icon: BookOpen },
    { key: 'destinations', to: '/destinations', icon: Globe2, count: countryCount },
    { key: 'match', to: '/ai-discovery', icon: Compass },
    { key: 'talents', to: '/talents', icon: Lightbulb },
  ];
  return (
    <section className="lp-section" id="features">
      <div className="lp-container">
        <SectionHead title={t('landing.features.title')} subtitle={t('landing.features.subtitle')} />
        <ul className="lp-bento">
          {tiles.map(({ key, to, icon: Icon, count, size }) => (
            <li key={key} className={`lp-bento__item${size === 'lg' ? ' lp-bento__item--lg' : ''}`} data-reveal>
              <Link to={to} className="lp-tile">
                <span className="lp-tile__icon">
                  <Icon aria-hidden />
                </span>
                <span className="lp-tile__title">
                  {t(`landing.features.${key}.title`)}
                  {count > 0 && <span className="lp-tile__count">{count}</span>}
                </span>
                <span className="lp-tile__desc">{t(`landing.features.${key}.desc`)}</span>
                <span className="lp-tile__cta">
                  {t('landing.features.open')}
                  <ArrowUpRight aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Steps() {
  const { t } = useTranslation();
  return (
    <section className="lp-section lp-section--tint">
      <div className="lp-container">
        <SectionHead title={t('landing.steps.title')} />
        <ol className="lp-steps">
          {['s1', 's2', 's3'].map((s, i) => (
            <li key={s} className="lp-step" data-reveal style={{ '--delay': `${i * 80}ms` }}>
              <span className="lp-step__num">0{i + 1}</span>
              <h3 className="lp-h3">{t(`landing.steps.${s}.title`)}</h3>
              <p className="lp-muted">{t(`landing.steps.${s}.desc`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Destinations({ countries }) {
  const { t } = useTranslation();
  const top = [...countries].sort((a, b) => (b.universityCount || 0) - (a.universityCount || 0)).slice(0, 6);
  if (!top.length) return null;
  return (
    <section className="lp-section" id="destinations">
      <div className="lp-container">
        <SectionHead
          title={t('landing.destinations.title')}
          subtitle={t('landing.destinations.subtitle')}
          action={
            <Link to="/destinations" className="lp-link">
              {t('landing.destinations.all')} <ArrowRight aria-hidden />
            </Link>
          }
        />
        <ul className="lp-dest">
          {top.map((c) => (
            <li key={c.id} data-reveal>
              <Link to={`/destinations/${c.code || c.id}`} className="lp-dest__card">
                <img src={c.imageUrl || FALLBACK_IMAGE} onError={onImgError} alt="" loading="lazy" className="lp-dest__img" />
                <span className="lp-dest__overlay" />
                <span className="lp-dest__body">
                  <span className="lp-dest__name">
                    {c.flagEmoji && <span aria-hidden>{c.flagEmoji}</span>} {c.name}
                  </span>
                  <span className="lp-dest__meta">
                    <span>{t('landing.destinations.count', { count: c.universityCount || 0 })}</span>
                    {c.averageCost && <span>{c.averageCost}</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeaturedUniversities({ universities }) {
  const { t } = useTranslation();
  const list = useMemo(() => {
    const withImages = universities.filter((u) => u.logoUrl || u.images?.length);
    return (withImages.length >= 4 ? withImages : universities).slice(0, 4);
  }, [universities]);
  if (!list.length) return null;
  return (
    <section className="lp-section" id="universities">
      <div className="lp-container">
        <SectionHead
          title={t('landing.universities.title')}
          subtitle={t('landing.universities.subtitle')}
          action={
            <Link to="/universities" className="lp-link">
              {t('landing.universities.all')} <ArrowRight aria-hidden />
            </Link>
          }
        />
        <ul className="lp-unis">
          {list.map((u) => (
            <li key={u.id} data-reveal>
              <Link to={`/universities/${u.id}`} className="lp-uni">
                <span className="lp-uni__media">
                  <img src={resolveMediaUrl(u.images?.[0] || u.logoUrl) || FALLBACK_IMAGE} onError={onImgError} alt="" loading="lazy" />
                  {u.hasScholarship && <span className="lp-uni__badge">{t('landing.universities.scholarship')}</span>}
                </span>
                <span className="lp-uni__body">
                  <span className="lp-uni__name">{u.name}</span>
                  <span className="lp-uni__place">
                    <MapPin aria-hidden />
                    {[u.city, u.country].filter(Boolean).join(', ')}
                  </span>
                  <span className="lp-uni__facts">
                    {u.tuition && (
                      <span>
                        <small>{t('landing.universities.tuition')}</small>
                        {u.tuition}
                      </span>
                    )}
                    {u.acceptanceRate && (
                      <span>
                        <small>{t('landing.universities.acceptance')}</small>
                        {u.acceptanceRate}
                      </span>
                    )}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Why() {
  const { t } = useTranslation();
  const items = [
    { key: 'free', icon: Wallet },
    { key: 'verified', icon: BadgeCheck },
    { key: 'languages', icon: Languages },
    { key: 'payments', icon: ShieldCheck },
  ];
  return (
    <section className="lp-section lp-section--tint">
      <div className="lp-container">
        <SectionHead title={t('landing.why.title')} />
        <ul className="lp-why">
          {items.map(({ key, icon: Icon }) => (
            <li key={key} className="lp-why__item" data-reveal>
              <Icon aria-hidden className="lp-why__icon" />
              <h3 className="lp-h3">{t(`landing.why.${key}.title`)}</h3>
              <p className="lp-muted">{t(`landing.why.${key}.desc`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Partners() {
  const { t } = useTranslation();
  return (
    <section className="lp-section">
      <div className="lp-container">
        <SectionHead title={t('landing.partners.title')} />
        <div className="lp-partners">
          <Link to="/for-universities" className="lp-partner lp-partner--dark" data-reveal>
            <Building2 aria-hidden className="lp-partner__icon" />
            <h3 className="lp-h3">{t('landing.partners.uni.title')}</h3>
            <p>{t('landing.partners.uni.desc')}</p>
            <span className="lp-partner__cta">
              {t('landing.partners.uni.cta')} <ArrowRight aria-hidden />
            </span>
          </Link>
          <Link to="/register" className="lp-partner" data-reveal>
            <BookOpen aria-hidden className="lp-partner__icon" />
            <h3 className="lp-h3">{t('landing.partners.teach.title')}</h3>
            <p>{t('landing.partners.teach.desc')}</p>
            <span className="lp-partner__cta">
              {t('landing.partners.teach.cta')} <ArrowRight aria-hidden />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'];

/**
 * Accordion: opening one question closes the previous one; height animates via grid rows.
 * Open state lives in `data-open` (not className) so React never strips the scroll-reveal `is-visible` class.
 */
function Faq() {
  const { t } = useTranslation();
  const [openKey, setOpenKey] = useState(null);

  return (
    <section className="lp-section" id="faq">
      <div className="lp-container lp-faq">
        <div data-reveal>
          <h2 className="lp-h2">{t('landing.faq.title')}</h2>
        </div>
        <div className="lp-faq__list">
          {FAQ_KEYS.map((q) => {
            const isOpen = openKey === q;
            return (
              <div key={q} className="lp-faq__item" data-open={isOpen} data-reveal>
                <h3 className="lp-faq__heading">
                  <button
                    type="button"
                    id={`faq-${q}-trigger`}
                    className="lp-faq__trigger"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${q}-panel`}
                    onClick={() => setOpenKey(isOpen ? null : q)}
                  >
                    {t(`landing.faq.${q}.q`)}
                    <ChevronDown aria-hidden />
                  </button>
                </h3>
                <div id={`faq-${q}-panel`} role="region" aria-labelledby={`faq-${q}-trigger`} className="lp-faq__panel">
                  <div className="lp-faq__panel-inner" inert={!isOpen}>
                    <p>{t(`landing.faq.${q}.a`)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  const { t } = useTranslation();
  return (
    <section className="lp-section lp-section--last">
      <div className="lp-container">
        <div className="lp-cta" data-reveal>
          <h2 className="lp-h2">{t('landing.cta.title')}</h2>
          <p>{t('landing.cta.subtitle')}</p>
          <div className="lp-cta__actions">
            <Link to="/register" className="lp-btn lp-btn--light">
              {t('landing.cta.primary')}
            </Link>
            <Link to="/universities" className="lp-btn lp-btn--ghost">
              {t('landing.cta.secondary')} <ArrowRight aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const { language } = useLanguage();
  const { data: universitiesData } = useGetUniversitiesQuery(language);
  const { data: countriesData } = useGetCountriesQuery(language);
  const { data: scholarshipsData } = useGetScholarshipsQuery(language);
  const universities = asArray(universitiesData);
  const countries = asArray(countriesData);
  const scholarshipCount = asArray(scholarshipsData).length;

  return (
    <main className="lp">
      <Hero countries={countries} universities={universities} scholarshipCount={scholarshipCount} />
      <UniversityMarquee universities={universities} />
      <Features universityCount={universities.length} scholarshipCount={scholarshipCount} countryCount={countries.length} />
      <Steps />
      <Destinations countries={countries} />
      <FeaturedUniversities universities={universities} />
      <Why />
      <Partners />
      <Faq />
      <FinalCta />
    </main>
  );
}
