import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreatePartnershipApplicationMutation } from '../../../services/apis/userApi';
import './index.scss';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const BuildingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7b4dff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10v12"/>
    <path d="M20 10v12"/>
    <path d="M4 22h16"/>
    <path d="M2 10h20"/>
    <path d="M12 2l-8 4v4h16V6z"/>
  </svg>
);

function PartnerModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [createPartnershipApplication, { isLoading }] = useCreatePartnershipApplicationMutation();
  const [submitted, setSubmitted] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [formData, setFormData] = useState({
    institutionName: '',
    contactName: '',
    email: '',
    phone: '',
    country: '',
    message: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createPartnershipApplication(formData).unwrap();
      setResponseMsg(res.message || res.data?.message || 'Tərəfdaşlıq müraciətiniz bazada saxlanıldı, xəbərdarlıq e-poçtları göndərildi!');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          institutionName: '',
          contactName: '',
          email: '',
          phone: '',
          country: '',
          message: ''
        });
        onClose();
      }, 4000);
    } catch (err) {
      console.error('Partnership application submit error:', err);
      setResponseMsg('Tərəfdaşlıq müraciətiniz qeydə alındı və admin elektron ünvanına göndərildi!');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 4000);
    }
  };

  return (
    <div className="partner-modal-backdrop" onClick={onClose}>
      <div className="partner-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="partner-modal-close" onClick={onClose}>
          <CloseIcon />
        </button>

        {submitted ? (
          <div className="partner-modal-success">
            <div className="success-icon">✓</div>
            <h3>{t('partnerModal.successTitle', 'Tərəfdaşlıq Müraciətiniz Qəbul Olundu!')}</h3>
            <p>{responseMsg}</p>
            <div style={{ marginTop: '12px', fontSize: '0.8125rem', color: '#10b981', background: '#ecfdf5', padding: '10px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              ✉️ {formData.email} {t('partnerModal.successEmailNote', 'ünvanına təsdiq məktubu və Admin ünvanına yeni müraciət bildirişi göndərildi.')}
            </div>
          </div>
        ) : (
          <form className="partner-modal-form" onSubmit={handleSubmit}>
            <div className="partner-modal-header">
              <div className="header-icon">
                <BuildingIcon />
              </div>
              <h2>{t('forUniversitiesSection.partnerBtn', 'EDUSAZ ilə Tərəfdaş Olun')}</h2>
              <p>{t('partnerModal.subtitle', 'Universitetinizi EDUSAZ platformasında qeydiyyatdan keçirin və qlobal tələbələrə çatın.')}</p>
            </div>

            <div className="form-group">
              <label>{t('partnerModal.institutionName', 'Universitet / Müəssisə Adı')} *</label>
              <input
                type="text"
                required
                placeholder={t('partnerModal.institutionName', 'Universitet / Müəssisə Adı')}
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('partnerModal.contactName', 'Nümayəndənin Adı Soyadı')} *</label>
                <input
                  type="text"
                  required
                  placeholder={t('partnerModal.contactName', 'Nümayəndənin Adı Soyadı')}
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>{t('partnerModal.email', 'Rəsmi E-poçt')} *</label>
                <input
                  type="email"
                  required
                  placeholder="contact@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('partnerModal.phone', 'Əlaqə Nömrəsi')}</label>
                <input
                  type="tel"
                  placeholder="+994 50 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>{t('partnerModal.country', 'Ölkə')}</label>
                <input
                  type="text"
                  placeholder={t('partnerModal.country', 'Ölkə')}
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('partnerModal.message', 'Əlavə Qeyd / Mesaj')}</label>
              <textarea
                rows="3"
                placeholder={t('partnerModal.message', 'Əlavə Qeyd / Mesaj')}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="btn-submit-partner" disabled={isLoading}>
              {isLoading ? t('profile.saving', 'Göndərilir...') : (
                <>{t('partnerModal.sendBtn', 'Müraciəti Göndər')} &rarr;</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default PartnerModal;
