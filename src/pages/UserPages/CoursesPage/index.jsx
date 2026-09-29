import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, Clock, PlayCircle, Search, SearchX, Star, Users, X } from 'lucide-react';
import { useGetPublishedCoursesQuery } from '../../../services/apis/userApi';
import useAutoTranslate, { AutoTranslate } from '../../../hooks/useAutoTranslate';
import ScrollToTop from '../../../components/Common/ScrollToTop.jsx';
import { categoryLabel, levelLabel } from '../../../locales/courseLabels';
import './index.scss';

// `key` is the value stored in the database; labels come from the static courses.cat.* translations.
const CATEGORIES = [
  { key: 'All', label: 'all' },
  { key: 'Programming', label: 'programming' },
  { key: 'Web Development', label: 'webDevelopment' },
  { key: 'Mobile Development', label: 'mobileDevelopment' },
  { key: 'Data Science', label: 'dataScience' },
  { key: 'AI & Machine Learning', label: 'ai' },
  { key: 'Design', label: 'design' },
  { key: 'Business', label: 'business' },
  { key: 'Marketing', label: 'marketing' },
  { key: 'Finance', label: 'finance' },
  { key: 'Language Learning', label: 'languages' },
];

const SKELETON_COUNT = 6;

function formatDuration(minutes, t) {
  const total = Number(minutes) || 0;
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h) return `${m} ${t('courses.min')}`;
  return `${h} ${t('courses.hourShort')}${m ? ` ${m} ${t('courses.min')}` : ''}`;
}

// <option> only accepts plain text: known levels use the static translations, anything else is translated on the fly.
function LevelOption({ value }) {
  const { t } = useTranslation();
  const auto = useAutoTranslate(value);
  return <option value={value}>{levelLabel(t, value) || auto}</option>;
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
            <span className="ds-badge ds-badge--success pcp-card__flag">{t('courses.free')}</span>
          )}
        </div>

        <div className="pcp-card__body">
          <div className="pcp-card__tags">
            {course.category && (
              <span className="pcp-card__cat">
                {categoryLabel(t, course.category) || <AutoTranslate text={course.category} />}
              </span>
            )}
            {course.level && (
              <span className="pcp-card__level">
                {levelLabel(t, course.level) || <AutoTranslate text={course.level} />}
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
                {course.instructorName}
              </span>
            </div>
          )}

          <ul className="pcp-card__stats">
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
              <span className="pcp-card__now pcp-card__now--free">{t('courses.free')}</span>
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
          <span className="ds-eyebrow">{t('courses.platform')}</span>
          <h1 className="ds-title">
            {t('courses.heroTitle')}
            {/* Chinese and Japanese don't put spaces between the two halves of the headline. */}
            {/^(zh|jp)/.test(i18n.language || '') ? '' : ' '}
            <span className="pcp-header__accent">{t('courses.heroAccent')}</span>
          </h1>
          <p className="ds-lead">{t('courses.heroDesc')}</p>
        </header>

        <section className="pcp-filters" data-reveal aria-label={t('courses.searchPlaceholder')}>
          <div className="pcp-filters__row">
            <form className="pcp-search" role="search" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="pcp-search-input" className="pcp-sr-only">
                {t('courses.searchPlaceholder')}
              </label>
              <Search className="pcp-search__icon" aria-hidden />
              <input
                id="pcp-search-input"
                type="search"
                className="ds-input pcp-search__input"
                placeholder={t('courses.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="pcp-search__clear"
                  onClick={() => setSearchQuery('')}
                  aria-label={t('courses.clearSearch')}
                >
                  <X aria-hidden />
                </button>
              )}
            </form>

            {levels.length > 0 && (
              <div className="pcp-level">
                <label htmlFor="pcp-level-select" className="pcp-sr-only">
                  {t('courses.level')}
                </label>
                <select
                  id="pcp-level-select"
                  className="ds-select"
                  value={levelFilter}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <option value="">{t('courses.allLevels')}</option>
                  {levels.map((lvl) => (
                    <LevelOption key={lvl} value={lvl} />
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pcp-chips" role="group" aria-label={t('courses.categoriesLabel')}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                className="ds-chip"
                aria-pressed={selectedCategory === cat.key}
                onClick={() => setSelectedCategory(cat.key)}
              >
                {t(`courses.cat.${cat.label}`)}
              </button>
            ))}
          </div>
        </section>

        <div className="pcp-results-head">
          <h2 className="ds-h3">
            {t(`courses.cat.${activeCatObj.label}`)}
          </h2>
          {!isLoading && (
            <span className="ds-muted" aria-live="polite">
              {t('courses.availableCount', { count: visibleCourses.length })}
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
            <strong>{t('courses.notFound')}</strong>
            <p>{t('courses.notFoundDesc')}</p>
            {hasFilters && (
              <button type="button" className="ds-btn ds-btn--secondary ds-btn--sm" onClick={resetFilters}>
                {t('courses.resetFilters')}
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
