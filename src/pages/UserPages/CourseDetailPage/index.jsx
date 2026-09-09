import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useGetPublishedCourseByIdQuery,
  useInitiateCoursePaymentMutation,
  useCheckCourseEnrollmentQuery,
} from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import { AutoTranslate } from '../../../hooks/useAutoTranslate';
import Cookies from 'js-cookie';
import ScrollToTop from '../../../components/Common/ScrollToTop.jsx';
import './index.scss';

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regExp);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
}

// Get user info from token / localStorage
function getUserInfo() {
  const token = Cookies.get('userToken');
  if (!token) return { email: '', name: '', isLoggedIn: false };
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const email = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '';
    const name = localStorage.getItem('userName') || email.split('@')[0];
    return { email, name, isLoggedIn: true };
  } catch {
    return { email: '', name: '', isLoggedIn: false };
  }
}

// Convert foreign currency to AZN for ePoint display
const convertToAznDisplay = (val, curr) => {
  const num = parseFloat(val) || 0;
  switch ((curr || 'AZN').toUpperCase()) {
    case 'USD': return (num * 1.70).toFixed(2);
    case 'EUR': return (num * 1.85).toFixed(2);
    case 'GBP': return (num * 2.18).toFixed(2);
    case 'TRY': return (num * 0.05).toFixed(2);
    case 'RUB': return (num * 0.018).toFixed(2);
    default: return num.toFixed(2);
  }
};

function CourseDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [isFreeEnrolled, setIsFreeEnrolled] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const userInfo = getUserInfo();
  const isLoggedIn = userInfo.isLoggedIn;

  const { data: course, isLoading } = useGetPublishedCourseByIdQuery({ id, lang: i18n.language });
  const [initiateCoursePayment] = useInitiateCoursePaymentMutation();

  // Check enrollment status for logged-in users
  const { data: enrollmentData, refetch: refetchEnrollment } = useCheckCourseEnrollmentQuery(
    { courseId: id, userEmail: userInfo.email },
    { skip: !isLoggedIn || !id }
  );
  const isEnrolled = enrollmentData?.isEnrolled === true;
  const hasFullAccess = isFreeEnrolled || isEnrolled || (course?.isFree && isFreeEnrolled);

  // Auto-open free enrolled courses
  useEffect(() => {
    if (course?.isFree && isFreeEnrolled && !activeVideo) {
      const firstVideo = course.sections?.[0]?.lectures?.find(l => l.videoUrl);
      if (firstVideo) setActiveVideo(firstVideo.videoUrl);
      else if (course.previewVideoUrl) setActiveVideo(course.previewVideoUrl);
    }
  }, [isFreeEnrolled, course, activeVideo]);

  if (isLoading) {
    return (
      <div className="cdp-loading">
        <div className="cdp-spinner" />
        <p>{t('common.loading', 'Kurs məlumatları yüklənir...')}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="cdp-empty">
        <h2>{t('courses.notFound', 'Kurs tapılmadı')}</h2>
        <p>{t('courses.notFoundDesc', 'Bu kurs mövcud deyil və ya silinib.')}</p>
        <Link to="/courses" className="cdp-btn">← {t('common.back', 'Kurslara qayıt')}</Link>
      </div>
    );
  }

  // ── Main CTA Handler ─────────────────────────────────────────────────────────

  const handleEnrollOrBuy = async () => {
    if (!isLoggedIn) {
      toast.showError(t('auth.loginRequired', 'Daxil olmaq tələb olunur'));
      navigate('/signin');
      return;
    }

    if (isEnrolled) {
      // Already enrolled — scroll to first lecture
      const firstVideo = course.sections?.[0]?.lectures?.find(l => l.videoUrl);
      if (firstVideo) setActiveVideo(firstVideo.videoUrl);
      else if (course.previewVideoUrl) setActiveVideo(course.previewVideoUrl);
      toast.showSuccess('Kursa artıq qeydiyyatdan keçmisiniz 🎉');
      return;
    }

    if (course.isFree) {
      // Free course enrollment
      setIsFreeEnrolled(true);
      const firstVideo = course.sections?.[0]?.lectures?.find(l => l.videoUrl);
      if (firstVideo) setActiveVideo(firstVideo.videoUrl);
      else if (course.previewVideoUrl) setActiveVideo(course.previewVideoUrl);
      toast.showSuccess(t('courses.freeAccessGranted', 'Ödənişsiz kurs dərsləri aktivləşdirildi! 🎉'));
      return;
    }

    // Paid course — initiate ePoint payment
    setIsPaymentLoading(true);
    try {
      const result = await initiateCoursePayment({
        courseId: id,
        userEmail: userInfo.email,
        studentName: userInfo.name,
      }).unwrap();

      if (result?.paymentUrl) {
        toast.showSuccess('ePoint ödəniş panelinə yönləndirilirsiniz...');
        setTimeout(() => {
          window.location.href = result.paymentUrl;
        }, 800);
      } else {
        toast.showError('Ödəniş URL-i alınmadı. Yenidən cəhd edin.');
      }
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Ödəniş başlanğıcında xəta';
      toast.showError(msg);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // ── Lecture click handler ─────────────────────────────────────────────────────
  const handleLectureClick = (lec) => {
    if (!isLoggedIn) {
      toast.showError(t('auth.loginRequired', 'Daxil olmaq tələb olunur'));
      navigate('/signin');
      return;
    }
    if (lec.videoUrl) {
      setActiveVideo(lec.videoUrl);
    }
  };

  const currentEmbedUrl = activeVideo
    ? getYouTubeEmbedUrl(activeVideo)
    : (course.previewVideoUrl ? getYouTubeEmbedUrl(course.previewVideoUrl) : null);

  const price = course.discountPrice > 0 && course.discountPrice < course.price
    ? course.discountPrice
    : course.price;

  // Button label
  const ctaLabel = () => {
    if (isPaymentLoading) return '⏳ Emal edilir...';
    if (isEnrolled) return '▶ Dərslərə Bax';
    if (course.isFree) {
      return isFreeEnrolled
        ? t('courses.accessNow', '▶ Dərslərə Bax')
        : t('courses.enrollFree', '🎓 İndi Qoşul (Ödənişsiz)');
    }
    return `💳 ${t('courses.buyNow', 'Kursu Al')} — ${price} ${course.currency || 'AZN'}`;
  };

  return (
    <div className="course-detail-page">
      <ScrollToTop />

      {/* Hero Header */}
      <section className="cdp-hero">
        <div className="container">
          <div className="cdp-hero__content">
            <div className="cdp-breadcrumbs">
              <Link to="/">{t('nav.home', 'Ana Səhifə')}</Link> /{' '}
              <Link to="/courses">{t('nav.courses', 'Kurslar')}</Link>
              {course.category && (
                <> / <span><AutoTranslate text={course.category} /></span></>
              )}
            </div>
            <h1 className="cdp-title"><AutoTranslate text={course.title} /></h1>
            <p className="cdp-desc">
              <AutoTranslate text={course.shortDescription || course.description} />
            </p>

            <div className="cdp-meta">
              {course.level && (
                <span className="cdp-badge"><AutoTranslate text={course.level} /></span>
              )}
              {course.rating > 0 && <span>⭐ {course.rating.toFixed(1)} {t('common.reviews', 'reytinq')}</span>}
              {course.totalStudents > 0 && <span>👥 {course.totalStudents} {t('courses.students', 'tələbə')}</span>}
              {course.language && <span>🌐 {t('matchedUniversities.labels.language', 'Dil')}: {course.language.toUpperCase()}</span>}
            </div>

            {/* Owner Section */}
            {!course.isSuperAdminCreated && course.instructorName && (
              <div className="cdp-instructor">
                <div className="cdp-instructor__avatar">
                  {course.instructorAvatar ? (
                    <img src={course.instructorAvatar} alt={course.instructorName} />
                  ) : (
                    <span>{course.instructorName?.[0] || '👨‍🏫'}</span>
                  )}
                </div>
                <div>
                  <div className="cdp-instructor__name">
                    {t('courses.instructorBy', 'Müəllif:')} <strong><AutoTranslate text={course.instructorName} /></strong>
                  </div>
                  {course.instructorBio && (
                    <div className="cdp-instructor__exp">
                      <AutoTranslate text={course.instructorBio} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar / Video Card */}
          <div className="cdp-hero__card">
            <div className="cdp-video-preview">
              {currentEmbedUrl ? (
                <iframe
                  src={currentEmbedUrl}
                  title="Course Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} />
              ) : (
                <div className="cdp-thumb-placeholder">📚</div>
              )}
            </div>

            <div className="cdp-card__body">
              <div className="cdp-card__price">
                {course.isFree ? (
                  <span className="free">{t('courses.freeCourse', 'Ödənişsiz Kurs')}</span>
                ) : isEnrolled ? (
                  <span className="free">✅ Qeydiyyatdan Keçmisiniz</span>
                ) : (
                  <>
                    <span className="price">{price} {course.currency || 'AZN'}</span>
                    {course.discountPrice > 0 && course.discountPrice < course.price && (
                      <span className="original">{course.price} {course.currency || 'AZN'}</span>
                    )}
                    {course.currency && course.currency.toUpperCase() !== 'AZN' && (
                      <div className="cdp-card__azn-rate" style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: 500 }}>
                        💳 ePoint ilə ödəniş: ~{convertToAznDisplay(price, course.currency)} AZN
                      </div>
                    )}
                  </>
                )}
              </div>

              <button
                className={`cdp-btn cdp-btn--primary ${isPaymentLoading ? 'loading' : ''}`}
                onClick={handleEnrollOrBuy}
                disabled={isPaymentLoading}
              >
                {ctaLabel()}
              </button>

              {!course.isFree && !isEnrolled && (
                <div className="cdp-payment-badges">
                  <span>🔒 Güvənli ödəniş</span>
                  <span>💳 ePoint</span>
                  <span>↩️ Geri qaytarıla bilər</span>
                </div>
              )}

              <div className="cdp-card__includes">
                <h4>{t('courses.includes', 'Bu kursa daxildir:')}</h4>
                <ul>
                  <li>📹 {course.totalLectures || 0} {t('courses.videoLectures', 'video dərs')}</li>
                  <li>⏱️ {course.totalDurationMinutes || 0} {t('courses.minutesDuration', 'dəqiqə ümumi müddət')}</li>
                  <li>📱 {t('courses.accessDevices', 'Mobil və kompüterdən giriş')}</li>
                  <li>📜 {t('courses.certificate', 'Bitirmə sertifikatı')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="cdp-body">
        <div className="container">
          <div className="cdp-main-content">
            {/* What you'll learn */}
            {course.whatYouLearn && (
              <div className="cdp-box">
                <h2>{t('courses.whatYouLearn', 'Nələr Öyrənəcəksiniz')}</h2>
                <div className="cdp-learn-grid">
                  {course.whatYouLearn.split('\n').filter(Boolean).map((item, idx) => (
                    <div key={idx} className="cdp-learn-item">
                      <span>✓</span>
                      <span><AutoTranslate text={item} /></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Content / Curriculum */}
            {course.sections && course.sections.length > 0 && (
              <div className="cdp-box">
                <h2>{t('courses.content', 'Kursun Məzmunu')}</h2>
                <div className="cdp-curriculum">
                  {course.sections.map((section, sIdx) => (
                    <div key={section.id || sIdx} className="cdp-section">
                      <button
                        type="button"
                        className="cdp-section__header"
                        onClick={() => setActiveSection(activeSection === sIdx ? -1 : sIdx)}
                      >
                        <span className="cdp-section__title">
                          <span style={{ marginRight: '10px', fontSize: '11px', color: '#7A5CFF', display: 'inline-block' }}>
                            {activeSection === sIdx || activeSection === null ? '▼' : '▶'}
                          </span>
                          {t('courses.section', 'Bölmə')} {sIdx + 1}: <AutoTranslate text={section.title} />
                        </span>
                        <span className="cdp-section__meta">
                          {section.lectures?.length || 0} {t('courses.lectures', 'dərs')}
                        </span>
                      </button>

                      {(activeSection === sIdx || activeSection === null) && (
                        <div className="cdp-section__body">
                          {(section.lectures || []).map((lec) => {
                            const canWatch = lec.isFree || hasFullAccess || course.isFree;
                            const isPaidLocked = !course.isFree && !hasFullAccess && !lec.isFree;

                            return (
                              <div key={lec.id} className={`cdp-lecture ${isPaidLocked ? 'locked' : ''}`}>
                                <span className="cdp-lecture__icon">
                                  {isPaidLocked ? '🔒' : '▶'}
                                </span>
                                <span className="cdp-lecture__title">
                                  <AutoTranslate text={lec.title} />
                                </span>

                                {/* Lecture action */}
                                {lec.isFree && !canWatch && (
                                  <span className="cdp-lecture__free">
                                    {t('courses.freePreview', 'Ödənişsiz Baxış')}
                                  </span>
                                )}

                                {canWatch && lec.videoUrl && (
                                  <button
                                    className="cdp-lecture__btn"
                                    onClick={() => handleLectureClick(lec)}
                                  >
                                    {t('courses.watchVideo', 'Videoya Bax')}
                                  </button>
                                )}

                                {isPaidLocked && (
                                  <button
                                    className="cdp-lecture__btn cdp-lecture__btn--buy"
                                    onClick={handleEnrollOrBuy}
                                    disabled={isPaymentLoading}
                                  >
                                    💳 {t('courses.buyToWatch', 'Al və İzlə')}
                                  </button>
                                )}

                                {lec.durationMinutes > 0 && (
                                  <span className="cdp-lecture__duration">
                                    {lec.durationMinutes} {t('courses.min', 'dəq')}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {course.description && (
              <div className="cdp-box">
                <h2>{t('courses.description', 'Açıqlama')}</h2>
                <div className="cdp-description-content">
                  <AutoTranslate text={course.description} />
                </div>
              </div>
            )}

            {/* Requirements */}
            {course.requirements && (
              <div className="cdp-box">
                <h2>{t('courses.requirements', 'Tələblər')}</h2>
                <div className="cdp-req-list">
                  {course.requirements.split('\n').filter(Boolean).map((req, idx) => (
                    <div key={idx} className="cdp-req-item">
                      <span>•</span>
                      <span><AutoTranslate text={req} /></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default CourseDetailPage;
