import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Compass,
  GraduationCap,
  Mail,
  MapPin,
  Search,
  SearchX,
  Target,
  X,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  useGetScholarshipsQuery,
  useCheckEligibilityMutation,
  useSubscribeNotificationMutation,
  useCreateStudentApplicationMutation
} from '../../../services/apis/userApi';
import { AutoTranslate } from '../../../hooks/useAutoTranslate';
import './index.scss';

const STATUS_FILTERS = ['All', 'Open', 'Closed'];
const CLOSING_SOON_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// Deadlines are free text from the API. Parse the common shapes (ISO, dd.mm.yyyy, "May 15, 2026")
// so we can show a localized date and a "closing soon" hint; otherwise the raw text is shown as-is.
function parseDeadline(value) {
  if (!value || typeof value !== 'string') return null;
  const text = value.trim();
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const dmy = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  let date;
  if (iso) date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  else if (dmy) date = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  else date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Some browsers lack month names for a locale (Chrome renders `az` as "2026 M10 12"), so fall back to dd.mm.yyyy.
function formatDate(date, language) {
  try {
    const parts = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(date);
    const month = parts.find((p) => p.type === 'month')?.value || '';
    if (!/^M?\d+$/.test(month)) return parts.map((p) => p.value).join('');
  } catch {
    // Invalid locale tag — use the numeric fallback below.
  }
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function getDeadlineInfo(raw, language) {
  const date = parseDeadline(raw);
  if (!date) return { label: raw, closingSoon: false, dateTime: undefined };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((date - today) / DAY_MS);
  return {
    label: formatDate(date, language),
    closingSoon: daysLeft >= 0 && daysLeft <= CLOSING_SOON_DAYS,
    dateTime: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
  };
}

function SkeletonCard() {
  return (
    <li className="sp-card sp-card--skeleton" aria-hidden>
      <span className="ds-skeleton" style={{ width: 72, height: 22, borderRadius: 999 }} />
      <span className="ds-skeleton" style={{ width: '80%', height: 22 }} />
      <span className="ds-skeleton" style={{ width: '45%', height: 16 }} />
      <span className="ds-skeleton" style={{ width: '100%', height: 96, marginTop: 8 }} />
      <span className="ds-skeleton" style={{ width: '100%', height: 44, marginTop: 'auto' }} />
    </li>
  );
}

function ScholarshipsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { data: apiScholarships = [], isLoading } = useGetScholarshipsQuery(language);

  const [checkEligibility, { isLoading: isEvaluating }] = useCheckEligibilityMutation();
  const [subscribeNotification, { isLoading: isSubscribing }] = useSubscribeNotificationMutation();
  const [createApplication] = useCreateStudentApplicationMutation();

  const [activeModal, setActiveModal] = useState(null); // 'check' | 'notify' | null
  const [selectedSch, setSelectedSch] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [notificationSaved, setNotificationSaved] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const rawList = Array.isArray(apiScholarships) ? apiScholarships : (apiScholarships?.data || []);
  const scholarshipsList = rawList.filter(sch => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (sch.name || '').toLowerCase().includes(q) || (sch.location || '').toLowerCase().includes(q) || (sch.eligible || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || (sch.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

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

    const userEmail = localStorage.getItem('userEmail') || '';

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
    const userEmail = localStorage.getItem('userEmail') || '';
    try {
      await subscribeNotification({ scholarshipId: selectedSch.id, email: userEmail }).unwrap();
      setNotificationSaved(true);
    } catch (err) {
      console.error('Notification subscription error:', err);
      setNotificationSaved(true);
    }
  };

  const handleScholarshipApply = async () => {
    if (!selectedSch) return;
    const userEmail = localStorage.getItem('userEmail') || '';
    const userName = localStorage.getItem('userName') || 'Tələbə';
    try {
      if (selectedSch.universityId) {
        await createApplication({
          universityId: selectedSch.universityId,
          studentName: userName,
          programName: `Təqaüd Müraciəti: ${selectedSch.name}`,
          email: userEmail,
          originCountry: 'Azərbaycan',
          countryFlag: '🇦🇿',
          matchScore: analysisResult?.matchScore || 90
        }).unwrap();
      }
    } catch (err) {
      console.error('App error:', err);
    }
    setApplicationSubmitted(true);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedSch(null);
    setAnalysisResult(null);
  };

  // Close the dialog with Escape.
  useEffect(() => {
    if (!activeModal) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
        setSelectedSch(null);
        setAnalysisResult(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeModal]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
  };

  const statusLabel = (st) => (st === 'All'
    ? t('common.all', 'Hamısı')
    : (st === 'Open' ? t('scholarshipsSection.open', 'Açıq') : t('scholarshipsSection.closed', 'Yaxında')));

  const renderResults = () => {
    if (isLoading) {
      return (
        <ul className="sp-grid" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </ul>
      );
    }

    if (rawList.length === 0) {
      return (
        <div className="ds-empty sp-empty" data-reveal>
          <span className="sp-empty__icon"><GraduationCap aria-hidden /></span>
          <strong>{t('pages.scholarships.emptyTitle', 'Hazırda aktiv təqaüd yoxdur')}</strong>
          <p>{t('pages.scholarships.emptyText', 'Universitetlər yeni təqaüd proqramları əlavə etdikcə onlar burada görünəcək. Bu vaxt universitetlərə baxa və ya AI ilə sənə uyğun seçimləri tapa bilərsən.')}</p>
          <div className="sp-empty__actions">
            <Link to="/universities" className="ds-btn ds-btn--primary">
              {t('pages.scholarships.browseUniversities', 'Universitetlərə bax')} <ArrowRight aria-hidden className="sp-flip" />
            </Link>
            <Link to="/ai-discovery" className="ds-btn ds-btn--secondary">
              <Compass aria-hidden /> {t('hero.buttons.ai')}
            </Link>
          </div>
        </div>
      );
    }

    if (scholarshipsList.length === 0) {
      return (
        <div className="ds-empty sp-empty">
          <SearchX aria-hidden />
          <strong>{t('scholarshipsSection.notFound', 'Axtarışa uyğun təqaüd tapılmadı.')}</strong>
          <button type="button" className="ds-btn ds-btn--secondary ds-btn--sm" onClick={resetFilters}>
            {t('pages.scholarships.resetFilters', 'Filtrləri sıfırla')}
          </button>
        </div>
      );
    }

    return (
      <ul className="sp-grid">
        {scholarshipsList.map((sch, i) => {
          const isCheck = sch.buttonType === 'check' || sch.status === 'Open';
          const isOpen = (sch.status || 'Open') === 'Open';
          const deadline = sch.deadline ? getDeadlineInfo(sch.deadline, language) : null;
          return (
            <li key={sch.id} className="sp-grid__item" data-reveal style={{ '--delay': `${Math.min(i, 5) * 60}ms` }}>
              <article className="sp-card">
                <div className="sp-card__badges">
                  <span className={`ds-badge ${isOpen ? 'ds-badge--success' : ''}`}>
                    <span className="sp-dot" aria-hidden />
                    {sch.status === 'Open' ? t('scholarshipsSection.open') : t('scholarshipsSection.closed')}
                  </span>
                  {isOpen && deadline?.closingSoon && (
                    <span className="ds-badge ds-badge--warning">
                      {t('pages.scholarships.closingSoon', 'Tezliklə bağlanır')}
                    </span>
                  )}
                </div>

                <h2 className="sp-card__title">{sch.name}</h2>
                {sch.location && (
                  <p className="sp-card__location">
                    <MapPin aria-hidden /> {sch.location}
                  </p>
                )}

                <dl className="sp-card__facts">
                  {sch.amount && (
                    <div className="sp-fact sp-fact--wide">
                      <dt>{t('pages.scholarships.coverage', 'Əhatə')}</dt>
                      <dd className="sp-fact__strong">{sch.amount}</dd>
                    </div>
                  )}
                  {deadline && (
                    <div className="sp-fact">
                      <dt>{t('scholarshipsSection.deadline')}</dt>
                      <dd>
                        <CalendarClock aria-hidden />
                        {deadline.dateTime ? <time dateTime={deadline.dateTime}>{deadline.label}</time> : deadline.label}
                      </dd>
                    </div>
                  )}
                  {sch.places && (
                    <div className="sp-fact">
                      <dt>{t('pages.scholarships.places', 'Yer sayı')}</dt>
                      <dd>{sch.places}</dd>
                    </div>
                  )}
                  {sch.eligible && (
                    <div className="sp-fact sp-fact--wide">
                      <dt>{t('scholarshipsSection.eligible')}</dt>
                      <dd>{sch.eligible}</dd>
                    </div>
                  )}
                </dl>

                <button
                  type="button"
                  className={`ds-btn ds-btn--block ${isCheck ? 'ds-btn--primary' : 'ds-btn--secondary'} sp-card__btn`}
                  onClick={() => handleButtonClick(sch)}
                >
                  {isCheck ? <Target aria-hidden /> : <Bell aria-hidden />}
                  {isCheck ? t('scholarshipsSection.checkEligibility') : t('scholarshipsSection.getNotified')}
                </button>
              </article>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <main className="ds-page sp-page" id="scholarships-page">
      <div className="ds-container">
        <header className="ds-page-header sp-header" data-reveal>
          <span className="ds-eyebrow">{t('hero.stats.scholarships')}</span>
          <div className="sp-header__row">
            <div className="sp-header__text">
              <h1 className="ds-title">{t('pages.scholarships.title', 'Xarici tələbələr üçün təqaüdlər')}</h1>
              <p className="ds-lead">
                {t('pages.scholarships.subtitle', 'Universitetlərin təklif etdiyi tam və qismən maliyyələşdirilən təqaüdləri bir yerdə gör, şərtlərini müqayisə et və uyğunluğunu yoxla.')}
              </p>
            </div>
            <Link to="/ai-discovery" className="ds-btn ds-btn--secondary sp-header__cta">
              <Compass aria-hidden /> {t('hero.buttons.ai')}
            </Link>
          </div>
        </header>

        {rawList.length > 0 && (
          <div className="sp-toolbar" data-reveal>
            <div className="sp-search">
              <label htmlFor="sp-search-input" className="sp-sr-only">
                {t('scholarshipsSection.searchPlaceholder', 'Təqaüd adı, ölkə və ya tələblər üzrə axtar...')}
              </label>
              <Search aria-hidden className="sp-search__icon" />
              <input
                id="sp-search-input"
                type="search"
                className="ds-input sp-search__input"
                placeholder={t('scholarshipsSection.searchPlaceholder', 'Təqaüd adı, ölkə və ya tələblər üzrə axtar...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="sp-search__clear"
                  onClick={() => setSearchQuery('')}
                  aria-label={t('pages.scholarships.clearSearch', 'Axtarışı təmizlə')}
                >
                  <X aria-hidden />
                </button>
              )}
            </div>
            <div className="sp-chips" role="group" aria-label={t('pages.scholarships.statusFilter', 'Status')}>
              {STATUS_FILTERS.map(st => (
                <button
                  key={st}
                  type="button"
                  className="ds-chip"
                  aria-pressed={statusFilter === st}
                  onClick={() => setStatusFilter(st)}
                >
                  {statusLabel(st)}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isLoading && rawList.length > 0 && (
          <p className="sp-count ds-muted" aria-live="polite">
            {t('pages.scholarships.count', '{{count}} təqaüd', { count: scholarshipsList.length })}
          </p>
        )}

        {renderResults()}
      </div>

      {/* Modal 1: Real Profile Eligibility Checker Modal for Logged-In Users */}
      {/* Dialogs are portaled to <body>: the route wrapper keeps a transform, which would trap position: fixed. */}
      {activeModal === 'check' && selectedSch && createPortal(
        <div className="sp-modal" onClick={closeModal}>
          <div
            className="sp-modal__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sp-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="sp-modal__close" onClick={closeModal} aria-label={t('common.close', 'Bağla')} autoFocus>
              <X aria-hidden />
            </button>

            <div className="sp-modal__header">
              <span className="ds-badge ds-badge--brand">
                <Target aria-hidden className="sp-badge-icon" />
                {analysisResult ? `${analysisResult.matchScore}% ${t('matchedUniversities.match', 'Uyğunluq')}` : t('profile.saving', 'Hesablanır...')}
              </span>
              <h2 id="sp-modal-title" className="ds-h3 sp-modal__title"><AutoTranslate text={selectedSch.name} /></h2>
              <p className="sp-modal__subtitle">
                {analysisResult ? <AutoTranslate text={analysisResult.summary} /> : t('scholarshipsSection.evaluating', 'Backend üzərindən istifadəçinin akademik göstəriciləri təhlil edilir...')}
              </p>
            </div>

            {isEvaluating ? (
              <div className="sp-modal__loading" aria-busy="true">
                <span className="ds-skeleton" style={{ height: 56 }} />
                <span className="ds-skeleton" style={{ height: 56 }} />
                <span className="ds-skeleton" style={{ height: 56 }} />
                <p className="ds-muted">{t('scholarshipsSection.evaluating', 'Süni İntellekt istifadəçi profilini analiz edir...')}</p>
              </div>
            ) : (
              <ul className="sp-checklist">
                {(analysisResult?.highlights || [
                  `${t('matchedUniversities.labels.tuition', 'Təhsil Haqqı')}: ${selectedSch.amount}`,
                  `${t('scholarshipsSection.deadline', 'Son Müraciət Tarixi')}: ${selectedSch.deadline}`,
                  `${t('scholarshipsSection.eligible', 'Kimlər Üçün')}: ${selectedSch.eligible}`
                ]).map((hl, idx) => (
                  <li className="sp-checklist__item" key={idx}>
                    <CheckCircle2 aria-hidden className="sp-checklist__icon" />
                    <div className="sp-checklist__text">
                      <strong>{t('scholarshipsSection.criteria', 'Analiz Meyarı')} #{idx + 1}</strong>
                      <span><AutoTranslate text={hl} /></span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {analysisResult?.emailMessage && (
              <p className="sp-notice sp-notice--info">
                <Mail aria-hidden /> <span><AutoTranslate text={analysisResult.emailMessage} /></span>
              </p>
            )}

            {applicationSubmitted ? (
              <p className="sp-notice sp-notice--success" role="status">
                <CheckCircle2 aria-hidden />
                <span>{t('scholarshipsSection.appSavedMsg', 'Müraciətiniz bazada saxlanıldı və təlimat e-poçtunuza göndərildi!')}</span>
              </p>
            ) : null}

            <div className="sp-modal__actions">
              {!applicationSubmitted ? (
                <button type="button" className="ds-btn ds-btn--primary" onClick={handleScholarshipApply}>
                  {t('scholarshipsSection.applyBtn', 'Rəsmi Səhifədən Müraciət Et')}
                </button>
              ) : null}
              <button type="button" className="ds-btn ds-btn--secondary" onClick={closeModal}>
                {t('common.close', 'Bağla')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 2: Get Notified Modal for Logged-In Users */}
      {activeModal === 'notify' && selectedSch && createPortal(
        <div className="sp-modal" onClick={closeModal}>
          <div
            className="sp-modal__card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sp-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="sp-modal__close" onClick={closeModal} aria-label={t('common.close', 'Bağla')} autoFocus>
              <X aria-hidden />
            </button>

            <div className="sp-modal__header">
              <span className="ds-badge ds-badge--warning">
                <Bell aria-hidden className="sp-badge-icon" />
                {t('scholarshipsSection.notifyBadge', 'Xəbərdarlıq Xidməti')}
              </span>
              <h2 id="sp-modal-title" className="ds-h3 sp-modal__title"><AutoTranslate text={selectedSch.name} /></h2>
              <p className="sp-modal__subtitle">
                {t('scholarshipsSection.notifySub', 'Bu təqaüd proqramının növbəti müraciət mərhələsi açılan kimi dərhal xəbərdar olacaqsınız.')}
              </p>
            </div>

            <ul className="sp-checklist">
              <li className="sp-checklist__item">
                <Bell aria-hidden className="sp-checklist__icon sp-checklist__icon--warning" />
                <div className="sp-checklist__text">
                  <strong>{t('scholarshipsSection.emailNotifyTitle', 'E-Poçt və SMS Bildirişləri')}</strong>
                  <span>{t('scholarshipsSection.emailNotifyDesc', 'Müraciətlər açılan kimi profil e-poçt ünvanınıza avtomatik bildiriş göndəriləcəkdir.')}</span>
                </div>
              </li>
            </ul>

            {notificationSaved ? (
              <p className="sp-notice sp-notice--success" role="status">
                <Bell aria-hidden />
                <span>{t('scholarshipsSection.notifySavedMsg', 'Xəbərdarlıq sorğunuz PostgreSQL bazasında saxlanıldı və e-poçt göndəriş növbəsinə əlavə olundu!')}</span>
              </p>
            ) : null}

            <div className="sp-modal__actions">
              {!notificationSaved ? (
                <button type="button" className="ds-btn ds-btn--primary" onClick={handleActivateNotification} disabled={isSubscribing}>
                  {isSubscribing ? t('profile.saving', 'Yadda Saxlanılır...') : t('scholarshipsSection.activateNotifyBtn', 'Bildirişi Aktivləşdir')}
                </button>
              ) : null}
              <button type="button" className="ds-btn ds-btn--secondary" onClick={closeModal}>
                {t('portal.cancel', 'Bağla')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}

export default ScholarshipsPage;
