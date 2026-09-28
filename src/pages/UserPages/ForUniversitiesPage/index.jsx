import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BadgeCheck, BarChart3, Building2, Check, TrendingUp, Users } from 'lucide-react';
import PartnerModal from '../../../components/UserComponents/PartnerModal';
import './index.scss';

const CAMPUS_IMAGE = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1100&q=70';

const BENEFITS = [
  { key: 'feature1', icon: BadgeCheck },
  { key: 'feature2', icon: TrendingUp },
  { key: 'feature3', icon: Users },
  { key: 'feature4', icon: BarChart3 },
];

const STEPS = ['s1', 's2', 's3'];

const PLANS = [
  { key: 'verified', title: 'verifiedPartner', desc: 'verifiedDesc', price: '$299', features: ['f1', 'f2', 'f3', 'f4', 'f5'] },
  { key: 'premium', title: 'premiumTitle', desc: 'premiumDesc', price: '$799', features: ['f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'], featured: true },
  { key: 'enterprise', title: 'enterpriseTitle', desc: 'enterpriseDesc', features: ['f13', 'f14', 'f15', 'f16', 'f17', 'f18', 'f19'] },
];

function ForUniversitiesPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);

  return (
    <main className="ds-page fu-page">
      <div className="ds-container">
        {/* Header */}
        <header className="fu-hero">
          <div className="fu-hero__copy ds-page-header">
            <span className="ds-eyebrow">{t('nav.forUniversities')}</span>
            <h1 className="ds-title">
              {t('forUniversitiesPage.titlePart1', 'Beynəlxalq Tələbələri Cəlb Edin')}{' '}
              <span className="fu-hero__accent">{t('forUniversitiesPage.titlePart2', 'Edusaz ilə Qlobal Tərəfdaşlıq')}</span>
            </h1>
            <p className="ds-lead">
              {t(
                'pages.forUniversities.lead',
                'Universitetinizi və proqramlarınızı xaricdə təhsil almaq istəyən tələbələrə tanıdın, qəbul və təqaüd müraciətlərini vahid portaldan idarə edin.'
              )}
            </p>
            <div className="fu-actions">
              <button type="button" className="ds-btn ds-btn--primary ds-btn--lg" onClick={openModal}>
                {t('forUniversitiesSection.partnerBtn', 'Edusaz ilə Tərəfdaş Olun')}
                <ArrowRight aria-hidden />
              </button>
              <Link to="/register" className="ds-btn ds-btn--secondary ds-btn--lg">
                {t('auth.createAccount')}
              </Link>
            </div>
          </div>

          <div className="fu-hero__visual">
            <img
              className="fu-hero__photo"
              src={CAMPUS_IMAGE}
              alt={t('pages.forUniversities.imageAlt', 'Universitet kampusu')}
              width="560"
              height="440"
            />
            <div className="fu-hero__note ds-card">
              <span className="fu-hero__note-icon">
                <Building2 aria-hidden />
              </span>
              <span>{t('pages.forUniversities.portalNote', 'Profil, proqramlar, təqaüdlər və müraciətlər — hamısı bir portalda')}</span>
            </div>
          </div>
        </header>

        {/* Benefits */}
        <section className="ds-section fu-section" aria-labelledby="fu-benefits-title">
          <div className="fu-section__head" data-reveal>
            <h2 id="fu-benefits-title" className="ds-h2">
              {t('pages.forUniversities.benefitsTitle', 'Tərəfdaşlığın üstünlükləri')}
            </h2>
          </div>
          <ul className="fu-benefits">
            {BENEFITS.map(({ key, icon: Icon }, i) => (
              <li key={key} className="ds-card ds-card--pad fu-benefit" data-reveal style={{ '--delay': `${i * 60}ms` }}>
                <span className="fu-benefit__icon">
                  <Icon aria-hidden />
                </span>
                <h3 className="ds-h3">{t(`forUniversitiesSection.${key}Title`)}</h3>
                <p className="ds-muted">{t(`forUniversitiesSection.${key}Desc`)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section className="ds-section fu-section" aria-labelledby="fu-steps-title">
          <div className="fu-section__head" data-reveal>
            <h2 id="fu-steps-title" className="ds-h2">
              {t('pages.forUniversities.stepsTitle', 'Necə işləyir?')}
            </h2>
          </div>
          <ol className="fu-steps">
            {STEPS.map((s, i) => (
              <li key={s} className="fu-step" data-reveal style={{ '--delay': `${i * 80}ms` }}>
                <span className="fu-step__num">0{i + 1}</span>
                <h3 className="ds-h3">{t(`pages.forUniversities.steps.${s}.title`, STEP_DEFAULTS[s].title)}</h3>
                <p className="ds-muted">{t(`pages.forUniversities.steps.${s}.desc`, STEP_DEFAULTS[s].desc)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What you get */}
        <section className="ds-section fu-section" aria-labelledby="fu-plans-title">
          <div className="fu-section__head" data-reveal>
            <h2 id="fu-plans-title" className="ds-h2">
              {t('pricingSection.headerTitlePart1')} {t('pricingSection.headerTitlePart2')}
            </h2>
            <p className="ds-lead">
              {t('pages.forUniversities.plansLead', 'Hər paketdə nələrin olduğunu aşağıda görə bilərsiniz. Sizə uyğun olanı birlikdə seçək.')}
            </p>
          </div>
          <ul className="fu-plans">
            {PLANS.map((plan, i) => (
              <li
                key={plan.key}
                className="ds-card fu-plan"
                data-featured={plan.featured ? 'true' : undefined}
                data-reveal
                style={{ '--delay': `${i * 60}ms` }}
              >
                <div className="fu-plan__head">
                  <h3 className="ds-h3">{t(`pricingSection.${plan.title}`)}</h3>
                  <p className="ds-muted">{t(`pricingSection.${plan.desc}`)}</p>
                </div>
                <p className="fu-plan__price">
                  {plan.price ? (
                    <>
                      {plan.price}
                      <span>{t('pricingSection.perMonth')}</span>
                    </>
                  ) : (
                    t('pricingSection.customPrice')
                  )}
                </p>
                <ul className="fu-plan__features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check aria-hidden />
                      <span>{t(`pricingSection.${f}`)}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`ds-btn ds-btn--block ${plan.featured ? 'ds-btn--primary' : 'ds-btn--secondary'}`}
                  onClick={openModal}
                >
                  {t('forUniversitiesSection.partnerBtn', 'Müraciət Et')}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Final CTA */}
        <section className="fu-cta" data-reveal aria-labelledby="fu-cta-title">
          <h2 id="fu-cta-title" className="ds-h2">
            {t('pages.forUniversities.ctaTitle', 'Universitetinizi Edusaz platformasına əlavə edək')}
          </h2>
          <p>{t('pages.forUniversities.ctaDesc', 'Qısa müraciət formunu doldurun, komandamız sizinlə əlaqə saxlayacaq.')}</p>
          <button type="button" className="ds-btn ds-btn--primary ds-btn--lg" onClick={openModal}>
            {t('forUniversitiesSection.partnerBtn', 'Edusaz ilə Tərəfdaş Olun')}
            <ArrowRight aria-hidden />
          </button>
        </section>
      </div>

      <PartnerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}

const STEP_DEFAULTS = {
  s1: {
    title: 'Müraciət göndərin',
    desc: 'Qısa formu doldurun — komandamız universitetiniz barədə məlumatı nəzərdən keçirib sizinlə əlaqə saxlayacaq.',
  },
  s2: {
    title: 'Profilinizi qurun',
    desc: 'Universitet portalında profilinizi, proqramlarınızı və təqaüdlərinizi əlavə edin.',
  },
  s3: {
    title: 'Tələbə müraciətlərini qəbul edin',
    desc: 'Uyğun tələbələrin müraciətlərini və analitikanı vahid paneldən izləyin.',
  },
};

export default ForUniversitiesPage;
