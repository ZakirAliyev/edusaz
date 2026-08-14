import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetPublishedCourseByIdQuery } from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import ScrollToTop from '../../../components/Common/ScrollToTop.jsx';
import './index.scss';

function CourseDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const { data: course, isLoading } = useGetPublishedCourseByIdQuery({ id, lang: i18n.language });

  if (isLoading) {
    return (
      <div className="cdp-loading">
        <div className="cdp-spinner" />
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="cdp-empty">
        <h2>Course Not Found</h2>
        <p>The requested course does not exist or has been removed.</p>
        <Link to="/courses" className="cdp-btn">← Back to Courses</Link>
      </div>
    );
  }

  const handleEnroll = () => {
    toast.showSuccess(`Enrolled in "${course.title}" successfully! 🎉`);
  };

  return (
    <div className="course-detail-page">
      <ScrollToTop />

      {/* Hero Header */}
      <section className="cdp-hero">
        <div className="container">
          <div className="cdp-hero__content">
            <div className="cdp-breadcrumbs">
              <Link to="/">Home</Link> / <Link to="/courses">Courses</Link> / <span>{course.category}</span>
            </div>
            <h1 className="cdp-title">{course.title}</h1>
            <p className="cdp-desc">{course.shortDescription || course.description}</p>

            <div className="cdp-meta">
              <span className="cdp-badge">{course.level}</span>
              <span>⭐ {(course.rating || 4.8).toFixed(1)} rating</span>
              <span>👥 {course.totalStudents || 0} students</span>
              <span>🌐 Language: {course.language?.toUpperCase()}</span>
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
                <div className="cdp-instructor__name">Created by <strong>{course.instructorName || 'Instructor'}</strong></div>
                <div className="cdp-instructor__exp">{course.instructorExpertise}</div>
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
                  <span className="free">Free Course</span>
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
                {course.isFree ? 'Enroll Now (Free)' : 'Buy Course Now'}
              </button>

              <div className="cdp-card__includes">
                <h4>This course includes:</h4>
                <ul>
                  <li>📹 {course.totalLectures || 0} video lectures</li>
                  <li>⏱️ {course.totalDurationMinutes || 0} minutes total duration</li>
                  <li>📱 Access on mobile and TV</li>
                  <li>📜 Certificate of completion</li>
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
                <h2>What You'll Learn</h2>
                <div className="cdp-learn-grid">
                  {course.whatYouLearn.split('\n').filter(Boolean).map((item, idx) => (
                    <div key={idx} className="cdp-learn-item">
                      <span>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Content / Curriculum */}
            <div className="cdp-box">
              <h2>Course Content</h2>
              <div className="cdp-curriculum">
                {(course.sections || []).map((section, sIdx) => (
                  <div key={section.id} className="cdp-section">
                    <div
                      className="cdp-section__header"
                      onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                    >
                      <span className="cdp-section__title">Section {sIdx + 1}: {section.title}</span>
                      <span className="cdp-section__count">{(section.lectures || []).length} lectures</span>
                    </div>

                    <div className="cdp-section__lectures">
                      {(section.lectures || []).map((lecture) => (
                        <div key={lecture.id} className="cdp-lecture-row">
                          <div className="cdp-lecture-info">
                            <span>▶</span>
                            <span>{lecture.title}</span>
                            {lecture.isFree && <span className="free-preview-tag">Free Preview</span>}
                          </div>
                          <div className="cdp-lecture-action">
                            {lecture.durationMinutes > 0 && <span>{lecture.durationMinutes} min</span>}
                            {lecture.videoUrl && (
                              <button
                                className="cdp-watch-btn"
                                onClick={() => setActiveVideo(lecture.videoUrl)}
                              >
                                Watch Video ▶
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
              <h2>Description</h2>
              <div className="cdp-full-desc">{course.description}</div>
            </div>

            {/* Requirements */}
            {course.requirements && (
              <div className="cdp-box">
                <h2>Requirements</h2>
                <div className="cdp-full-desc">{course.requirements}</div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default CourseDetailPage;
