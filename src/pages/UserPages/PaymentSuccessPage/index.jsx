import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './index.scss';

function PaymentSuccessPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || searchParams.get('id') || searchParams.get('transaction_id') || 'EDU-' + Math.floor(100000 + Math.random() * 900000);
  const amount = searchParams.get('amount') || '';
  const currency = searchParams.get('currency') || 'AZN';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="payment-result-page success-page">
      <div className="payment-result-container">
        <div className="status-badge-wrapper">
          <div className="status-icon-outer success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
        </div>

        <span className="payment-chip success">
          {t('payment.successChip', 'Ödəniş Təsdiqləndi')}
        </span>

        <h1 className="payment-title">
          {t('payment.successTitle', 'Ödəniş Uğurla Tamamlandı!')}
        </h1>

        <p className="payment-subtitle">
          {t('payment.successDesc', 'Əməliyyatınız uğurla icra olundu. Qeydiyyat və ya müraciətiniz sistemdə aktivləşdirildi.')}
        </p>

        <div className="payment-details-card">
          <div className="detail-row">
            <span className="detail-label">{t('payment.orderId', 'Sifariş / Qəbz Nömrəsi')}:</span>
            <span className="detail-value order-id">{orderId}</span>
          </div>
          {amount && (
            <div className="detail-row">
              <span className="detail-label">{t('payment.amount', 'Məbləğ')}:</span>
              <span className="detail-value amount-value">{amount} {currency}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">{t('payment.status', 'Status')}:</span>
            <span className="detail-value status-tag success">
              ● {t('payment.statusSuccess', 'Uğurlu')}
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
          <Link to="/" className="btn-primary">
            {t('payment.backHome', 'Əsas Səhifəyə Qayıt')}
          </Link>
          <Link to="/universities" className="btn-secondary">
            {t('payment.browseUniversities', 'Universitetləri İncələ')}
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

export default PaymentSuccessPage;
