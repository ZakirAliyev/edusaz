import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Award,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Globe2,
  Loader2,
  Lock,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Star,
  Users,
  X,
} from 'lucide-react';
import {
  useGetPublishedCourseByIdQuery,
  useInitiateCoursePaymentMutation,
  useCheckCourseEnrollmentQuery,
} from '../../../services/apis/userApi';
import { categoryLabel, levelLabel } from '../../../locales/courseLabels';
import { useToast } from '../../../context/ToastContext';
import { AutoTranslate } from '../../../hooks/useAutoTranslate';
import Cookies from 'js-cookie';
import ScrollToTop from '../../../components/Common/ScrollToTop.jsx';
import './index.scss';

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
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    // An expired session counts as signed out, so purchases always go through a fresh sign-in.
    if (payload.exp && payload.exp * 1000 < Date.now()) return { email: '', name: '', isLoggedIn: false };
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

function formatDuration(minutes, t) {
  const total = Number(minutes) || 0;
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} ${t('courses.min')}`;
  return `${h} ${t('courses.hourShort')}${m ? ` ${m} ${t('courses.min')}` : ''}`;
}

function DetailSkeleton() {
  return (
    <main className="ds-page cdp" aria-busy="true">
      <div className="ds-container">
        <div className="cdp-layout">
          <div className="cdp-head">
            <span className="ds-skeleton cdp-sk" style={{ width: '40%' }} />
            <span className="ds-skeleton cdp-sk cdp-sk--title" />
            <span className="ds-skeleton cdp-sk" style={{ width: '80%' }} />
            <span className="ds-skeleton cdp-sk" style={{ width: '60%' }} />
          </div>
          <aside className="cdp-aside">
            <div className="ds-card cdp-buy">
              <div className="cdp-buy__media ds-skeleton" />
              <div className="cdp-buy__body">
                <span className="ds-skeleton cdp-sk cdp-sk--price" />
                <span className="ds-skeleton cdp-sk cdp-sk--btn" />
              </div>
            </div>
          </aside>
          <div className="cdp-body">
            <div className="ds-skeleton cdp-sk cdp-sk--block" />
          </div>
        </div>
      </div>
    </main>
  );
}

function CourseDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [modalLecture, setModalLecture] = useState(null);
  const [isFreeEnrolled, setIsFreeEnrolled] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [playingLectureId, setPlayingLectureId] = useState(null);
  const playerRef = useRef(null);

  const userInfo = getUserInfo();
  const isLoggedIn = userInfo.isLoggedIn;

  const { data: course, isLoading } = useGetPublishedCourseByIdQuery({ id, lang: i18n.language });
  const [initiateCoursePayment] = useInitiateCoursePaymentMutation();

  // Check enrollment status for logged-in users
  const { data: enrollmentData } = useCheckCourseEnrollmentQuery(
    { courseId: id, userEmail: userInfo.email },
    { skip: !isLoggedIn || !id }
  );
  const isEnrolled = enrollmentData?.isEnrolled === true;
  const hasFullAccess = isFreeEnrolled || isEnrolled || (course?.isFree && isFreeEnrolled);

  // Auto-open free enrolled courses
  useEffect(() => {
    if (course?.isFree && isFreeEnrolled && !activeVideo) {
      const firstVideo = course.sections?.[0]?.lectures?.find(l => l.videoUrl);
      if (firstVideo) {
        setActiveVideo(firstVideo.videoUrl);
        setModalLecture(firstVideo);
      }
      else if (course.previewVideoUrl) setActiveVideo(course.previewVideoUrl);
    }
  }, [isFreeEnrolled, course, activeVideo]);

  // Close the lecture player with Escape.
  useEffect(() => {
    if (!modalLecture) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setModalLecture(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalLecture]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!course) {
    return (
      <main className="ds-page cdp">
        <div className="ds-container">
          <div className="ds-empty cdp-notfound">
            <BookOpen aria-hidden />
            <h1 className="ds-h3">{t('courses.notFound')}</h1>
            <p>{t('courses.notFoundDesc')}</p>
            <Link to="/courses" className="ds-btn ds-btn--primary">
              {t('courses.browseAll')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Enrollment / Payment Handler ─────────────────────────────────────────────
  const goToSignIn = () => {
    toast.info(t('toast.auth.loginRequired'));
    navigate(`/signin?next=${encodeURIComponent(`/courses/${id}`)}`);
  };

  const handleEnrollOrBuy = async () => {
    // Buying or enrolling always requires an account.
    if (!isLoggedIn) {
      goToSignIn();
      return;
    }

    if (isEnrolled) {
      // Already enrolled — scroll to first lecture
      const firstVideo = course.sections?.[0]?.lectures?.find(l => l.videoUrl);
      if (firstVideo) setActiveVideo(firstVideo.videoUrl);
      else if (course.previewVideoUrl) setActiveVideo(course.previewVideoUrl);
      toast.info(t('toast.course.alreadyEnrolled'));
      return;
    }

    if (course.isFree) {
      // Free course enrollment
      setIsFreeEnrolled(true);
      const firstVideo = course.sections?.[0]?.lectures?.find(l => l.videoUrl);
      if (firstVideo) setActiveVideo(firstVideo.videoUrl);
      else if (course.previewVideoUrl) setActiveVideo(course.previewVideoUrl);
      toast.success(t('toast.course.freeAccessGranted'));
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
        toast.info(t('toast.course.redirectingToPayment'));
        setTimeout(() => {
          window.location.href = result.paymentUrl;
        }, 800);
      } else {
        toast.error(t('toast.course.paymentUrlMissing'));
      }
    } catch (err) {
      // The saved session is no longer valid on the server (expired or signed out elsewhere).
      if (err?.status === 401) {
        goToSignIn();
        return;
      }
      toast.apiError(err, 'toast.course.paymentError');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // ── Lecture click handler ─────────────────────────────────────────────────────
  const handleLectureClick = (lec) => {
    if (!isLoggedIn) {
      goToSignIn();
      return;
    }
    if (lec.videoUrl) {
      setActiveVideo(lec.videoUrl);
    }
  };

  // Same behavior as before, plus: remember which lecture plays and bring the
  // player into view when it is off-screen (mobile, where the card is not sticky).
  const playLecture = (lec) => {
    handleLectureClick(lec);
    if (!isLoggedIn || !lec.videoUrl) return;
    setPlayingLectureId(lec.id);
    const el = playerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < 72 || rect.bottom > window.innerHeight) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const currentEmbedUrl = activeVideo
    ? getYouTubeEmbedUrl(activeVideo)
    : (course.previewVideoUrl ? getYouTubeEmbedUrl(course.previewVideoUrl) : null);

  const hasDiscount = course.discountPrice > 0 && course.discountPrice < course.price;
  const price = hasDiscount ? course.discountPrice : course.price;
  const currency = course.currency || 'AZN';

  // Button label
  const ctaLabel = () => {
    if (isPaymentLoading) return t('courses.processing');
    if (isEnrolled) return t('courses.accessNow');
    if (course.isFree) {
      return isFreeEnrolled
        ? t('courses.accessNow')
        : t('courses.enrollFree');
    }
    return `${t('courses.buyNow')} — ${price} ${currency}`;
  };

  const CtaIcon = isPaymentLoading
    ? Loader2
    : isEnrolled || (course.isFree && isFreeEnrolled)
      ? PlayCircle
      : course.isFree
        ? BookOpen
        : CreditCard;

  const learnItems = (course.whatYouLearn || '').split('\n').filter(Boolean);
  const requirementItems = (course.requirements || '').split('\n').filter(Boolean);
  const sections = course.sections || [];
  const showInstructor = !course.isSuperAdminCreated && course.instructorName;

  return (
    <main className="ds-page cdp">
      <ScrollToTop />
      <div className="ds-container">
        <nav className="cdp-crumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link to="/">{t('courses.home')}</Link></li>
            <li>
              <ChevronRight aria-hidden />
              <Link to="/courses">{t('courses.allCourses')}</Link>
            </li>
            {course.category && (
              <li>
                <ChevronRight aria-hidden />
                <span aria-current="page">{categoryLabel(t, course.category) || <AutoTranslate text={course.category} />}</span>
              </li>
            )}
          </ol>
        </nav>

        <div className="cdp-layout">
          {/* ── Header ── */}
          <header className="cdp-head" data-reveal>
            <div className="cdp-head__badges">
              {course.category && (
                <span className="ds-badge ds-badge--brand">{categoryLabel(t, course.category) || <AutoTranslate text={course.category} />}</span>
              )}
              {course.isFree && <span className="ds-badge ds-badge--success">{t('courses.free')}</span>}
            </div>

            <h1 className="ds-title cdp-title"><AutoTranslate text={course.title} /></h1>

            {(course.shortDescription || course.description) && (
              <p className="ds-lead cdp-head__lead">
                <AutoTranslate text={course.shortDescription || course.description} />
              </p>
            )}

            <ul className="cdp-meta">
              {course.rating > 0 && (
                <li className="cdp-meta__rating">
                  <Star aria-hidden />
                  <strong>{course.rating.toFixed(1)}</strong>
                  <span>{t('courses.rating')}</span>
                </li>
              )}
              {course.totalStudents > 0 && (
                <li>
                  <Users aria-hidden />
                  {t('courses.studentsCount', { count: course.totalStudents || 0 })}
                </li>
              )}
              {course.level && (
                <li>
                  <BarChart3 aria-hidden />
                  {levelLabel(t, course.level) || <AutoTranslate text={course.level} />}
                </li>
              )}
              {course.language && (
                <li>
                  <Globe2 aria-hidden />
                  {t('courses.language')}: {course.language.toUpperCase()}
                </li>
              )}
              <li>
                <PlayCircle aria-hidden />
                {t('courses.lecturesCount', { count: course.totalLectures || 0 })}
              </li>
              {course.totalDurationMinutes > 0 && (
                <li>
                  <Clock aria-hidden />
                  {formatDuration(course.totalDurationMinutes, t)}
                </li>
              )}
            </ul>

            {showInstructor && (
              <div className="cdp-instructor">
                <span className="cdp-instructor__avatar" aria-hidden>
                  {course.instructorAvatar ? (
                    <img src={course.instructorAvatar} alt="" />
                  ) : (
                    course.instructorName?.[0]
                  )}
                </span>
                <div className="cdp-instructor__text">
                  <div className="cdp-instructor__name">
                    {t('courses.instructorBy')} <strong>{course.instructorName}</strong>
                  </div>
                  {course.instructorBio && (
                    <div className="cdp-instructor__bio">
                      <AutoTranslate text={course.instructorBio} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </header>

          {/* ── Purchase card (sticky on desktop, right after the header on mobile) ── */}
          <aside className="cdp-aside">
            <div className="ds-card cdp-buy">
              <div className="cdp-buy__media" ref={playerRef}>
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
                  <div className="cdp-buy__placeholder"><BookOpen aria-hidden /></div>
                )}
              </div>

              <div className="cdp-buy__body">
                <div className="cdp-price">
                  {course.isFree ? (
                    <span className="cdp-price__now cdp-price__now--free">{t('courses.freeCourse')}</span>
                  ) : isEnrolled ? (
                    <span className="cdp-price__enrolled">
                      <CheckCircle2 aria-hidden /> Qeydiyyatdan Keçmisiniz
                    </span>
                  ) : (
                    <>
                      <div className="cdp-price__row">
                        <span className="cdp-price__now">{price} {currency}</span>
                        {hasDiscount && (
                          <>
                            <s className="cdp-price__was">{course.price} {currency}</s>
                            <span className="ds-badge ds-badge--brand">
                              −{Math.round((1 - course.discountPrice / course.price) * 100)}%
                            </span>
                          </>
                        )}
                      </div>
                      {course.currency && course.currency.toUpperCase() !== 'AZN' && (
                        <div className="cdp-price__azn">
                          {t('courses.payViaEpoint', { amount: convertToAznDisplay(price, course.currency) })}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <button
                  type="button"
                  className="ds-btn ds-btn--primary ds-btn--lg ds-btn--block cdp-cta"
                  onClick={handleEnrollOrBuy}
                  disabled={isPaymentLoading}
                  aria-busy={isPaymentLoading}
                >
                  <CtaIcon aria-hidden className={isPaymentLoading ? 'cdp-spin' : undefined} />
                  <span>{ctaLabel()}</span>
                </button>

                {!course.isFree && !isEnrolled && (
                  <ul className="cdp-trust">
                    <li><ShieldCheck aria-hidden /> {t('courses.securePayment')}</li>
                    <li><CreditCard aria-hidden /> ePoint</li>
                    <li><RotateCcw aria-hidden /> {t('courses.refundable')}</li>
                  </ul>
                )}

                <div className="cdp-includes">
                  <h2 className="cdp-includes__title">{t('courses.includes')}</h2>
                  <ul>
                    <li><PlayCircle aria-hidden /> {t('courses.videoLecturesCount', { count: course.totalLectures || 0 })}</li>
                    <li><Clock aria-hidden /> {t('courses.minutesTotal', { count: course.totalDurationMinutes || 0 })}</li>
                    <li><Smartphone aria-hidden /> {t('courses.accessDevices')}</li>
                    <li><Award aria-hidden /> {t('courses.certificate')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Body ── */}
          <div className="cdp-body">
            {learnItems.length > 0 && (
              <section className="ds-card cdp-box" data-reveal>
                <h2 className="ds-h3 cdp-box__title">{t('courses.whatYouLearn')}</h2>
                <ul className="cdp-learn">
                  {learnItems.map((item, idx) => (
                    <li key={idx}>
                      <Check aria-hidden />
                      <span><AutoTranslate text={item} /></span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {sections.length > 0 && (
              <section className="cdp-curriculum" data-reveal>
                <div className="cdp-curriculum__head">
                  <h2 className="ds-h3">{t('courses.content')}</h2>
                  <span className="ds-muted">
                    {t('courses.lecturesCount', { count: course.totalLectures || 0 })}
                    {course.totalDurationMinutes > 0 && ` · ${formatDuration(course.totalDurationMinutes, t)}`}
                  </span>
                </div>

                <div className="cdp-accordion">
                  {sections.map((section, sIdx) => {
                    const isOpen = activeSection === sIdx || activeSection === null;
                    const panelId = `cdp-section-${sIdx}`;
                    const sectionMinutes = (section.lectures || []).reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

                    return (
                      <div key={section.id || sIdx} className="cdp-section">
                        <button
                          type="button"
                          className="cdp-section__header"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => setActiveSection(activeSection === sIdx ? -1 : sIdx)}
                        >
                          <ChevronDown aria-hidden className="cdp-section__chevron" />
                          <span className="cdp-section__title">
                            {t('courses.section')} {sIdx + 1}: <AutoTranslate text={section.title} />
                          </span>
                          <span className="cdp-section__meta">
                            {t('courses.lecturesCount', { count: section.lectures?.length || 0 })}
                            {sectionMinutes > 0 && ` · ${formatDuration(sectionMinutes, t)}`}
                          </span>
                        </button>

                        {isOpen && (
                          <ul className="cdp-section__body" id={panelId}>
                            {(section.lectures || []).map((lec) => {
                              const canWatch = lec.isFree || hasFullAccess || course.isFree;
                              const isPaidLocked = !course.isFree && !hasFullAccess && !lec.isFree;
                              const isPreview = lec.isFree && !course.isFree && !hasFullAccess;
                              const isPlaying = playingLectureId === lec.id && activeVideo === lec.videoUrl;
                              const state = isPlaying ? 'playing' : isPaidLocked ? 'locked' : 'open';

                              return (
                                <li
                                  key={lec.id}
                                  className="cdp-lecture"
                                  data-state={state}
                                  onClick={() => {
                                    if (canWatch && lec.videoUrl) {
                                      playLecture(lec);
                                    } else if (isPaidLocked) {
                                      handleEnrollOrBuy();
                                    }
                                  }}
                                  title={canWatch ? t('courses.clickToWatch') : t('courses.buyToWatchHint')}
                                >
                                  <span className="cdp-lecture__icon" aria-hidden>
                                    {isPaidLocked ? <Lock /> : <PlayCircle />}
                                  </span>

                                  <span className="cdp-lecture__main">
                                    <span className="cdp-lecture__title">
                                      <AutoTranslate text={lec.title} />
                                    </span>
                                    <span className="cdp-lecture__sub">
                                      {isPreview && (
                                        <span className="ds-badge ds-badge--success">
                                          {t('courses.freePreview')}
                                        </span>
                                      )}
                                      {lec.durationMinutes > 0 && (
                                        <span className="cdp-lecture__duration">
                                          <Clock aria-hidden /> {lec.durationMinutes} {t('courses.min')}
                                        </span>
                                      )}
                                    </span>
                                  </span>

                                  {canWatch && lec.videoUrl && (
                                    <button
                                      type="button"
                                      className="ds-btn ds-btn--soft ds-btn--sm cdp-lecture__btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playLecture(lec);
                                      }}
                                    >
                                      <PlayCircle aria-hidden />
                                      {t('courses.watchVideo')}
                                    </button>
                                  )}

                                  {isPaidLocked && (
                                    <button
                                      type="button"
                                      className="ds-btn ds-btn--secondary ds-btn--sm cdp-lecture__btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEnrollOrBuy();
                                      }}
                                      disabled={isPaymentLoading}
                                    >
                                      <CreditCard aria-hidden />
                                      {t('courses.buyToWatch')}
                                    </button>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {requirementItems.length > 0 && (
              <section className="cdp-block" data-reveal>
                <h2 className="ds-h3 cdp-box__title">{t('courses.requirements')}</h2>
                <ul className="cdp-reqs">
                  {requirementItems.map((req, idx) => (
                    <li key={idx}><AutoTranslate text={req} /></li>
                  ))}
                </ul>
              </section>
            )}

            {course.description && (
              <section className="cdp-block" data-reveal>
                <h2 className="ds-h3 cdp-box__title">{t('courses.description')}</h2>
                <div className="cdp-description">
                  <AutoTranslate text={course.description} />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* ── Lecture player modal ── */}
      {modalLecture && modalLecture.videoUrl && (
        <div className="cdp-modal-overlay" onClick={() => setModalLecture(null)}>
          <div
            className="cdp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cdp-modal-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="cdp-modal__header">
              <div className="cdp-modal__titles">
                <span className="cdp-modal__badge"><PlayCircle aria-hidden /> {t('courses.nowPlaying')}</span>
                <h2 className="cdp-modal__title" id="cdp-modal-title"><AutoTranslate text={modalLecture.title} /></h2>
              </div>
              <button
                type="button"
                className="cdp-modal__close"
                onClick={() => setModalLecture(null)}
                title="Bağla"
                aria-label="Bağla"
              >
                <X aria-hidden />
              </button>
            </div>

            <div className="cdp-modal__player">
              <iframe
                src={getYouTubeEmbedUrl(modalLecture.videoUrl)}
                title={modalLecture.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {modalLecture.description && (
              <div className="cdp-modal__desc">
                <h3>{t('courses.aboutLesson')}</h3>
                <p><AutoTranslate text={modalLecture.description} /></p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default CourseDetailPage;
