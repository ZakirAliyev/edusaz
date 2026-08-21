import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetPublishedCourseByIdQuery } from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import { AutoTranslate } from '../../../hooks/useAutoTranslate';
import Cookies from 'js-cookie';
import ScrollToTop from '../../../components/Common/ScrollToTop.jsx';
import './index.scss';

function CourseDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const { data: course, isLoading } = useGetPublishedCourseByIdQuery({ id, lang: i18n.language });

  if (isLoading) {
    return (
      <div className="cdp-loading">
        <div className="cdp-spinner" />
        <p>{t('common.loading') || 'Kurs məlumatları yüklənir...'}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="cdp-empty">
        <h2>{t('courses.notFound') || 'Kurs tapılmadı'}</h2>
        <p>{t('courses.notFoundDesc') || 'Bu kurs mövcud deyil və ya silinib.'}</p>
        <Link to="/courses" className="cdp-btn">← {t('common.back') || 'Kurslara qayıt'}</Link>
      </div>
    );
  }

  const handleEnroll = () => {
    const token = Cookies.get('userToken');
    if (!token) {
      toast.showError(t('auth.loginRequired') || 'Daxil olmaq tələb olunur');
      navigate('/signin');
      return;
    }
    toast.showSuccess(`"${course.title}" kursuna müraciətiniz qəbul olundu! 🎉`);
  };

  return (
    <div className="course-detail-page">
      <ScrollToTop />

      {/* Hero Header */}
      <section className="cdp-hero">
        <div className="container">
          <div className="cdp-hero__content">
            <div className="cdp-breadcrumbs">
              <Link to="/">{t('nav.home') || 'Ana Səhifə'}</Link> /{' '}
              <Link to="/courses">{t('nav.courses') || 'Kurslar'}</Link>
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
              {course.rating > 0 && <span>⭐ {course.rating.toFixed(1)} {t('common.reviews') || 'reytinq'}</span>}
              {course.totalStudents > 0 && <span>👥 {course.totalStudents} {t('courses.students') || 'tələbə'}</span>}
              {course.language && <span>🌐 {t('matchedUniversities.labels.language') || 'Dil'}: {course.language.toUpperCase()}</span>}
            </div>

            <div className="cdp-instructor">
              <div className="cdp-instructor__avatar">
                {course.instructorAvatar ? (
                  <img src={course.instructorAvatar} alt="" />
                ) : (
                  <span>{course.instructorName?.[0] || '👨‍🏫'}</span>
                )}
              </div>
              <div>
                <div className="cdp-instructor__name">
                  {t('courses.instructorBy') || 'Müəllif:'} <strong>{course.instructorName || 'Müəllim'}</strong>
                </div>
                {course.instructorExpertise && (
                  <div className="cdp-instructor__exp">
                    <AutoTranslate text={course.instructorExpertise} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar / Video Card */}
          <div className="cdp-hero__card">
            <div className="cdp-video-preview">
              {activeVideo ? (
                <iframe
                  src={activeVideo.includes('embed') ? activeVideo : activeVideo.replace('watch?v=', 'embed/')}
                  title="Course Video"
                  allowFullScreen
                />
              ) : course.previewVideoUrl ? (
                <iframe
                  src={course.previewVideoUrl.includes('embed') ? course.previewVideoUrl : course.previewVideoUrl.replace('watch?v=', 'embed/')}
                  title="Course Preview"
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
                  <span className="free">{t('courses.free') || 'Ödənişsiz Kurs'}</span>
                ) : (
                  <>
                    <span className="price">${course.discountPrice || course.price}</span>
                    {course.discountPrice > 0 && course.discountPrice < course.price && (
                      <span className="original">${course.price}</span>
                    )}
                  </>
                )}
              </div>

              <button className="cdp-btn cdp-btn--primary" onClick={handleEnroll}>
                {course.isFree
                  ? (t('courses.enrollFree') || 'İndi Qoşul (Ödənişsiz)')
                  : (t('courses.buyNow') || 'Kursu Al')}
              </button>

              <div className="cdp-card__includes">
                <h4>{t('courses.includes') || 'Bu kursa daxildir:'}</h4>
                <ul>
                  <li>📹 {course.totalLectures || 0} {t('courses.videoLectures') || 'video dərs'}</li>
                  <li>⏱️ {course.totalDurationMinutes || 0} {t('courses.minutesDuration') || 'dəqiqə ümumi müddət'}</li>
                  <li>📱 {t('courses.accessDevices') || 'Mobil və kompüterdən giriş'}</li>
                  <li>📜 {t('courses.certificate') || 'Bitirmə sertifikatı'}</li>
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
                <h2>{t('courses.whatYouLearn') || 'Nələr Öyrənəcəksiniz'}</h2>
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
            <div className="cdp-box">
              <h2>{t('courses.content') || 'Kursun Məzmunu'}</h2>
              <div className="cdp-curriculum">
                {(course.sections || []).map((section, sIdx) => (
                  <div key={section.id} className="cdp-section">
                    <div
                      className="cdp-section__header"
                      onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                    >
                      <span className="cdp-section__title">
                        {t('courses.section') || 'Bölmə'} {sIdx + 1}: <AutoTranslate text={section.title} />
                      </span>
                      <span className="cdp-section__count">
                        {(section.lectures || []).length} {t('courses.lectures') || 'dərs'}
                      </span>
                    </div>

                    <div className="cdp-section__lectures">
                      {(section.lectures || []).map((lecture) => (
                        <div key={lecture.id} className="cdp-lecture-row">
                          <div className="cdp-lecture-info">
                            <span>▶</span>
                            <span><AutoTranslate text={lecture.title} /></span>
                            {lecture.isFree && (
                              <span className="free-preview-tag">{t('courses.freePreview') || 'Ödənişsiz Baxış'}</span>
                            )}
                          </div>
                          <div className="cdp-lecture-action">
                            {lecture.durationMinutes > 0 && (
                              <span>{lecture.durationMinutes} {t('courses.min') || 'dəq'}</span>
                            )}
                            {lecture.videoUrl && (
                              <button
                                className="cdp-watch-btn"
                                onClick={() => setActiveVideo(lecture.videoUrl)}
                              >
                                {t('courses.watchVideo') || 'Videoya Bax'} ▶
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="cdp-box">
              <h2>{t('courses.description') || 'Açıqlama'}</h2>
              <div className="cdp-full-desc">
                <AutoTranslate text={course.description} />
              </div>
            </div>

            {/* Requirements */}
            {course.requirements && (
              <div className="cdp-box">
                <h2>{t('courses.requirements') || 'Tələblər'}</h2>
                <div className="cdp-full-desc">
                  <AutoTranslate text={course.requirements} />
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
