import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    <div className="payment-result-page fail-page">
      <div className="payment-result-container">
        <div className="status-badge-wrapper">
          <div className="status-icon-outer fail">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
        </div>

        <span className="payment-chip fail">
          {t('payment.failChip', 'Ödəniş Baş Tutmadı')}
        </span>

        <h1 className="payment-title">
          {t('payment.failTitle', 'Ödəniş İmtina Edildi')}
        </h1>

        <p className="payment-subtitle">
          {reason 
            ? reason 
            : t('payment.failDesc', 'Ödəniş əməliyyatı bank və ya kart təhlükəsizliyi səbəbindən tamamlanmadı. Zəhmət olmasa kart məlumatlarını yoxlayaraq yenidən cəhd edin.')}
        </p>

        <div className="payment-details-card">
          {orderId && (
            <div className="detail-row">
              <span className="detail-label">{t('payment.orderId', 'Sifariş / Əməliyyat Nömrəsi')}:</span>
              <span className="detail-value order-id">{orderId}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">{t('payment.status', 'Status')}:</span>
            <span className="detail-value status-tag fail">
              ● {t('payment.statusFail', 'Uğursuz / İmtina')}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('payment.method', 'Ödəniş Şlüzü')}:</span>
            <span className="detail-value">ePoint Payment Gateway</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('payment.date', 'Tarix')}:</span>
            <span className="detail-value">{new Date().toLocaleString('az-AZ')}</span>
          </div>
        </div>

        <div className="payment-actions">
          <button onClick={() => window.history.back()} className="btn-primary">
            {t('payment.tryAgain', 'Yenidən Cəhd Edin')}
          </button>
          <Link to="/" className="btn-secondary">
            {t('payment.backHome', 'Əsas Səhifəyə Qayıt')}
          </Link>
        </div>

        <div className="payment-support-hint">
          <p>
            {t('payment.supportHint', 'Hər hansı sualınız yaranarsa,')} <a href="mailto:support@edusaz.com">support@edusaz.com</a> {t('payment.supportHint2', 'ilə əlaqə saxlaya bilərsiniz.')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailPage;
