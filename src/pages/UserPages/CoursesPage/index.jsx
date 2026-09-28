import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Clock, PlayCircle, Search, SearchX, Star, Users, X } from 'lucide-react';
import { useGetPublishedCoursesQuery } from '../../../services/apis/userApi';
import useAutoTranslate, { AutoTranslate } from '../../../hooks/useAutoTranslate';
import ScrollToTop from '../../../components/Common/ScrollToTop.jsx';
import './index.scss';

const CATEGORIES = [
  { key: 'All', labelAz: 'Bütün Kurslar', labelEn: 'All Courses' },
  { key: 'Programming', labelAz: 'Proqramlaşdırma', labelEn: 'Programming' },
  { key: 'Web Development', labelAz: 'Veb Proqramlaşdırma', labelEn: 'Web Development' },
  { key: 'Mobile Development', labelAz: 'Mobil Proqramlaşdırma', labelEn: 'Mobile Development' },
  { key: 'Data Science', labelAz: 'Data Elmi', labelEn: 'Data Science' },
  { key: 'AI & Machine Learning', labelAz: 'Süni İntellekt', labelEn: 'AI & Machine Learning' },
  { key: 'Design', labelAz: 'Dizayn', labelEn: 'Design' },
  { key: 'Business', labelAz: 'Biznes', labelEn: 'Business' },
  { key: 'Marketing', labelAz: 'Marketinq', labelEn: 'Marketing' },
  { key: 'Finance', labelAz: 'Maliyyə', labelEn: 'Finance' },
  { key: 'Language Learning', labelAz: 'Xarici Dillər', labelEn: 'Language Learning' }
];

const SKELETON_COUNT = 6;

