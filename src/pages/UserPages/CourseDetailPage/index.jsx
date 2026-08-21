import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetPublishedCourseByIdQuery, useCreateStudentApplicationMutation } from '../../../services/apis/userApi';
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

function CourseDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [isFreeEnrolled, setIsFreeEnrolled] = useState(false);

  // Application Modal state for Paid courses
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyFormData, setApplyFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    originCountry: 'Azərbaycan',
    notes: ''
  });

  const { data: course, isLoading } = useGetPublishedCourseByIdQuery({ id, lang: i18n.language });
  const [createApplication] = useCreateStudentApplicationMutation();

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

  const handleEnrollOrApply = () => {
    const token = Cookies.get('userToken');
    if (!token) {
      toast.showError(t('auth.loginRequired', 'Daxil olmaq tələb olunur'));
      navigate('/signin');
      return;
    }

    if (course.isFree) {
      // Free course: automatically grant full access
      setIsFreeEnrolled(true);
      if (course.previewVideoUrl) {
        setActiveVideo(course.previewVideoUrl);
      } else if (course.sections?.[0]?.lectures?.[0]?.videoUrl) {
        setActiveVideo(course.sections[0].lectures[0].videoUrl);
      }
      toast.showSuccess(t('courses.freeAccessGranted', 'Ödənişsiz kurs dərsləri aktivləşdirildi! 🎉'));
    } else {
      // Paid course: open Application / Enrollment modal
      const userName = localStorage.getItem('userName') || '';
      const userEmail = localStorage.getItem('userEmail') || '';
      setApplyFormData({
        studentName: userName,
        email: userEmail,
        phone: '',
        originCountry: 'Azərbaycan',
        notes: ''
      });
      setApplySubmitted(false);
      setIsApplyModalOpen(true);
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      await createApplication({
        courseId: id,
        studentName: applyFormData.studentName || 'Tələbə',
        programName: course.title,
        email: applyFormData.email || '',
        phone: applyFormData.phone || '',
        originCountry: applyFormData.originCountry || 'Azərbaycan',
        countryFlag: '🌐',
        matchScore: 100
      }).unwrap();
      setApplySubmitted(true);
    } catch {
      setApplySubmitted(true);
    } finally {
      setIsApplying(false);
    }
  };

  const currentEmbedUrl = activeVideo ? getYouTubeEmbedUrl(activeVideo) : (course.previewVideoUrl ? getYouTubeEmbedUrl(course.previewVideoUrl) : null);

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

            {/* Owner Section — only shown if created by Teacher/Course Center, NOT SuperAdmin */}
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
                ) : (
                  <>
                    <span className="price">${course.discountPrice || course.price}</span>
                    {course.discountPrice > 0 && course.discountPrice < course.price && (
                      <span className="original">${course.price}</span>
                    )}
                  </>
                )}
              </div>

              <button className="cdp-btn cdp-btn--primary" onClick={handleEnrollOrApply}>
                {course.isFree
                  ? (isFreeEnrolled ? t('courses.accessNow', 'Dərslərə Bax') : t('courses.enrollFree', 'İndi Qoşul (Ödənişsiz)'))
                  : t('courses.buyNow', 'Kursu Al / Müraciət Et')}
              </button>

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
                          {(section.lectures || []).map((lec) => (
                            <div key={lec.id} className="cdp-lecture">
                              <span className="cdp-lecture__icon">▶</span>
                              <span className="cdp-lecture__title">
                                <AutoTranslate text={lec.title} />
                              </span>
                              {lec.videoUrl && (lec.isFree || isFreeEnrolled || course.isFree) ? (
                                <button
                                  className="cdp-lecture__btn"
                                  onClick={() => setActiveVideo(lec.videoUrl)}
                                >
                                  {t('courses.watchVideo', 'Videoya Bax')}
                                </button>
                              ) : lec.isFree ? (
                                <span className="cdp-lecture__free">{t('courses.freePreview', 'Ödənişsiz Baxış')}</span>
                              ) : null}
                              {lec.durationMinutes > 0 && (
                                <span className="cdp-lecture__duration">
                                  {lec.durationMinutes} {t('courses.min', 'dəq')}
                                </span>
                              )}
                            </div>
                          ))}
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

      {/* ── COURSE APPLICATION MODAL POPUP FOR PAID COURSES ── */}
      {isApplyModalOpen && (
        <div className="cdp-modal-backdrop" onClick={() => setIsApplyModalOpen(false)}>
          <div className="cdp-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="cdp-modal-close" onClick={() => setIsApplyModalOpen(false)}>
              <CloseIcon />
            </button>

            {applySubmitted ? (
              <div className="cdp-modal-success">
                <div className="success-icon">✓</div>
                <h3>{t('apply.successTitle', 'Müraciətiniz Qəbul Olundu!')}</h3>
                <p>
                  {t('apply.successDesc', 'Müraciətiniz qeydə alındı və təlimat elektron ünvanınıza göndərildi.')}
                </p>
                <div className="cdp-success-chip">
                  📚 <AutoTranslate text={course.title} />
                </div>
                <button
                  className="cdp-modal-btn-done"
                  onClick={() => setIsApplyModalOpen(false)}
                >
                  {t('common.close', 'Bağla')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="cdp-modal-form">
                <div className="cdp-modal-header">
                  <span className="cdp-modal-badge">🎓 {t('courses.buyNow', 'Kurs Müraciəti')}</span>
                  <h2><AutoTranslate text={course.title} /></h2>
                  <p className="cdp-modal-price">
                    <strong>{t('matchedUniversities.labels.tuition', 'Qiymət')}:</strong> ${course.discountPrice || course.price}
                  </p>
                </div>

                <div className="cdp-modal-fields">
                  <div className="cdp-form-row">
                    <label>{t('portal.studentName', 'Ad və Soyad')} *</label>
                    <input
                      type="text"
                      required
                      placeholder={t('portal.studentName', 'Ad və Soyad')}
                      value={applyFormData.studentName}
                      onChange={(e) => setApplyFormData({ ...applyFormData, studentName: e.target.value })}
                    />
                  </div>

                  <div className="cdp-form-row">
                    <label>{t('auth.email', 'E-poçt Ünvanı')} *</label>
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={applyFormData.email}
                      onChange={(e) => setApplyFormData({ ...applyFormData, email: e.target.value })}
                    />
                  </div>

                  <div className="cdp-form-row">
                    <label>{t('partnerModal.phone', 'Əlaqə Nömrəsi')}</label>
                    <input
                      type="tel"
                      placeholder="+994 50 123 45 67"
                      value={applyFormData.phone}
                      onChange={(e) => setApplyFormData({ ...applyFormData, phone: e.target.value })}
                    />
                  </div>

                  <div className="cdp-form-row">
                    <label>{t('portal.originCountry', 'Ölkə')}</label>
                    <input
                      type="text"
                      placeholder="Azərbaycan"
                      value={applyFormData.originCountry}
                      onChange={(e) => setApplyFormData({ ...applyFormData, originCountry: e.target.value })}
                    />
                  </div>

                  <div className="cdp-form-row">
                    <label>{t('partnerModal.message', 'Əlavə Qeyd')}</label>
                    <textarea
                      rows="3"
                      placeholder="Kurs və tələbəlik haqqında əlavə qeydləriniz..."
                      value={applyFormData.notes}
                      onChange={(e) => setApplyFormData({ ...applyFormData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="cdp-modal-actions">
                  <button
                    type="submit"
                    className="cdp-modal-btn-submit"
                    disabled={isApplying}
                  >
                    {isApplying ? t('profile.saving', 'Göndərilir...') : t('common.apply', 'Müraciəti Təsdiqlə')}
                  </button>
                  <button
                    type="button"
                    className="cdp-modal-btn-cancel"
                    onClick={() => setIsApplyModalOpen(false)}
                  >
                    {t('common.cancel', 'Ləğv et')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetailPage;
