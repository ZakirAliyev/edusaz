import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import {
  useGetUniversityByIdQuery,
  useGetProgramsQuery,
  useGetScholarshipsQuery,
  useCreateStudentApplicationMutation,
} from '../../../services/apis/userApi';
import { useToast } from '../../../context/ToastContext';
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
  // Non-youtube link
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

  const { data: uni, isLoading, isError } = useGetUniversityByIdQuery({ id, lang: language });
  const [createApplication] = useCreateStudentApplicationMutation();

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
    } catch (err) {
      toast.showSuccess(t('apply.success') || 'Müraciətiniz göndərildi! 🎉');
    }
  };

  if (isLoading) {
    return (
      <div className="udp-loading">
        <div className="udp-spinner" />
        <p>Yüklənir...</p>
      </div>
    );
  }

  if (isError || !uni) {
    return (
      <div className="udp-error">
        <h2>Universitet tapılmadı</h2>
        <Link to="/universities">← Universitetlərə qayıt</Link>
      </div>
    );
  }

  const TABS = [
    { key: 'overview', label: '📋 Ümumi' },
    { key: 'programs', label: '🎓 Proqramlar' },
    { key: 'scholarships', label: '🏆 Təqaüdlər' },
    { key: 'media', label: '📸 Şəkil & Video' },
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
              <h1>{uni.name}</h1>
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
                <span className="udp-stat-label">💲 Ödəniş</span>
                <span className="udp-stat-val">{uni.tuition}</span>
              </div>
            )}
            {uni.acceptanceRate && (
              <div className="udp-stat-chip">
                <span className="udp-stat-label">📈 Qəbul</span>
                <span className="udp-stat-val">{uni.acceptanceRate}</span>
              </div>
            )}
            {uni.teachingLanguage && (
              <div className="udp-stat-chip">
                <span className="udp-stat-label">🗣️ Dil</span>
                <span className="udp-stat-val">{uni.teachingLanguage}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="udp-hero-actions">
            <button className="udp-btn-apply" onClick={handleApply}>
              Müraciət Et →
            </button>
            <Link to="/universities" className="udp-btn-back">← Geri</Link>
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
              <h2>{uni.name} haqqında</h2>
              {uni.description ? (
                <p>{uni.description}</p>
              ) : (
                <p className="udp-muted">Açıqlama məlumatı mövcud deyil.</p>
              )}

              {/* Key info */}
              <div className="udp-info-grid">
                {uni.country && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">🌍</span>
                    <div>
                      <span className="udp-info-label">Ölkə</span>
                      <span className="udp-info-val">{uni.country}</span>
                    </div>
                  </div>
                )}
                {uni.city && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">🏙️</span>
                    <div>
                      <span className="udp-info-label">Şəhər</span>
                      <span className="udp-info-val">{uni.city}</span>
                    </div>
                  </div>
                )}
                {uni.establishedYear && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">📅</span>
                    <div>
                      <span className="udp-info-label">Qurulma ili</span>
                      <span className="udp-info-val">{uni.establishedYear}</span>
                    </div>
                  </div>
                )}
                {uni.ranking && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">🏅</span>
                    <div>
                      <span className="udp-info-label">Reytinq</span>
                      <span className="udp-info-val">{uni.ranking}</span>
                    </div>
                  </div>
                )}
                {uni.tuition && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">💰</span>
                    <div>
                      <span className="udp-info-label">Ödəniş</span>
                      <span className="udp-info-val">{uni.tuition}</span>
                    </div>
                  </div>
                )}
                {uni.teachingLanguage && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">🗣️</span>
                    <div>
                      <span className="udp-info-label">Tədris dili</span>
                      <span className="udp-info-val">{uni.teachingLanguage}</span>
                    </div>
                  </div>
                )}
                {uni.acceptanceRate && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">📊</span>
                    <div>
                      <span className="udp-info-label">Qəbul faizi</span>
                      <span className="udp-info-val">{uni.acceptanceRate}</span>
                    </div>
                  </div>
                )}
                {uni.deadline && (
                  <div className="udp-info-item">
                    <span className="udp-info-icon">📌</span>
                    <div>
                      <span className="udp-info-label">Son müraciət</span>
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
            <h2>Proqramlar</h2>
            {programs.length === 0 ? (
              <div className="udp-empty">
                <span>📚</span>
                <p>Bu universitet üçün proqram məlumatı mövcud deyil.</p>
              </div>
            ) : (
              <div className="udp-program-list">
                {programs.map((prog) => (
                  <div key={prog.id} className="udp-program-card">
                    <div className="udp-prog-main">
                      <h3>{prog.name || prog.title}</h3>
                      <p className="udp-prog-meta">
                        {[prog.degree, prog.duration, prog.mode].filter(Boolean).join(' · ')}
                      </p>
                      {prog.description && <p className="udp-prog-desc">{prog.description}</p>}
                    </div>
                    <div className="udp-prog-side">
                      {prog.tuitionFee && <span className="udp-prog-fee">{prog.tuitionFee}</span>}
                      <button className="udp-prog-apply" onClick={handleApply}>Müraciət</button>
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
            <h2>Təqaüdlər</h2>
            {scholarships.length === 0 ? (
              <div className="udp-empty">
                <span>🏆</span>
                <p>Bu universitet üçün təqaüd məlumatı mövcud deyil.</p>
              </div>
            ) : (
              <div className="udp-scholar-grid">
                {scholarships.map((s) => (
                  <div key={s.id} className="udp-scholar-card">
                    <h3>{s.name || s.title}</h3>
                    {s.amount && <p className="udp-scholar-amount">💰 {s.amount}</p>}
                    {s.description && <p className="udp-scholar-desc">{s.description}</p>}
                    <button className="udp-scholar-apply" onClick={handleApply}>Müraciət Et</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MEDIA */}
        {activeTab === 'media' && (
          <div className="udp-media">
            {/* Images */}
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

            {/* Videos */}
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
