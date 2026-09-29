import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, Check, Mail } from 'lucide-react';
import { useConfirmOrderPaymentMutation, useGetPaymentStatusQuery } from '../../../services/apis/userApi.jsx';
import './index.scss';

function PaymentSuccessPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || searchParams.get('id') || '';
  const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id') || '';
  const transactionId = searchParams.get('transaction') || searchParams.get('transaction_id') || '';
  // Only show a receipt number that actually came from the gateway (no invented numbers).
  const displayOrderId = orderId || paymentId || transactionId;
  const amount = searchParams.get('amount') || '';
  const currency = searchParams.get('currency') || 'AZN';

  const [confirmOrder] = useConfirmOrderPaymentMutation();
  const { data: statusData } = useGetPaymentStatusQuery(
    { orderId: orderId || undefined, paymentId: paymentId || undefined },
    { skip: !orderId && !paymentId }
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    if (orderId || paymentId || transactionId) {
      confirmOrder({
        orderId: orderId || undefined,
        paymentId: paymentId || undefined,
        transactionId: transactionId || undefined,
        status: 'success'
      });
    }
  }, [orderId, paymentId, transactionId, confirmOrder]);

  const courseId = statusData?.courseId;
  const courseTitle = statusData?.courseTitle;
  const shownAmount = amount || statusData?.amount;
  // The gateway redirect alone is not proof of payment; trust the server once it has answered.
  const isPending = !!statusData?.status && statusData.status !== 'Paid';

  return (
    <main className="ds-page pr-page">
      <div className="ds-container">
        <section className="ds-card pr-card" data-tone="success" data-reveal aria-labelledby="pr-title">
          <div className="pr-icon" aria-hidden="true">
            <Check strokeWidth={2.25} />
          </div>

          <span className="ds-badge ds-badge--success pr-chip">
            {t('payment.successChip', 'Ödəniş Təsdiqləndi')}
          </span>

          <h1 id="pr-title" className="ds-h2 pr-title">
            {t('payment.successTitle', 'Ödəniş Uğurla Tamamlandı!')}
          </h1>

          <p className="pr-lead">
            {courseTitle
              ? t('pages.paymentSuccess.courseEnrolled', {
                  course: courseTitle,
                  defaultValue: 'Təbriklər! "{{course}}" kursuna qeydiyyatınız uğurla tamamlandı və dərslər aktivləşdirildi.'
                })
              : t('payment.successDesc', 'Əməliyyatınız uğurla icra olundu. Qeydiyyat və ya müraciətiniz sistemdə aktivləşdirildi.')}
          </p>

          <dl className="pr-summary">
            {displayOrderId && (
              <div className="pr-row">
                <dt>{t('payment.orderId', 'Sifariş / Qəbz Nömrəsi')}</dt>
                <dd className="pr-code">{displayOrderId}</dd>
              </div>
            )}
            {shownAmount && (
              <div className="pr-row">
                <dt>{t('payment.amount', 'Məbləğ')}</dt>
                <dd className="pr-amount">{shownAmount} {currency || statusData?.currency || 'AZN'}</dd>
              </div>
            )}
            <div className="pr-row">
              <dt>{t('payment.status', 'Status')}</dt>
              <dd>
                {isPending ? (
                  <span className="ds-badge ds-badge--warning pr-status">
                    {t('pages.paymentSuccess.pending', 'Ödəniş hələ yoxlanılır')}
                  </span>
                ) : (
                  <span className="ds-badge ds-badge--success pr-status">
                    {t('payment.statusSuccess', 'Uğurlu (Ödənilib)')}
                  </span>
                )}
              </dd>
            </div>
            <div className="pr-row">
              <dt>{t('payment.method', 'Ödəniş Şlüzü')}</dt>
              <dd>ePoint Payment Gateway</dd>
            </div>
            <div className="pr-row">
              <dt>{t('payment.date', 'Tarix')}</dt>
              <dd>{new Date(statusData?.paidAt || Date.now()).toLocaleString('az-AZ')}</dd>
            </div>
          </dl>

          <div className="pr-actions">
            {courseId ? (
              <Link to={`/courses/${courseId}`} className="ds-btn ds-btn--primary ds-btn--lg">
                {t('pages.paymentSuccess.goToCourse', 'Kursa keçin və dərslərə başlayın')}
                <ArrowRight aria-hidden="true" className="pr-dir-icon" />
              </Link>
            ) : (
              <Link to="/courses" className="ds-btn ds-btn--primary ds-btn--lg">
                <BookOpen aria-hidden="true" />
                {t('pages.paymentSuccess.browseCourses', 'Kurslara bax')}
              </Link>
            )}
            <Link to="/" className="ds-btn ds-btn--secondary ds-btn--lg">
              {t('payment.backHome', 'Əsas Səhifə')}
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

export default PaymentSuccessPage;
