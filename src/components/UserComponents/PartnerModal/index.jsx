import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Building2, CheckCircle2, Mail, X } from 'lucide-react';
import { useCreatePartnershipApplicationMutation } from '../../../services/apis/userApi';
import './index.scss';

const EMPTY_FORM = {
  institutionName: '',
  contactName: '',
  email: '',
  phone: '',
  country: '',
  message: ''
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function PartnerModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [createPartnershipApplication, { isLoading }] = useCreatePartnershipApplicationMutation();
  const [submitted, setSubmitted] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  const dialogRef = useRef(null);
  const closeTimerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Escape to close, focus trap, body scroll lock and focus restore while open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const focusFirst = () => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const first = dialog.querySelector('input, textarea') || dialog.querySelector(FOCUSABLE);
      (first || dialog).focus();
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const nodes = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE)).filter((n) => n.offsetParent !== null);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    };
  }, [isOpen]);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  if (!isOpen) return null;

  const update = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      const res = await createPartnershipApplication(formData).unwrap();
      setResponseMsg(res.message || res.data?.message || 'Tərəfdaşlıq müraciətiniz bazada saxlanıldı, xəbərdarlıq e-poçtları göndərildi!');
      setSubmitted(true);
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        setSubmitted(false);
        setFormData(EMPTY_FORM);
        onCloseRef.current?.();
      }, 4000);
    } catch (err) {
      // The API returns 400 when the application could not be saved — keep the form open so the user can retry.
      console.error('Partnership application submit error:', err);
      setSubmitError(t('pages.partnerModal.error', 'Müraciət göndərilmədi. Zəhmət olmasa bir az sonra yenidən cəhd edin.'));
    }
  };

  return createPortal(
    <div className="pm-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="pm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
      >
        <button type="button" className="pm-close ds-btn ds-btn--ghost" onClick={onClose} aria-label={t('pages.partnerModal.close', 'Bağla')}>
          <X aria-hidden />
        </button>

        {submitted ? (
          <div className="pm-success" role="status">
            <span className="pm-success__icon">
              <CheckCircle2 aria-hidden />
            </span>
            <h2 id={titleId} className="ds-h3">
              {t('partnerModal.successTitle', 'Tərəfdaşlıq Müraciətiniz Qəbul Olundu!')}
            </h2>
            <p id={descId} className="ds-muted">{responseMsg}</p>
            <p className="pm-success__note">
              <Mail aria-hidden />
              <span>
                {t('partnerModal.successEmailSent', {
                  email: formData.email,
                  defaultValue: 'Təsdiq məktubu {{email}} ünvanına göndərildi.'
                })}
              </span>
            </p>
          </div>
        ) : (
          <form className="pm-form" onSubmit={handleSubmit}>
            <div className="pm-header">
              <span className="pm-header__icon">
                <Building2 aria-hidden />
              </span>
              <h2 id={titleId} className="ds-h3 pm-header__title">
                {t('forUniversitiesSection.partnerBtn', 'Edusaz ilə Tərəfdaş Olun')}
              </h2>
              <p id={descId} className="ds-muted">
                {t('partnerModal.subtitle', 'Universitetinizi Edusaz platformasında qeydiyyatdan keçirin və qlobal tələbələrə çatın.')}
              </p>
            </div>

            <div className="ds-field">
              <label className="ds-label" htmlFor={`${uid}-inst`}>
                {t('partnerModal.institutionName', 'Universitet / Müəssisə Adı')} <span className="pm-req" aria-hidden>*</span>
              </label>
              <input
                id={`${uid}-inst`}
                className="ds-input"
                type="text"
                required
                autoComplete="organization"
                placeholder={t('partnerModal.institutionName', 'Universitet / Müəssisə Adı')}
                value={formData.institutionName}
                onChange={update('institutionName')}
              />
            </div>

            <div className="pm-row">
              <div className="ds-field">
                <label className="ds-label" htmlFor={`${uid}-contact`}>
                  {t('partnerModal.contactName', 'Nümayəndənin Adı Soyadı')} <span className="pm-req" aria-hidden>*</span>
                </label>
                <input
                  id={`${uid}-contact`}
                  className="ds-input"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder={t('partnerModal.contactName', 'Nümayəndənin Adı Soyadı')}
                  value={formData.contactName}
                  onChange={update('contactName')}
                />
              </div>

              <div className="ds-field">
                <label className="ds-label" htmlFor={`${uid}-email`}>
                  {t('partnerModal.email', 'Rəsmi E-poçt')} <span className="pm-req" aria-hidden>*</span>
                </label>
                <input
                  id={`${uid}-email`}
                  className="ds-input"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="contact@university.edu"
                  value={formData.email}
                  onChange={update('email')}
                />
              </div>
            </div>

            <div className="pm-row">
              <div className="ds-field">
                <label className="ds-label" htmlFor={`${uid}-phone`}>
                  {t('partnerModal.phone', 'Əlaqə Nömrəsi')}
                </label>
                <input
                  id={`${uid}-phone`}
                  className="ds-input"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+994 50 123 45 67"
                  value={formData.phone}
                  onChange={update('phone')}
                />
              </div>

              <div className="ds-field">
                <label className="ds-label" htmlFor={`${uid}-country`}>
                  {t('partnerModal.country', 'Ölkə')}
                </label>
                <input
                  id={`${uid}-country`}
                  className="ds-input"
                  type="text"
                  autoComplete="country-name"
                  placeholder={t('partnerModal.country', 'Ölkə')}
                  value={formData.country}
                  onChange={update('country')}
                />
              </div>
            </div>

            <div className="ds-field">
              <label className="ds-label" htmlFor={`${uid}-msg`}>
                {t('partnerModal.message', 'Əlavə Qeyd / Mesaj')}
              </label>
              <textarea
                id={`${uid}-msg`}
                className="ds-textarea"
                rows="3"
                placeholder={t('partnerModal.message', 'Əlavə Qeyd / Mesaj')}
                value={formData.message}
                onChange={update('message')}
              />
            </div>

            {submitError && (
              <p className="ds-error pm-error" role="alert">
                {submitError}
              </p>
            )}

            <button type="submit" className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block" disabled={isLoading}>
              {isLoading ? (
                t('profile.saving', 'Göndərilir...')
              ) : (
                <>
                  {t('partnerModal.sendBtn', 'Müraciəti Göndər')}
                  <ArrowRight aria-hidden className="pm-arrow" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

export default PartnerModal;
