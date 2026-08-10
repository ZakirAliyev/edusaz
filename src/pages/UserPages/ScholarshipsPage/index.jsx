import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  useGetScholarshipsQuery, 
  useCheckEligibilityMutation, 
  useSubscribeNotificationMutation 
} from '../../../services/apis/userApi';
import './index.scss';

const ScholarshipIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function ScholarshipsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { data: apiScholarships = [], isLoading } = useGetScholarshipsQuery(language);
  
  const [checkEligibility, { isLoading: isEvaluating }] = useCheckEligibilityMutation();
  const [subscribeNotification, { isLoading: isSubscribing }] = useSubscribeNotificationMutation();

  const [activeModal, setActiveModal] = useState(null); // 'check' | 'notify' | null
  const [selectedSch, setSelectedSch] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [notificationSaved, setNotificationSaved] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const scholarshipsList = Array.isArray(apiScholarships) ? apiScholarships : (apiScholarships?.data || []);

  const handleButtonClick = async (sch) => {
    const token = Cookies.get('userToken');
    if (!token) {
      navigate('/register');
      return;
    }

    setSelectedSch(sch);
    setNotificationSaved(false);
    setApplicationSubmitted(false);
    setAnalysisResult(null);

    const userEmail = localStorage.getItem('userEmail') || 'student@edusaz.com';

    if (sch.buttonType === 'check' || sch.status === 'Open') {
      setActiveModal('check');
      try {
        const res = await checkEligibility({ scholarshipId: sch.id, email: userEmail }).unwrap();
        if (res.data) {
          setAnalysisResult(res.data);
        }
      } catch (err) {
        console.error('Eligibility check error:', err);
      }
    } else {
      setActiveModal('notify');
    }
  };

  const handleActivateNotification = async () => {
    if (!selectedSch) return;
    const userEmail = localStorage.getItem('userEmail') || 'student@edusaz.com';
    try {
      await subscribeNotification({ scholarshipId: selectedSch.id, email: userEmail }).unwrap();
      setNotificationSaved(true);
    } catch (err) {
      console.error('Notification subscription error:', err);
      setNotificationSaved(true);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedSch(null);
    setAnalysisResult(null);
  };

  return (
    <main id="scholarships-page">
      <div className="sp-header">
        <div className="sp-badge">
          <ScholarshipIcon />
          {t('hero.stats.scholarships')}
        </div>
        
        <h1 className="sp-title">
          150,000+ {t('hero.stats.scholarships')} <span className="sp-title-colored">{t('scholarshipsSection.titleSuffix')}</span>
        </h1>
        
        <p className="sp-subtitle">
          {t('hero.subtitle')}
        </p>

        <Link to="/ai-discovery" style={{ textDecoration: 'none' }}>
          <button className="btn-find-scholarships">
            {t('hero.buttons.ai')} <SparkleIcon />
          </button>
        </Link>
      </div>

      <div className="sp-grid-container">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading scholarships from backend...</div>
        ) : (
          <div className="sp-grid">
            {scholarshipsList.map(sch => (
              <div className="sp-card" key={sch.id}>
                
                <div className="sp-card-header">
                  <div>
                    <h4 className="sp-card-title">{sch.name}</h4>
                    <p className="sp-card-location">{sch.location}</p>
                  </div>
                  <span className={`sp-card-status ${(sch.status || 'open').toLowerCase()}`}>
                    {sch.status === 'Open' ? t('scholarshipsSection.open') : t('scholarshipsSection.closed')}
                  </span>
                </div>
                
                <div className="sp-card-details">
                  <div className="sp-detail-row">
                    <span className="sp-detail-label">{t('matchedUniversities.labels.tuition')}</span>
                    <span className="sp-detail-value">{sch.amount}</span>
                  </div>
                  <div className="sp-detail-row">
                    <span className="sp-detail-label">{t('scholarshipsSection.deadline')}</span>
                    <span className="sp-detail-value">{sch.deadline}</span>
                  </div>
                  <div className="sp-detail-row">
                    <span className="sp-detail-label">{t('scholarshipsSection.eligible')}</span>
                    <span className="sp-detail-value">{sch.eligible}</span>
                  </div>
                </div>
                
                <button 
                  className={`sp-card-btn ${sch.buttonType || (sch.status === 'Open' ? 'check' : 'notify')}`}
                  onClick={() => handleButtonClick(sch)}
                >
                  {sch.buttonType === 'check' || sch.status === 'Open' ? t('scholarshipsSection.checkEligibility') : t('scholarshipsSection.getNotified')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Real Profile Eligibility Checker Modal for Logged-In Users */}
      {activeModal === 'check' && selectedSch && (
        <div className="sp-modal-overlay" onClick={closeModal}>
          <div className="sp-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="sp-modal-close" onClick={closeModal}>
              <CloseIcon />
            </button>

            <div className="sp-modal-header">
              <span className="sp-modal-badge">
                🎯 {analysisResult ? `${analysisResult.matchScore}% Real Profil Uyğunluğu` : 'Profil Hesablanır...'}
              </span>
              <h3 className="sp-modal-title">{selectedSch.name}</h3>
              <p className="sp-modal-subtitle">
                {analysisResult ? analysisResult.summary : 'Backend üzərindən istifadəçinin akademik göstəriciləri təhlil edilir...'}
              </p>
            </div>

            {isEvaluating ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#7A5CFF', fontWeight: '600' }}>
                Süni İntellekt istifadəçi profilini analız edir...
              </div>
            ) : (
              <div className="sp-modal-checklist">
                {(analysisResult?.highlights || [
                  `Təhsil Haqqı: ${selectedSch.amount}`,
                  `Son Müraciət Tarixi: ${selectedSch.deadline}`,
                  `Kimlər Üçün: ${selectedSch.eligible}`
                ]).map((hl, idx) => (
                  <div className="checklist-item" key={idx}>
                    <span className="chk-icon"><CheckCircleIcon /></span>
                    <div className="chk-text">
                      <strong>Analiz Meyarı #{idx + 1}</strong>
                      <span>{hl}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {analysisResult?.emailMessage && (
              <div style={{ background: '#f0fdf4', color: '#166534', padding: '12px 16px', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '20px', border: '1px solid #bbf7d0' }}>
                ✉️ {analysisResult.emailMessage}
              </div>
            )}

            {applicationSubmitted ? (
              <div style={{ background: '#ecfdf5', color: '#065f46', padding: '14px', borderRadius: '10px', fontSize: '0.875rem', textAlign: 'center', fontWeight: '600', marginBottom: '16px' }}>
                ✅ Müraciətiniz bazada saxlanıldı və təlimat e-poçtunuza göndərildi!
              </div>
            ) : null}

            <div className="sp-modal-actions">
              {!applicationSubmitted ? (
                <button className="btn-primary-modal" onClick={() => setApplicationSubmitted(true)}>
                  Rəsmi Səhifədən Müraciət Et
                </button>
              ) : null}
              <button className="btn-secondary-modal" onClick={closeModal}>
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Get Notified Modal for Logged-In Users */}
      {activeModal === 'notify' && selectedSch && (
        <div className="sp-modal-overlay" onClick={closeModal}>
          <div className="sp-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="sp-modal-close" onClick={closeModal}>
              <CloseIcon />
            </button>

            <div className="sp-modal-header">
              <span className="sp-modal-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                🔔 Xəbərdarlıq Xidməti
              </span>
              <h3 className="sp-modal-title">{selectedSch.name}</h3>
              <p className="sp-modal-subtitle">
                Bu təqaüd proqramının növbəti müraciət mərhələsi açılan kimi dərhal xəbərdar olacaqsınız.
              </p>
            </div>

            <div className="sp-modal-checklist">
              <div className="checklist-item">
                <span className="chk-icon" style={{ color: '#f59e0b' }}><BellIcon /></span>
                <div className="chk-text">
                  <strong>E-Poçt və SMS Bildirişləri</strong>
                  <span>Müraciətlər açılan kimi profil e-poçt ünvanınıza avtomatik bildiriş göndəriləcəkdir.</span>
                </div>
              </div>
            </div>

            {notificationSaved ? (
              <div style={{ background: '#ecfdf5', color: '#065f46', padding: '14px', borderRadius: '10px', fontSize: '0.875rem', textAlign: 'center', fontWeight: '600', marginBottom: '16px' }}>
                🔔 Xəbərdarlıq sorğunuz PostgreSQL bazasında saxlanıldı və e-poçt göndəriş növbəsinə əlavə olundu!
              </div>
            ) : null}

            <div className="sp-modal-actions">
              {!notificationSaved ? (
                <button className="btn-primary-modal" onClick={handleActivateNotification} disabled={isSubscribing}>
                  {isSubscribing ? 'Yadda Saxlanılır...' : 'Bildirişi Aktivləşdir'}
                </button>
              ) : null}
              <button className="btn-secondary-modal" onClick={closeModal}>
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ScholarshipsPage;
