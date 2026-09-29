import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  MapPin,
  MessageSquare,
  PlayCircle,
  Star,
  X,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import {
  useGetUniversityByIdQuery,
  useGetProgramsQuery,
  useGetScholarshipsQuery,
  useCreateStudentApplicationMutation,
  useGetReviewsQuery,
  useCreateReviewMutation,
} from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
import { AutoTranslate } from '../../../hooks/useAutoTranslate';
import { resolveMediaUrl } from '../../../config/env';
import Cookies from 'js-cookie';
import ScrollToTop from '../../../components/Common/ScrollToTop';
import './index.scss';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=75';

const onImgError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
};

// Extract YouTube embed ID from any YouTube URL
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function YouTubeEmbed({ url, title }) {
  const { t } = useTranslation();
  const videoId = getYouTubeId(url);
  if (videoId) {
    return (
      <div className="udp-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <a className="udp-video udp-video--link" href={url} target="_blank" rel="noopener noreferrer">
      <PlayCircle aria-hidden />
      <span>{t('pages.universityDetail.watchVideo', 'Videoya bax')}</span>
    </a>
  );
}

// The API returns degreeLevel/studyMode; older payloads used degree/mode.
const programMeta = (prog) =>
  [prog.degree || prog.degreeLevel, prog.duration, prog.mode || prog.studyMode, prog.languageOfInstruction]
    .filter(Boolean)
    .join(' · ');

function Stars({ value }) {
  return (
    <span className="udp-stars-static" role="img" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden data-filled={n <= value} />
      ))}
    </span>
  );
}

function DetailSkeleton() {
  return (
    <main className="ds-page udp-page" aria-busy="true">
      <div className="ds-container">
        <div className="ds-skeleton udp-sk udp-sk--crumb" />
        <div className="ds-skeleton udp-sk udp-sk--cover" />
        <div className="ds-skeleton udp-sk udp-sk--title" />
        <div className="ds-skeleton udp-sk udp-sk--line" />
        <div className="udp-sk-facts">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="ds-skeleton udp-sk udp-sk--fact" />
          ))}
        </div>
      </div>
    </main>
  );
}

function UniversityDetailPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedKind, setSelectedKind] = useState(null); // 'program' | 'scholarship' | null
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyFormData, setApplyFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    originCountry: 'Azərbaycan',
    notes: ''
  });

  // Gallery lightbox
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { data: uni, isLoading, isError } = useGetUniversityByIdQuery({ id, lang: language });
  const [createApplication] = useCreateStudentApplicationMutation();
  const { data: reviews = [], refetch: refetchReviews } = useGetReviewsQuery(
    { universityId: id },
    { skip: !id }
  );
  const [createReview] = useCreateReviewMutation();

  const { data: programs = [], isLoading: isLoadingPrograms } = useGetProgramsQuery(
    { lang: language, universityId: id },
    { skip: !id }
  );

  const { data: scholarships = [], isLoading: isLoadingScholarships } = useGetScholarshipsQuery(
    { lang: language, universityId: id },
    { skip: !id }
  );

  const images = uni ? (uni.images || uni.mediaUrls || []) : [];
  const videos = uni ? (uni.videoUrls || uni.videos || []) : [];

  // Escape closes the modal / lightbox; arrows move through the gallery.
  useEffect(() => {
    if (!isApplyModalOpen && lightboxIndex === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsApplyModalOpen(false);
        setLightboxIndex(null);
      } else if (lightboxIndex !== null && images.length > 1) {
        const rtl = document.documentElement.dir === 'rtl';
        if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + (rtl ? -1 : 1) + images.length) % images.length);
        if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i + (rtl ? 1 : -1) + images.length) % images.length);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isApplyModalOpen, lightboxIndex, images.length]);

  const openApplyModal = (program = null, kind = program ? 'program' : null) => {
    const token = Cookies.get('userToken');
    if (!token) {
      toast.showError(t('auth.loginRequired', 'Müraciət etmək üçün daxil olun'));
      navigate('/signin');
      return;
    }

    const userName = localStorage.getItem('userName') || '';
    const userEmail = localStorage.getItem('userEmail') || '';

    setApplyFormData({
      studentName: userName,
      email: userEmail,
      phone: '',
      originCountry: 'Azərbaycan',
      notes: ''
    });
    setSelectedProgram(program);
    setSelectedKind(kind);
    setApplySubmitted(false);
    setIsApplyModalOpen(true);
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      await createApplication({
        universityId: id,
        // Only real programs may be linked (ProgramId is a foreign key to Programs).
        programId: selectedKind === 'program' ? selectedProgram?.id || null : null,
        studentName: applyFormData.studentName || 'Tələbə',
        programName: selectedProgram?.name || selectedProgram?.title || uni?.name || 'Ümumi Müraciət',
        email: applyFormData.email || '',
        phone: applyFormData.phone || '',
        originCountry: applyFormData.originCountry || 'Azərbaycan',
        countryFlag: '🌐',
        matchScore: 95
      }).unwrap();
      setApplySubmitted(true);
    } catch {
      toast.showError(t('pages.universityDetail.applyError', 'Müraciət göndərilmədi. Zəhmət olmasa bir az sonra yenidən cəhd edin.'));
    } finally {
      setIsApplying(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get('userToken');
    if (!token) {
      toast.showError(t('auth.loginRequired', 'Rəy yazmaq üçün daxil olun'));
      navigate('/signin');
      return;
    }
    if (!reviewComment.trim()) {
      toast.showError(t('pages.universityDetail.reviewRequired', 'Zəhmət olmasa rəyinizi daxil edin'));
      return;
    }

    setIsSubmittingReview(true);
    try {
      const userName = localStorage.getItem('userName') || 'Tələbə';
      await createReview({
        universityId: id,
        authorName: userName,
        rating: reviewRating,
        comment: reviewComment.trim()
      }).unwrap();
      setReviewComment('');
      toast.showSuccess(t('pages.universityDetail.reviewSuccess', 'Rəyiniz uğurla əlavə olundu!'));
      refetchReviews();
    } catch {
      toast.showError(t('pages.universityDetail.reviewError', 'Rəy göndərilərkən xəta baş verdi'));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError || !uni) {
    return (
      <main className="ds-page udp-page">
        <div className="ds-container">
          <div className="ds-empty">
            <GraduationCap aria-hidden />
            <h1 className="ds-h3">{t('universities.notFound', 'Universitet tapılmadı')}</h1>
            <Link to="/universities" className="ds-btn ds-btn--secondary">
              <ArrowLeft aria-hidden className="udp-flip" />
              {t('common.back', 'Geri')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const location = [uni.city, uni.country].filter(Boolean).join(', ');
  const cover = resolveMediaUrl(images[0] || uni.logoUrl) || FALLBACK_IMAGE;
  // Only show a separate logo tile when the cover comes from the gallery (otherwise logoUrl is the cover).
  const logo = images.length > 0 && uni.logoUrl ? resolveMediaUrl(uni.logoUrl) : null;
  const websiteHost = uni.websiteUrl ? uni.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';

  const facts = [
    { key: 'tuition', label: t('matchedUniversities.labels.tuition', 'Təhsil haqqı'), value: uni.tuition },
    { key: 'acceptance', label: t('matchedUniversities.labels.acceptance', 'Qəbul faizi'), value: uni.acceptanceRate },
    { key: 'language', label: t('matchedUniversities.labels.language', 'Tədris dili'), value: uni.teachingLanguage },
    { key: 'deadline', label: t('scholarshipsSection.deadline', 'Son müraciət'), value: uni.deadline },
  ].filter((f) => f.value);

  const details = [
    { key: 'country', label: t('common.country', 'Ölkə'), value: uni.country && <AutoTranslate text={uni.country} /> },
    { key: 'city', label: t('common.city', 'Şəhər'), value: uni.city && <AutoTranslate text={uni.city} /> },
    { key: 'est', label: t('pages.universityDetail.established', 'Əsası qoyulub'), value: uni.establishedYear },
    { key: 'ranking', label: t('common.ranking', 'Reytinq'), value: uni.ranking },
  ].filter((d) => d.value);

  const sections = [
    { id: 'about', label: t('common.overview', 'Ümumi baxış') },
    images.length > 0 && { id: 'gallery', label: t('pages.universityDetail.gallery', 'Şəkillər') },
    videos.length > 0 && { id: 'videos', label: t('pages.universityDetail.videos', 'Videolar') },
    { id: 'programs', label: t('common.programs', 'Proqramlar') },
    { id: 'scholarships', label: t('common.scholarships', 'Təqaüdlər') },
    { id: 'reviews', label: `${t('common.reviews', 'Rəylər')} (${reviews.length})` },
  ].filter(Boolean);

  const stepLightbox = (dir) => setLightboxIndex((i) => (i + dir + images.length) % images.length);

  return (
    <main className="ds-page udp-page">
      <ScrollToTop />

      <div className="ds-container">
        {/* ── Breadcrumb ── */}
        <nav className="udp-crumbs" aria-label={t('pages.universityDetail.breadcrumb', 'Naviqasiya')}>
          <Link to="/universities" className="udp-crumbs__back">
            <ArrowLeft aria-hidden className="udp-flip" />
            {t('pages.universityDetail.allUniversities', 'Bütün universitetlər')}
          </Link>
        </nav>

        {/* ── Hero ── */}
        <header className="udp-hero">
          <div className="udp-hero__cover" data-reveal>
            <img src={cover} onError={onImgError} alt="" fetchPriority="high" />
          </div>

          <div className="udp-hero__head" data-reveal>
            {logo && (
              <div className="udp-hero__logo">
                <img src={logo} alt={`${uni.name} logo`} />
              </div>
            )}

            <div className="udp-hero__info">
              {(uni.ranking || uni.hasScholarship) && (
                <div className="udp-hero__badges">
                  {uni.ranking && (
                    <span className="ds-badge">
                      <Award aria-hidden />
                      {uni.ranking}
                    </span>
                  )}
                  {uni.hasScholarship && (
                    <span className="ds-badge ds-badge--brand">
                      <GraduationCap aria-hidden />
                      {t('matchedUniversities.tags.scholarship', 'Təqaüdlü')}
                    </span>
                  )}
                </div>
              )}

              <h1 className="ds-title udp-hero__title"><AutoTranslate text={uni.name} /></h1>

              <ul className="udp-hero__meta">
                {location && (
                  <li>
                    <MapPin aria-hidden />
                    {location}
                  </li>
                )}
                {uni.establishedYear && (
                  <li>
                    <CalendarDays aria-hidden />
                    {t('pages.universityDetail.established', 'Əsası qoyulub')}: {uni.establishedYear}
                  </li>
                )}
                {uni.websiteUrl && (
                  <li>
                    <ExternalLink aria-hidden />
                    <a href={uni.websiteUrl} target="_blank" rel="noopener noreferrer" className="udp-hero__web">
                      {websiteHost}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <div className="udp-hero__actions">
              <button type="button" className="ds-btn ds-btn--primary ds-btn--lg" onClick={() => openApplyModal()}>
                {t('common.apply', 'Müraciət et')}
                <ArrowRight aria-hidden className="udp-flip" />
              </button>
            </div>
          </div>

          {facts.length > 0 && (
            <dl className="udp-facts" data-reveal>
              {facts.map((f) => (
                <div key={f.key} className="udp-facts__item">
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </header>

        {/* ── In-page navigation ── */}
        <nav className="udp-subnav" aria-label={t('pages.universityDetail.sections', 'Bölmələr')}>
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="ds-chip">{s.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="udp-layout">
          <div className="udp-main">
            {/* ABOUT */}
            <section id="about" className="udp-section" data-reveal>
              <h2 className="ds-h2">
                <AutoTranslate text={uni.name} /> {t('common.about', 'haqqında')}
              </h2>
              {uni.description ? (
                <p className="udp-about__text"><AutoTranslate text={uni.description} /></p>
              ) : (
                <p className="ds-muted">{t('common.noDescription', 'Məlumat mövcud deyil.')}</p>
              )}

              {details.length > 0 && (
                <dl className="udp-details">
                  {details.map((d) => (
                    <div key={d.key} className="udp-details__item">
                      <dt>{d.label}</dt>
                      <dd>{d.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>

            {/* GALLERY */}
            {images.length > 0 && (
              <section id="gallery" className="udp-section" data-reveal>
                <h2 className="ds-h2">{t('pages.universityDetail.gallery', 'Şəkillər')}</h2>
                <ul className="udp-gallery">
                  {images.map((imgUrl, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className="udp-gallery__item"
                        onClick={() => setLightboxIndex(i)}
                        aria-label={`${uni.name} — ${t('pages.universityDetail.photo', 'şəkil')} ${i + 1}`}
                      >
                        <img src={resolveMediaUrl(imgUrl)} alt="" loading="lazy" onError={onImgError} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* VIDEOS */}
            {videos.length > 0 && (
              <section id="videos" className="udp-section" data-reveal>
                <h2 className="ds-h2">{t('pages.universityDetail.videos', 'Videolar')}</h2>
                <div className="udp-videos">
                  {videos.map((vidUrl, i) => (
                    <YouTubeEmbed key={i} url={vidUrl} title={`${uni.name} — video ${i + 1}`} />
                  ))}
                </div>
              </section>
            )}

            {/* PROGRAMS */}
            <section id="programs" className="udp-section" data-reveal>
              <h2 className="ds-h2">{t('common.programs', 'Proqramlar')}</h2>
              {isLoadingPrograms ? (
                <div className="udp-list">
                  {[0, 1].map((i) => <div key={i} className="ds-skeleton udp-sk udp-sk--row" />)}
                </div>
              ) : programs.length === 0 ? (
                <div className="ds-empty udp-empty">
                  <BookOpen aria-hidden />
                  <p>{t('common.noPrograms', 'Bu universitet üçün proqram məlumatı mövcud deyil.')}</p>
                </div>
              ) : (
                <ul className="udp-list">
                  {programs.map((prog) => (
                    <li key={prog.id} className="udp-program">
                      <div className="udp-program__main">
                        <h3 className="ds-h3"><AutoTranslate text={prog.name || prog.title} /></h3>
                        {programMeta(prog) && <p className="udp-program__meta">{programMeta(prog)}</p>}
                        {prog.description && (
                          <p className="udp-program__desc"><AutoTranslate text={prog.description} /></p>
                        )}
                      </div>
                      <div className="udp-program__side">
                        {prog.tuitionFee && <span className="udp-program__fee">{prog.tuitionFee}</span>}
                        <button
                          type="button"
                          className="ds-btn ds-btn--secondary ds-btn--sm"
                          onClick={() => openApplyModal(prog, 'program')}
                        >
                          {t('common.apply', 'Müraciət et')}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* SCHOLARSHIPS */}
            <section id="scholarships" className="udp-section" data-reveal>
              <h2 className="ds-h2">{t('common.scholarships', 'Təqaüdlər')}</h2>
              {isLoadingScholarships ? (
                <div className="udp-list">
                  {[0, 1].map((i) => <div key={i} className="ds-skeleton udp-sk udp-sk--row" />)}
                </div>
              ) : scholarships.length === 0 ? (
                <div className="ds-empty udp-empty">
                  <Award aria-hidden />
                  <p>{t('common.noScholarships', 'Bu universitet üçün təqaüd məlumatı mövcud deyil.')}</p>
                </div>
              ) : (
                <ul className="udp-scholarships">
                  {scholarships.map((s) => (
                    <li key={s.id} className="udp-scholarship ds-card">
                      <h3 className="ds-h3"><AutoTranslate text={s.name || s.title} /></h3>
                      {s.amount && <p className="udp-scholarship__amount">{s.amount}</p>}
                      {s.description && (
                        <p className="udp-scholarship__desc"><AutoTranslate text={s.description} /></p>
                      )}
                      <button
                        type="button"
                        className="ds-btn ds-btn--soft ds-btn--sm"
                        onClick={() => openApplyModal(s, 'scholarship')}
                      >
                        {t('common.apply', 'Müraciət et')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* REVIEWS */}
            <section id="reviews" className="udp-section" data-reveal>
              <h2 className="ds-h2">{t('common.reviews', 'Tələbə rəyləri')}</h2>

              <form className="udp-review-form ds-card ds-card--pad" onSubmit={handleReviewSubmit}>
                <h3 className="ds-h3">{t('common.writeReview', 'Rəy bildir')}</h3>

                <fieldset className="udp-rating">
                  <legend className="ds-label">{t('pages.universityDetail.ratingLabel', 'Qiymət')}</legend>
                  <div className="udp-rating__stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="udp-rating__star"
                        data-active={star <= reviewRating}
                        aria-pressed={star === reviewRating}
                        aria-label={`${star} / 5`}
                        onClick={() => setReviewRating(star)}
                      >
                        <Star aria-hidden />
                      </button>
                    ))}
                    <span className="udp-rating__value">{reviewRating} / 5</span>
                  </div>
                </fieldset>

                <div className="ds-field">
                  <label className="ds-label" htmlFor="udp-review-comment">
                    {t('pages.universityDetail.yourReview', 'Rəyiniz')}
                  </label>
                  <textarea
                    id="udp-review-comment"
                    className="ds-textarea"
                    rows="3"
                    placeholder={t('pages.universityDetail.reviewPlaceholder', 'Bu universitet haqqında təcrübənizi və fikirlərinizi bölüşün...')}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                <div>
                  <button type="submit" className="ds-btn ds-btn--dark" disabled={isSubmittingReview}>
                    {isSubmittingReview
                      ? t('pages.universityDetail.submitting', 'Göndərilir...')
                      : t('pages.universityDetail.submitReview', 'Rəyi göndər')}
                  </button>
                </div>
              </form>

              {reviews.length === 0 ? (
                <div className="ds-empty udp-empty">
                  <MessageSquare aria-hidden />
                  <p>{t('pages.universityDetail.noReviews', 'Bu universitet üçün hələ rəy yazılmayıb. İlk rəyi siz yazın!')}</p>
                </div>
              ) : (
                <ul className="udp-reviews">
                  {reviews.map((rev) => (
                    <li key={rev.id} className="udp-review">
                      <div className="udp-review__head">
                        <span className="udp-review__avatar" aria-hidden>
                          {rev.authorAvatar ? (
                            <img src={resolveMediaUrl(rev.authorAvatar)} alt="" />
                          ) : (
                            rev.authorName?.[0] || '?'
                          )}
                        </span>
                        <span className="udp-review__who">
                          <strong>{rev.authorName}</strong>
                          <span className="udp-review__date">
                            {new Date(rev.createdDate).toLocaleDateString()}
                          </span>
                        </span>
                        <Stars value={rev.rating || 5} />
                      </div>
                      <p className="udp-review__text"><AutoTranslate text={rev.comment} /></p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* ── Sticky apply card ── */}
          <aside className="udp-aside">
            <div className="udp-apply ds-card ds-card--pad">
              <h2 className="ds-h3">{t('pages.universityDetail.applyTitle', 'Bu universitetə müraciət edin')}</h2>
              <p className="ds-muted udp-apply__text">
                {t(
                  'pages.universityDetail.applyText',
                  'Formu doldurun — müraciətiniz universitetin nümayəndəsinə çatdırılacaq və sizinlə əlaqə saxlanılacaq.'
                )}
              </p>
              {(uni.deadline || uni.tuition) && (
                <dl className="udp-apply__facts">
                  {uni.deadline && (
                    <div>
                      <dt>{t('scholarshipsSection.deadline', 'Son müraciət')}</dt>
                      <dd>{uni.deadline}</dd>
                    </div>
                  )}
                  {uni.tuition && (
                    <div>
                      <dt>{t('matchedUniversities.labels.tuition', 'Təhsil haqqı')}</dt>
                      <dd>{uni.tuition}</dd>
                    </div>
                  )}
                </dl>
              )}
              <button type="button" className="ds-btn ds-btn--primary ds-btn--block" onClick={() => openApplyModal()}>
                {t('common.apply', 'Müraciət et')}
                <ArrowRight aria-hidden className="udp-flip" />
              </button>
              {uni.websiteUrl && (
                <a
                  href={uni.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-btn ds-btn--secondary ds-btn--block"
                >
                  {t('pages.universityDetail.website', 'Rəsmi sayt')}
                  <ExternalLink aria-hidden />
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ── Gallery lightbox ── */}
      {lightboxIndex !== null && images[lightboxIndex] && createPortal(
        <div
          className="udp-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={t('pages.universityDetail.gallery', 'Şəkillər')}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            className="udp-lightbox__btn udp-lightbox__close"
            onClick={() => setLightboxIndex(null)}
            aria-label={t('common.close', 'Bağla')}
            autoFocus
          >
            <X aria-hidden />
          </button>
          {images.length > 1 && (
            <button
              type="button"
              className="udp-lightbox__btn udp-lightbox__prev"
              onClick={(e) => { e.stopPropagation(); stepLightbox(-1); }}
              aria-label={t('pages.universityDetail.prev', 'Əvvəlki')}
            >
              <ChevronLeft aria-hidden className="udp-flip" />
            </button>
          )}
          <figure className="udp-lightbox__figure" onClick={(e) => e.stopPropagation()}>
            <img src={resolveMediaUrl(images[lightboxIndex])} alt={`${uni.name} ${lightboxIndex + 1}`} />
            <figcaption>{lightboxIndex + 1} / {images.length}</figcaption>
          </figure>
          {images.length > 1 && (
            <button
              type="button"
              className="udp-lightbox__btn udp-lightbox__next"
              onClick={(e) => { e.stopPropagation(); stepLightbox(1); }}
              aria-label={t('pages.universityDetail.next', 'Növbəti')}
            >
              <ChevronRight aria-hidden className="udp-flip" />
            </button>
          )}
        </div>,
        document.body
      )}

      {/* ── APPLICATION MODAL ── */}
      {isApplyModalOpen && createPortal(
        <div className="udp-modal" onClick={() => setIsApplyModalOpen(false)}>
          <div
            className="udp-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="udp-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="udp-modal__close"
              onClick={() => setIsApplyModalOpen(false)}
              aria-label={t('common.close', 'Bağla')}
            >
              <X aria-hidden />
            </button>

            {applySubmitted ? (
              <div className="udp-modal__success">
                <span className="udp-modal__success-icon" aria-hidden><Check /></span>
                <h2 id="udp-modal-title" className="ds-h3">
                  {t('apply.successTitle', 'Müraciətiniz qəbul olundu!')}
                </h2>
                <p className="ds-muted">
                  {t('apply.successDesc', 'Müraciətiniz bazada qeydə alındı və universitet nümayəndəsinə çatdırıldı.')}
                </p>
                <p className="udp-modal__chip">
                  <GraduationCap aria-hidden />
                  <span>
                    <AutoTranslate text={uni.name} />
                    {selectedProgram && (
                      <> — <AutoTranslate text={selectedProgram.name || selectedProgram.title} /></>
                    )}
                  </span>
                </p>
                <button
                  type="button"
                  className="ds-btn ds-btn--dark"
                  onClick={() => setIsApplyModalOpen(false)}
                >
                  {t('common.close', 'Bağla')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplicationSubmit} className="udp-modal__form">
                <div className="udp-modal__head">
                  <p className="ds-eyebrow">{t('common.apply', 'Müraciət et')}</p>
                  <h2 id="udp-modal-title" className="ds-h3 udp-modal__title"><AutoTranslate text={uni.name} /></h2>
                  {selectedProgram && (
                    <p className="udp-modal__prog">
                      <strong>İxtisas:</strong> <AutoTranslate text={selectedProgram.name || selectedProgram.title} />
                    </p>
                  )}
                </div>

                <div className="udp-modal__fields">
                  <div className="ds-field">
                    <label className="ds-label" htmlFor="udp-apply-name">{t('portal.studentName', 'Ad və Soyad')} *</label>
                    <input
                      id="udp-apply-name"
                      className="ds-input"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder={t('portal.studentName', 'Ad və Soyad')}
                      value={applyFormData.studentName}
                      onChange={(e) => setApplyFormData({ ...applyFormData, studentName: e.target.value })}
                    />
                  </div>

                  <div className="ds-field">
                    <label className="ds-label" htmlFor="udp-apply-email">{t('auth.email', 'E-poçt ünvanı')} *</label>
                    <input
                      id="udp-apply-email"
                      className="ds-input"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="student@example.com"
                      value={applyFormData.email}
                      onChange={(e) => setApplyFormData({ ...applyFormData, email: e.target.value })}
                    />
                  </div>

                  <div className="udp-modal__row">
                    <div className="ds-field">
                      <label className="ds-label" htmlFor="udp-apply-phone">{t('partnerModal.phone', 'Əlaqə nömrəsi')}</label>
                      <input
                        id="udp-apply-phone"
                        className="ds-input"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+994 50 123 45 67"
                        value={applyFormData.phone}
                        onChange={(e) => setApplyFormData({ ...applyFormData, phone: e.target.value })}
                      />
                    </div>

                    <div className="ds-field">
                      <label className="ds-label" htmlFor="udp-apply-country">{t('portal.originCountry', 'Mənşə ölkə')}</label>
                      <input
                        id="udp-apply-country"
                        className="ds-input"
                        type="text"
                        autoComplete="country-name"
                        placeholder="Azərbaycan"
                        value={applyFormData.originCountry}
                        onChange={(e) => setApplyFormData({ ...applyFormData, originCountry: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="ds-field">
                    <label className="ds-label" htmlFor="udp-apply-notes">{t('partnerModal.message', 'Əlavə qeyd / Mesaj')}</label>
                    <textarea
                      id="udp-apply-notes"
                      className="ds-textarea"
                      rows="3"
                      placeholder={t('pages.universityDetail.notesPlaceholder', 'Universitet və proqram haqqında əlavə qeydləriniz...')}
                      value={applyFormData.notes}
                      onChange={(e) => setApplyFormData({ ...applyFormData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="udp-modal__actions">
                  <button
                    type="button"
                    className="ds-btn ds-btn--ghost"
                    onClick={() => setIsApplyModalOpen(false)}
                  >
                    {t('common.cancel', 'Ləğv et')}
                  </button>
                  <button
                    type="submit"
                    className="ds-btn ds-btn--primary"
                    disabled={isApplying}
                  >
                    {isApplying ? t('profile.saving', 'Göndərilir...') : t('common.apply', 'Müraciəti göndər')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}

export default UniversityDetailPage;
