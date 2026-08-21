import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../context/LanguageContext';
import { useGetUniversitiesQuery } from '../../../services/apis/userApi';
import './index.scss';

function UniversityDetailPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  
  const { data: universities = [], isLoading } = useGetUniversitiesQuery(language);
  
  // Find matching university by ID or fallback to first backend item
  const uni = universities.find(u => String(u.id).toLowerCase() === String(id).toLowerCase()) || universities[0] || {
    name: 'ADA University',
    country: 'Azerbaijan',
    city: 'Baku',
    establishedYear: 2006,
    ranking: '#1 in AZ',
    logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
    tuition: '$6,500/yr',
    acceptanceRate: '42%',
    teachingLanguage: 'English',
    deadline: 'Apr 30, 2025',
    description: 'Leading university offering accredited international programs.'
  };

  const tabs = ['Overview', 'Programs', 'Scholarships', 'Admissions', 'Campus', 'Reviews'];

  if (isLoading) {
    return <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Loading university details from backend...</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="tab-overview">
            <div className="overview-main">
              <h2>About {uni.name}</h2>
              <p>{uni.description || `Leading higher education institution located in ${uni.city || uni.country}.`}</p>

              <div className="chart-container">
                <div className="chart-header">
                  <h3>International Student Growth</h3>
                </div>
                <div className="chart-body">
                  <div className="chart-line-bg">
                    <svg viewBox="0 0 800 200" width="100%" height="200" preserveAspectRatio="none">
                      <path d="M0,150 Q400,100 800,20" fill="none" stroke="#9f8aff" strokeWidth="3" />
                      <path d="M0,150 Q400,100 800,20 L800,200 L0,200 Z" fill="rgba(159,138,255,0.1)" />
                    </svg>
                  </div>
                  <div className="chart-labels-y">
                    <span>1600</span><span>1200</span><span>800</span><span>400</span><span>0</span>
                  </div>
                  <div className="chart-labels-x">
                    <span>2020</span><span>2021</span><span>2022</span><span>2023</span><span>2024</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="overview-sidebar">
              <div className="sidebar-card deadline-card">
                <p>Application Deadline</p>
                <h2>{uni.deadline || 'Apr 30, 2025'}</h2>
                <button className="btn-apply-now">Apply Now &rarr;</button>
                <span className="free-apply-text">Free to apply via EDUSAZ</span>
              </div>

              <div className="sidebar-card key-info-card">
                <h3>Key Information</h3>
                <ul>
                  <li><span>Annual Tuition</span> <span>{uni.tuition || '$6,500/yr'}</span></li>
                  <li><span>Acceptance Rate</span> <span>{uni.acceptanceRate || '42%'}</span></li>
                  <li><span>Language</span> <span>{uni.teachingLanguage || 'English'}</span></li>
                  <li><span>Established</span> <span>{uni.establishedYear}</span></li>
                  <li><span>Ranking</span> <span>{uni.ranking || 'Top Regional'}</span></li>
                </ul>
              </div>
            </div>
          </div>
        );
      
      case 'Programs':
        return (
          <div className="tab-dummy-content">
            <h2>Programs offered at {uni.name}</h2>
            <div className="programs-list">
              <div className="program-item">
                <div className="p-main">
                  <h3>Bachelor in Computer Science</h3>
                  <p>4 years &bull; Full-time &bull; On Campus</p>
                </div>
                <div className="p-side">
                  <span className="p-tuition">{uni.tuition || '$6,500/yr'}</span>
                  <button className="btn-apply-sm">Apply</button>
                </div>
              </div>
              <div className="program-item">
                <div className="p-main">
                  <h3>Bachelor in Business Administration</h3>
                  <p>4 years &bull; Full-time &bull; On Campus</p>
                </div>
                <div className="p-side">
                  <span className="p-tuition">{uni.tuition || '$6,500/yr'}</span>
                  <button className="btn-apply-sm">Apply</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Campus':
        return (
          <div className="tab-campus-content">
            <h2>Campus & Facilities of {uni.name}</h2>
            
            {/* Gallery Images */}
            {uni.images && uni.images.length > 0 ? (
              <div className="campus-gallery-section" style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '18px', color: '#38bdf8', marginBottom: '14px' }}>📸 Campus Photo Gallery</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {uni.images.map((imgUrl, i) => (
                    <div key={i} style={{ height: '160px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={imgUrl} alt={`Campus ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Video Links */}
            {uni.videoUrls && uni.videoUrls.length > 0 ? (
              <div className="campus-videos-section" style={{ marginTop: '30px' }}>
                <h3 style={{ fontSize: '18px', color: '#f43f5e', marginBottom: '14px' }}>🎥 Promo & Tour Videos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {uni.videoUrls.map((vidUrl, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                      <span style={{ color: '#e2e8f0', fontSize: '14px' }}>🎬 {vidUrl}</span>
                      <a href={vidUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none', background: 'rgba(56,189,248,0.15)', padding: '6px 14px', borderRadius: '8px' }}>
                        ↗️ Watch Video
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {(!uni.images || uni.images.length === 0) && (!uni.videoUrls || uni.videoUrls.length === 0) ? (
              <p style={{ color: '#94a3b8', marginTop: '14px' }}>Modern campus located in {uni.city || uni.country} with world-class facilities and student amenities.</p>
            ) : null}
          </div>
        );

      default:
        return (
          <div className="tab-dummy-content">
            <h2>{activeTab} for {uni.name}</h2>
            <p>Information loaded live from EDUSAZ Backend API.</p>
          </div>
        );
    }
  };

  return (
    <div className="university-detail-page">
      {/* Hero Section */}
      <section 
        className="uni-hero" 
        style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%), url(${uni.logoUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80"})` }}
      >
        <div className="uni-hero-content">
          <div className="badges">
            <span className="badge-verified">🛡️ Verified Partner</span>
            <span className="badge-match">✨ 96% Match</span>
          </div>
          <h1>{uni.name}</h1>
          <p className="subtitle">
            {uni.city ? `${uni.city}, ${uni.country}` : uni.country} &bull; Founded {uni.establishedYear} &bull; {uni.ranking || 'Accredited'}
          </p>
          
          <div className="hero-actions">
            <button className="btn-save">🔖 Save</button>
            <button className="btn-apply-primary">Apply Now &rarr;</button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="uni-stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <span className="s-icon">📈</span>
            <div className="s-text">
              <span className="s-label">Acceptance</span>
              <span className="s-val">{uni.acceptanceRate || '42%'}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="s-icon">💲</span>
            <div className="s-text">
              <span className="s-label">Tuition/yr</span>
              <span className="s-val">{uni.tuition || '$6,500/yr'}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="s-icon">🗣️</span>
            <div className="s-text">
              <span className="s-label">Language</span>
              <span className="s-val">{uni.teachingLanguage || 'English'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="uni-tabs-container">
        <div className="uni-tabs">
          {tabs.map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Tab Content */}
      <section className="uni-tab-content-section">
        {renderTabContent()}
      </section>
    </div>
  );
}

export default UniversityDetailPage;


