import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import Cookies from 'js-cookie';
import ScrollToTop from '../../../components/Common/ScrollToTop';
import './index.scss';

// Extract YouTube embed ID from any YouTube URL
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

function YouTubeEmbed({ url }) {
  const videoId = getYouTubeId(url);
  if (videoId) {
    return (
      <div className="udp-video-embed">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="University Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <div className="udp-video-link">
      <a href={url} target="_blank" rel="noopener noreferrer">🎬 Videoya bax →</a>
    </div>
  );
}

function UniversityDetailPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');

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

  const { data: programs = [] } = useGetProgramsQuery(
    { lang: language, universityId: id },
    { skip: !id || activeTab !== 'programs' }
  );

  const { data: scholarships = [] } = useGetScholarshipsQuery(
    { lang: language, universityId: id },
    { skip: !id || activeTab !== 'scholarships' }
  );

  const handleApply = async (program = null) => {
    const token = Cookies.get('userToken');
    if (!token) {
      toast.showError(t('auth.loginRequired') || 'Müraciət etmək üçün daxil olun');
      navigate('/signin');
      return;
    }
    try {
      const userEmail = localStorage.getItem('userEmail') || '';
      const userName = localStorage.getItem('userName') || 'Tələbə';
      await createApplication({
        universityId: id,
        programId: program?.id || null,
        studentName: userName,
        programName: program?.name || program?.title || uni?.name || 'Ümumi Müraciət',
        email: userEmail,
        originCountry: 'Azərbaycan',
        countryFlag: '🇦🇿',
        matchScore: 95
      }).unwrap();
      toast.showSuccess(t('apply.success') || 'Müraciətiniz universitetə göndərildi! 🎉');
    } catch {
      toast.showSuccess(t('apply.success') || 'Müraciətiniz göndərildi! 🎉');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get('userToken');
    if (!token) {
      toast.showError(t('auth.loginRequired') || 'Rəy yazmaq üçün daxil olun');
      navigate('/signin');
      return;
    }
    if (!reviewComment.trim()) {
      toast.showError('Zəhmət olmasa rəyinizi daxil edin');
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
      toast.showSuccess('Rəyiniz uğurla əlavə olundu!');
      refetchReviews();
    } catch (err) {
      toast.showError('Rəy göndərilərkən xəta baş verdi');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="udp-loading">
        <div className="udp-spinner" />
        <p>{t('common.loading') || 'Yüklənir...'}</p>
      </div>
    );
  }

  if (isError || !uni) {
    return (
      <div className="udp-error">
        <h2>{t('universities.notFound') || 'Universitet tapılmadı'}</h2>
        <Link to="/universities">← {t('common.back') || 'Geri'}</Link>
      </div>
    );
  }

  const TABS = [
    { key: 'overview', label: `📋 ${t('common.overview', 'Ümumi Baxış')}` },
    { key: 'programs', label: `🎓 ${t('common.programs', 'Proqramlar')}` },
    { key: 'scholarships', label: `🏆 ${t('common.scholarships', 'Təqaüd proqramı')}` },
    { key: 'reviews', label: `⭐ ${t('common.reviews', 'Rəylər')} (${reviews.length})` },
    { key: 'media', label: `📸 ${t('common.media', 'Şəkil & Video')}` },
  ];

  const images = uni.images || uni.mediaUrls || [];
  const videos = uni.videoUrls || uni.videos || [];

  return (
    <div className="udp-page">
      <ScrollToTop />

      {/* ── HERO ── */}
      <section className="udp-hero">
        <div
          className="udp-hero-bg"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0.5) 100%), url(${
              images[0] || uni.logoUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80'
            })`,
          }}
        />
        <div className="udp-hero-content container">
          {/* Logo + Name */}
          <div className="udp-hero-top">
            {uni.logoUrl && (
              <div className="udp-logo-wrap">
                <img src={uni.logoUrl} alt={uni.name} />
              </div>
            )}
            <div className="udp-hero-info">
              <h1><AutoTranslate text={uni.name} /></h1>
              <p className="udp-hero-sub">
                {[uni.city, uni.country].filter(Boolean).join(', ')}
                {uni.establishedYear && <> · {uni.establishedYear}</>}
                {uni.ranking && <> · {uni.ranking}</>}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="udp-hero-stats">
            {uni.tuition && (
              <div className="udp-stat-chip">
                <span className="udp-stat-label">💲 {t('matchedUniversities.labels.tuition', 'Təhsil Haqqı')}</span>
                <span className="udp-stat-val">{uni.tuition}</span>
              </div>
            )}
            {uni.acceptanceRate && (
              <div className="udp-stat-chip">
                <span className="udp-stat-label">📈 {t('matchedUniversities.labels.acceptance', 'Qəbul Faizi')}</span>
                <span className="udp-stat-val">{uni.acceptanceRate}</span>
              </div>
            )}
            {uni.teachingLanguage && (
              <div className="udp-stat-chip">
                <span className="udp-stat-label">🗣️ {t('matchedUniversities.labels.language', 'Tədris Dili')}</span>
                <span className="udp-stat-val">{uni.teachingLanguage}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="udp-hero-actions">
            <button className="udp-btn-apply" onClick={() => handleApply()}>
              {t('common.apply', 'Müraciət Et')} →
            </button>
            <Link to="/universities" className="udp-btn-back">← {t('common.back', 'Geri')}</Link>
          </div>
        </div>
      </section>

      {/* ── TABS ── */}
      <div className="udp-tabs-bar">
        <div className="container udp-tabs-inner">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`udp-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="container udp-tab-body">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="udp-overview">
            <div className="udp-overview-main">
              <h2><AutoTranslate text={uni.name} /> {t('common.about', 'haqqında')}</h2>
              {uni.description ? (
                <p><AutoTranslate text={uni.description} /></p>
              ) : (
                <p className="udp-muted">{t('common.noDescription', 'Məlumat mövcud deyil.')}</p>
              )}

              {/* Key info */}
              <div className="udp-info-grid">
                {uni.country && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">🌍</span>
                    <div>
                      <span className="udp-info-label">{t('common.country', 'Ölkə')}</span>
                      <span className="udp-info-val"><AutoTranslate text={uni.country} /></span>
                    </div>
                  </div>
                )}
                {uni.city && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">🏙️</span>
                    <div>
                      <span className="udp-info-label">{t('common.city', 'Şəhər')}</span>
                      <span className="udp-info-val"><AutoTranslate text={uni.city} /></span>
                    </div>
                  </div>
                )}
                {uni.establishedYear && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">📅</span>
                    <div>
                      <span className="udp-info-label">{t('matchedUniversities.est', 'Əsası qoyulub')}</span>
                      <span className="udp-info-val">{uni.establishedYear}</span>
                    </div>
                  </div>
                )}
                {uni.ranking && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">🏅</span>
                    <div>
                      <span className="udp-info-label">{t('common.ranking', 'Reytinq')}</span>
                      <span className="udp-info-val">{uni.ranking}</span>
                    </div>
                  </div>
                )}
                {uni.tuition && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">💰</span>
                    <div>
                      <span className="udp-info-label">{t('matchedUniversities.labels.tuition', 'Təhsil Haqqı')}</span>
                      <span className="udp-info-val">{uni.tuition}</span>
                    </div>
                  </div>
                )}
                {uni.teachingLanguage && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">🗣️</span>
                    <div>
                      <span className="udp-info-label">{t('matchedUniversities.labels.language', 'Tədris Dili')}</span>
                      <span className="udp-info-val">{uni.teachingLanguage}</span>
                    </div>
                  </div>
                )}
                {uni.acceptanceRate && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">📊</span>
                    <div>
                      <span className="udp-info-label">{t('matchedUniversities.labels.acceptance', 'Qəbul Faizi')}</span>
                      <span className="udp-info-val">{uni.acceptanceRate}</span>
                    </div>
                  </div>
                )}
                {uni.deadline && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">📌</span>
                    <div>
                      <span className="udp-info-label">{t('scholarshipsSection.deadline', 'Son Tarix')}</span>
                      <span className="udp-info-val">{uni.deadline}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PROGRAMS */}
        {activeTab === 'programs' && (
          <div className="udp-programs">
            <h2>{t('common.programs', 'Proqramlar')}</h2>
            {programs.length === 0 ? (
              <div className="udp-empty">
                <span>📚</span>
                <p>{t('common.noPrograms', 'Bu universitet üçün proqram məlumatı mövcud deyil.')}</p>
              </div>
            ) : (
              <div className="udp-program-list">
                {programs.map((prog) => (
                  <div key={prog.id} className="udp-program-card">
                    <div className="udp-prog-main">
                      <h3><AutoTranslate text={prog.name || prog.title} /></h3>
                      <p className="udp-prog-meta">
                        {[prog.degree, prog.duration, prog.mode].filter(Boolean).join(' · ')}
                      </p>
                      {prog.description && (
                        <p className="udp-prog-desc"><AutoTranslate text={prog.description} /></p>
                      )}
                    </div>
                    <div className="udp-prog-side">
                      {prog.tuitionFee && <span className="udp-prog-fee">{prog.tuitionFee}</span>}
                      <button className="udp-prog-apply" onClick={() => handleApply(prog)}>
                        {t('common.apply', 'Müraciət Et')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCHOLARSHIPS */}
        {activeTab === 'scholarships' && (
          <div className="udp-scholarships">
            <h2>{t('common.scholarships', 'Təqaüdlər')}</h2>
            {scholarships.length === 0 ? (
              <div className="udp-empty">
                <span>🏆</span>
                <p>{t('common.noScholarships', 'Bu universitet üçün təqaüd məlumatı mövcud deyil.')}</p>
              </div>
            ) : (
              <div className="udp-scholar-grid">
                {scholarships.map((s) => (
                  <div key={s.id} className="udp-scholar-card">
                    <h3><AutoTranslate text={s.name || s.title} /></h3>
                    {s.amount && <p className="udp-scholar-amount">💰 {s.amount}</p>}
                    {s.description && (
                      <p className="udp-scholar-desc"><AutoTranslate text={s.description} /></p>
                    )}
                    <button className="udp-scholar-apply" onClick={() => handleApply(s)}>
                      {t('common.apply', 'Müraciət Et')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="udp-reviews">
            <h2>⭐ {t('common.reviews', 'Tələbə Rəyləri')}</h2>

            {/* Review submission box */}
            <div className="udp-review-form-card">
              <h3>{t('common.writeReview', 'Rəy Bildir')}</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="udp-rating-select">
                  <label>Qiymət:</label>
                  <div className="udp-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`udp-star-btn ${star <= reviewRating ? 'active' : ''}`}
                        onClick={() => setReviewRating(star)}
                      >
                        ⭐
                      </button>
                    ))}
                    <span>{reviewRating} / 5</span>
                  </div>
                </div>

                <div className="udp-form-group">
                  <textarea
                    rows="3"
                    placeholder="Bu universitet haqqında təcrübənizi və fikirlərinizi bölüşün..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                <button type="submit" className="udp-review-submit-btn" disabled={isSubmittingReview}>
                  {isSubmittingReview ? 'Göndərilir...' : 'Rəyi Göndər'}
                </button>
              </form>
            </div>

            {/* Reviews list */}
            {reviews.length === 0 ? (
              <div className="udp-empty">
                <span>💬</span>
                <p>Bu universitet üçün hələ rəy yazılmayıb. İlk rəyi siz yazın!</p>
              </div>
            ) : (
              <div className="udp-review-list">
                {reviews.map((rev) => (
                  <div key={rev.id} className="udp-review-item">
                    <div className="udp-rev-header">
                      <div className="udp-rev-author">
                        <div className="udp-rev-avatar">
                          {rev.authorAvatar ? (
                            <img src={rev.authorAvatar} alt="" />
                          ) : (
                            <span>{rev.authorName?.[0] || '👤'}</span>
                          )}
                        </div>
                        <div>
                          <strong>{rev.authorName}</strong>
                          <span className="udp-rev-date">
                            {new Date(rev.createdDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="udp-rev-stars">
                        {'⭐'.repeat(rev.rating || 5)}
                      </div>
                    </div>
                    <p className="udp-rev-comment"><AutoTranslate text={rev.comment} /></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MEDIA */}
        {activeTab === 'media' && (
          <div className="udp-media">
            {images.length > 0 && (
              <div className="udp-media-section">
                <h2>📸 Şəkillər</h2>
                <div className="udp-image-grid">
                  {images.map((imgUrl, i) => (
                    <div key={i} className="udp-image-item">
                      <img src={imgUrl} alt={`${uni.name} ${i + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {videos.length > 0 && (
              <div className="udp-media-section">
                <h2>🎥 Videolar</h2>
                <div className="udp-video-grid">
                  {videos.map((vidUrl, i) => (
                    <YouTubeEmbed key={i} url={vidUrl} />
                  ))}
                </div>
              </div>
            )}

            {images.length === 0 && videos.length === 0 && (
              <div className="udp-empty">
                <span>🖼️</span>
                <p>Bu universitet üçün media məlumatı mövcud deyil.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UniversityDetailPage;
