import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';
import './index.scss';

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className="ds-page">
      <div className="ds-container">
        <section className="nf" aria-labelledby="nf-title">
          <span className="nf__icon" aria-hidden>
            <Compass />
          </span>
          <h1 id="nf-title" className="ds-h2">{t('pages.notFound.title', 'Səhifə tapılmadı')}</h1>
          <p className="ds-muted">{t('pages.notFound.desc', 'Axtardığınız səhifə mövcud deyil və ya köçürülüb.')}</p>
          <Link to="/" className="ds-btn ds-btn--primary">
            {t('pages.notFound.home', 'Ana səhifəyə qayıt')}
          </Link>
        </section>
      </div>
    </main>
  );
}

export default NotFoundPage;
