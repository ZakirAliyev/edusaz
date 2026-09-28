import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, RotateCcw, X } from 'lucide-react';
import '../PaymentSuccessPage/index.scss';

function PaymentFailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || searchParams.get('id') || searchParams.get('transaction_id') || '';
  const reason = searchParams.get('message') || searchParams.get('error') || searchParams.get('reason') || '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="ds-page pr-page">
      <div className="ds-container">
        <section className="ds-card pr-card" data-tone="fail" data-reveal aria-labelledby="pr-title">
          <div className="pr-icon" aria-hidden="true">
            <X strokeWidth={2.25} />
          </div>

          <span className="ds-badge ds-badge--danger pr-chip">
            {t('payment.failChip', 'Ödəniş Baş Tutmadı')}
          </span>

          <h1 id="pr-title" className="ds-h2 pr-title">
            {t('payment.failTitle', 'Ödəniş İmtina Edildi')}
          </h1>

          <p className="pr-lead">
            {reason
              ? reason
              : t('payment.failDesc', 'Ödəniş əməliyyatı bank və ya kart təhlükəsizliyi səbəbindən tamamlanmadı. Zəhmət olmasa kart məlumatlarını yoxlayaraq yenidən cəhd edin.')}
          </p>

          <dl className="pr-summary">
            {orderId && (
              <div className="pr-row">
                <dt>{t('payment.orderId', 'Sifariş / Əməliyyat Nömrəsi')}</dt>
                <dd className="pr-code">{orderId}</dd>
              </div>
            )}
            <div className="pr-row">
              <dt>{t('payment.status', 'Status')}</dt>
              <dd>
                <span className="ds-badge ds-badge--danger pr-status">
                  {t('payment.statusFail', 'Uğursuz / İmtina')}
                </span>
              </dd>
            </div>
            <div className="pr-row">
              <dt>{t('payment.method', 'Ödəniş Şlüzü')}</dt>
              <dd>ePoint Payment Gateway</dd>
            </div>
            <div className="pr-row">
              <dt>{t('payment.date', 'Tarix')}</dt>
              <dd>{new Date().toLocaleString('az-AZ')}</dd>
            </div>
          </dl>

          <div className="pr-actions">
            <button type="button" onClick={() => window.history.back()} className="ds-btn ds-btn--primary ds-btn--lg">
              <RotateCcw aria-hidden="true" />
              {t('payment.tryAgain', 'Yenidən Cəhd Edin')}
            </button>
            <Link to="/" className="ds-btn ds-btn--secondary ds-btn--lg">
              {t('payment.backHome', 'Əsas Səhifəyə Qayıt')}
            </Link>
          </div>

          <p className="pr-support">
            <Mail aria-hidden="true" />
            <span>
              {t('payment.supportHint', 'Hər hansı sualınız yaranarsa,')}{' '}
              <a href="mailto:support@edusaz.com" className="ds-link">support@edusaz.com</a>{' '}
              {t('payment.supportHint2', 'ilə əlaqə saxlaya bilərsiniz.')}
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}

export default PaymentFailPage;
