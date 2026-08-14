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
          <div className="pcp-hero__badge">🎓 Online Courses Platform</div>
          <h1 className="pcp-hero__title">
            Learn From Industry <span className="pcp-hero__gradient">Experts</span> Worldwide
          </h1>
          <p className="pcp-hero__desc">
            Explore hundreds of expert-led video courses, gain practical skills, and boost your global career with Edusaz.
          </p>

          {/* Search bar */}
          <div className="pcp-hero__search">
            <input
              type="text"
              placeholder="Search by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="pcp-hero__search-btn">🔍 Search</button>
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
            <h2>{selectedCategory === 'All' ? 'All Courses' : selectedCategory}</h2>
            <span>{courses.length} courses available</span>
          </div>

          {/* Course Cards Grid */}
          {isLoading ? (
            <div className="pcp-loading">
              <div className="pcp-spinner" />
              <p>Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="pcp-empty">
              <div className="pcp-empty__icon">📚</div>
              <h3>No Courses Found</h3>
              <p>We couldn't find any courses matching your criteria. Try adjusting your search or filters.</p>
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
                          <span>{course.instructorName?.[0] || '👨‍🏫'}</span>
                        )}
                      </div>
                      <span>{course.instructorName || 'Instructor'}</span>
                    </div>

                    <div className="pcp-card__footer">
                      <div className="pcp-card__rating">
                        ⭐ {(course.rating || 4.8).toFixed(1)} <span>({course.totalStudents || 0})</span>
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
