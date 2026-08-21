import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetPublishedCoursesQuery } from '../../../services/apis/userApi';
import ScrollToTop from '../../../components/Common/ScrollToTop.jsx';
import './index.scss';

const CATEGORIES = [
  'All', 'Programming', 'Web Development', 'Mobile Development', 'Data Science',
  'AI & Machine Learning', 'Design', 'Business', 'Marketing', 'Finance', 'Language Learning'
];

function CoursesPage() {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: courses = [], isLoading } = useGetPublishedCoursesQuery({
    lang: i18n.language,
    category: selectedCategory === 'All' ? '' : selectedCategory,
    search: searchQuery
  });

  return (
    <div className="public-courses-page">
      <ScrollToTop />

      {/* Hero Banner */}
      <section className="pcp-hero">
        <div className="container">
          <div className="pcp-hero__badge">🎓 {t('courses.platform') || 'Online Kurslar Platforması'}</div>
          <h1 className="pcp-hero__title">
            {t('courses.heroTitle') || 'Dünya üzrə Mütəxəssislərdən'} <span className="pcp-hero__gradient">{t('courses.heroAccent') || 'Öyrən'}</span>
          </h1>
          <p className="pcp-hero__desc">
            {t('courses.heroDesc') || 'Yüzlərlə ekspert tərəfindən hazırlanmış kursları kəşf et, praktiki bacarıqlar əldə et.'}
          </p>

          {/* Search bar */}
          <div className="pcp-hero__search">
            <input
              type="text"
              placeholder={t('courses.searchPlaceholder') || 'Ad, mövzu və ya açar söz axtar...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="pcp-hero__search-btn">🔍 {t('common.search') || 'Axtar'}</button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pcp-main">
        <div className="container">
          {/* Category Filter Pills */}
          <div className="pcp-categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`pcp-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Courses Count */}
          <div className="pcp-meta">
            <h2>{selectedCategory === 'All' ? (t('courses.allCourses') || 'Bütün Kurslar') : selectedCategory}</h2>
            <span>{courses.length} {t('courses.available') || 'kurs mövcuddur'}</span>
          </div>

          {/* Course Cards Grid */}
          {isLoading ? (
            <div className="pcp-loading">
              <div className="pcp-spinner" />
              <p>{t('common.loading') || 'Yüklənir...'}</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="pcp-empty">
              <div className="pcp-empty__icon">📚</div>
              <h3>{t('courses.notFound') || 'Kurs tapılmadı'}</h3>
              <p>{t('courses.notFoundDesc') || 'Axtarış meyarlarına uyğun kurs tapılmadı. Filtrleri dəyişdirin.'}</p>
            </div>
          ) : (
            <div className="pcp-grid">
              {courses.map((course) => (
                <Link to={`/courses/${course.id}`} key={course.id} className="pcp-card">
                  <div className="pcp-card__thumb">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} />
                    ) : (
                      <div className="pcp-card__placeholder">📚</div>
                    )}
                    <span className="pcp-card__level">{course.level}</span>
                    {course.isFree && <span className="pcp-card__free-tag">Free</span>}
                  </div>

                  <div className="pcp-card__body">
                    <span className="pcp-card__cat">{course.category}</span>
                    <h3 className="pcp-card__title">{course.title}</h3>
                    <p className="pcp-card__desc">{course.shortDescription || course.description}</p>

                    <div className="pcp-card__instructor">
                      <div className="pcp-card__avatar">
                        {course.instructorAvatar ? (
                          <img src={course.instructorAvatar} alt={course.instructorName} />
                        ) : (
                          <span>{course.instructorName?.[0] || '🎓'}</span>
                        )}
                      </div>
                      {course.instructorName && <span>{course.instructorName}</span>}
                    </div>

                    <div className="pcp-card__footer">
                      <div className="pcp-card__rating">
                        {course.rating > 0 ? (
                          <>⭐ {course.rating.toFixed(1)} <span>({course.totalStudents || 0})</span></>
                        ) : course.totalStudents > 0 ? (
                          <span>👥 {course.totalStudents}</span>
                        ) : null}
                      </div>
                      <div className="pcp-card__price">
                        {course.isFree ? (
                          <span className="free">Free</span>
                        ) : (
                          <>
                            {course.discountPrice > 0 && course.discountPrice < course.price && (
                              <span className="discount">${course.discountPrice}</span>
                            )}
                            <span className={course.discountPrice > 0 ? 'original strikethrough' : 'original'}>
                              ${course.price}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default CoursesPage;