function formatDuration(minutes, t) {
  const total = Number(minutes) || 0;
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} ${t('courses.min', 'dəq')}`;
  return `${h} ${t('pages.courses.hourShort', 'saat')}${m ? ` ${m} ${t('courses.min', 'dəq')}` : ''}`;
}

// <option> only accepts plain text, so the level label is translated with the hook.
function LevelOption({ value }) {
  const label = useAutoTranslate(value);
  return <option value={value}>{label}</option>;
}

function CourseCard({ course, index }) {
  const { t } = useTranslation();
  const hasDiscount = !course.isFree && course.discountPrice > 0 && course.discountPrice < course.price;
  const currency = course.currency || 'AZN';

  return (
    <li className="pcp-grid__item" data-reveal style={{ '--delay': `${Math.min(index, 5) * 60}ms` }}>
      <Link to={`/courses/${course.id}`} className="ds-card ds-card--interactive pcp-card">
        <div className="pcp-card__media">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} loading="lazy" />
          ) : (
            <div className="pcp-card__placeholder">
              <BookOpen aria-hidden />
            </div>
          )}
          {course.isFree && (
            <span className="ds-badge ds-badge--success pcp-card__flag">{t('courses.free', 'Ödənişsiz')}</span>
          )}
        </div>

        <div className="pcp-card__body">
          <div className="pcp-card__tags">
            {course.category && (
              <span className="pcp-card__cat">
                <AutoTranslate text={course.category} />
              </span>
            )}
            {course.level && (
              <span className="pcp-card__level">
                <AutoTranslate text={course.level} />
              </span>
            )}
          </div>

          <h3 className="pcp-card__title">
            <AutoTranslate text={course.title} />
          </h3>

          {(course.shortDescription || course.description) && (
            <p className="pcp-card__desc">
              <AutoTranslate text={course.shortDescription || course.description} />
            </p>
          )}

          {!course.isSuperAdminCreated && course.instructorName && (
            <div className="pcp-card__instructor">
              <span className="pcp-card__avatar" aria-hidden>
                {course.instructorAvatar ? (
                  <img src={course.instructorAvatar} alt="" />
                ) : (
                  course.instructorName?.[0]
                )}
              </span>
              <span className="pcp-card__instructor-name">
                <AutoTranslate text={course.instructorName} />
              </span>
            </div>
          )}

          <ul className="pcp-card__stats">
            <li>
              <PlayCircle aria-hidden />
              {course.totalLectures || 0} {t('courses.lectures', 'dərs')}
            </li>
            {course.totalDurationMinutes > 0 && (
              <li>
                <Clock aria-hidden />
                {formatDuration(course.totalDurationMinutes, t)}
              </li>
            )}
            {course.rating > 0 && (
              <li className="pcp-card__rating">
                <Star aria-hidden />
                {course.rating.toFixed(1)}
                {course.reviewCount > 0 && <span className="ds-muted">({course.reviewCount})</span>}
              </li>
            )}
            {course.totalStudents > 0 && (
              <li>
                <Users aria-hidden />
                {course.totalStudents}
              </li>
            )}
          </ul>

          <div className="pcp-card__price">
            {course.isFree ? (
              <span className="pcp-card__now pcp-card__now--free">{t('courses.free', 'Ödənişsiz')}</span>
            ) : (
              <>
                <span className="pcp-card__now">
                  {hasDiscount ? course.discountPrice : course.price} {currency}
                </span>
                {hasDiscount && (
                  <>
                    <s className="pcp-card__was">
                      {course.price} {currency}
                    </s>
                    <span className="ds-badge ds-badge--brand">
                      −{Math.round((1 - course.discountPrice / course.price) * 100)}%
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

function CourseCardSkeleton() {
  return (
    <li className="pcp-grid__item" aria-hidden>
      <div className="ds-card pcp-card pcp-card--skeleton">
        <div className="pcp-card__media ds-skeleton" />
        <div className="pcp-card__body">
          <span className="ds-skeleton pcp-sk pcp-sk--xs" />
          <span className="ds-skeleton pcp-sk pcp-sk--lg" />
          <span className="ds-skeleton pcp-sk pcp-sk--md" />
          <span className="ds-skeleton pcp-sk pcp-sk--sm" />
        </div>
      </div>
    </li>
  );
}

function CoursesPage() {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const { data: courses = [], isLoading, isFetching } = useGetPublishedCoursesQuery({
    lang: i18n.language,
    category: selectedCategory === 'All' ? '' : selectedCategory,
    search: searchQuery
  });

  const activeCatObj = CATEGORIES.find((c) => c.key === selectedCategory) || CATEGORIES[0];

  // Level filter is applied on the already-loaded list (the API has no level param).
  const levels = [...new Set(courses.map((c) => c.level).filter(Boolean))];
  const levelFilter = levels.includes(selectedLevel) ? selectedLevel : '';
  const visibleCourses = levelFilter ? courses.filter((c) => c.level === levelFilter) : courses;
  const hasFilters = selectedCategory !== 'All' || Boolean(searchQuery) || Boolean(levelFilter);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedLevel('');
  };

  return (
    <main className="ds-page pcp">
      <ScrollToTop />
      <div className="ds-container">
        <header className="ds-page-header pcp-header" data-reveal>
          <span className="ds-eyebrow">{t('courses.platform') || 'Online Kurslar Platforması'}</span>
          <h1 className="ds-title">
            {t('courses.heroTitle') || 'Dünya üzrə Mütəxəssislərdən'}{' '}
            <span className="pcp-header__accent">{t('courses.heroAccent') || 'Öyrən'}</span>
          </h1>
          <p className="ds-lead">
            {t('courses.heroDesc') || 'Yüzlərlə ekspert tərəfindən hazırlanmış kursları kəşf et, praktiki bacarıqlar əldə et.'}
          </p>
        </header>

        <section className="pcp-filters" data-reveal aria-label={t('common.search') || 'Axtar'}>
          <div className="pcp-filters__row">
            <form className="pcp-search" role="search" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="pcp-search-input" className="pcp-sr-only">
                {t('common.search') || 'Axtar'}
              </label>
              <Search className="pcp-search__icon" aria-hidden />
              <input
                id="pcp-search-input"
                type="search"
                className="ds-input pcp-search__input"
                placeholder={t('courses.searchPlaceholder') || 'Ad, mövzu və ya açar söz axtar...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="pcp-search__clear"
                  onClick={() => setSearchQuery('')}
                  aria-label={t('pages.courses.clearSearch', 'Axtarışı təmizlə')}
                >
                  <X aria-hidden />
                </button>
              )}
            </form>

            {levels.length > 0 && (
              <div className="pcp-level">
                <label htmlFor="pcp-level-select" className="pcp-sr-only">
                  {t('pages.courses.level', 'Səviyyə')}
                </label>
                <select
                  id="pcp-level-select"
                  className="ds-select"
                  value={levelFilter}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <option value="">{t('pages.courses.allLevels', 'Bütün səviyyələr')}</option>
                  {levels.map((lvl) => (
                    <LevelOption key={lvl} value={lvl} />
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pcp-chips" role="group" aria-label={t('pages.courses.categories', 'Kateqoriyalar')}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                className="ds-chip"
                aria-pressed={selectedCategory === cat.key}
                onClick={() => setSelectedCategory(cat.key)}
              >
                <AutoTranslate text={cat.labelAz} />
              </button>
            ))}
          </div>
        </section>

        <div className="pcp-results-head">
          <h2 className="ds-h3">
            <AutoTranslate text={activeCatObj.labelAz} />
          </h2>
          {!isLoading && (
            <span className="ds-muted" aria-live="polite">
              {visibleCourses.length} {t('courses.available') || 'kurs mövcuddur'}
            </span>
          )}
        </div>

        {isLoading ? (
          <ul className="pcp-grid" aria-busy="true">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </ul>
        ) : visibleCourses.length === 0 ? (
          <div className="ds-empty pcp-empty">
            <SearchX aria-hidden />
            <strong>{t('courses.notFound') || 'Kurs tapılmadı'}</strong>
            <p>{t('courses.notFoundDesc') || 'Axtarış meyarlarına uyğun kurs tapılmadı. Filtrləri dəyişdirin.'}</p>
            {hasFilters && (
              <button type="button" className="ds-btn ds-btn--secondary ds-btn--sm" onClick={resetFilters}>
                {t('pages.courses.resetFilters', 'Filtrləri sıfırla')}
              </button>
            )}
          </div>
        ) : (
          <ul className="pcp-grid" data-busy={isFetching ? 'true' : 'false'}>
            {visibleCourses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

export default CoursesPage;
