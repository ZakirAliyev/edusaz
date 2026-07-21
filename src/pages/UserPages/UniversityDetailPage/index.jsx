import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './index.scss';

// Mock University Data
const uniData = {
  ada: {
    name: 'ADA University',
    location: 'Baku, Azerbaijan',
    founded: '2006',
    rank: '#1 in AZ',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
    match: '96%',
    verified: true,
    stats: {
      students: '4,200',
      acceptance: '42%',
      tuition: '$6,500/yr',
      scholarship: 'Up to 100%',
      language: 'English'
    },
    about: 'ADA University is Azerbaijan’s leading higher education institution, offering internationally accredited programs with strong industry connections and a diverse international community. With a focus on applied sciences and business, ADA University has established itself as a gateway for international students to access quality education while benefiting from Azerbaijan’s growing economy and strategic location between Europe and Asia.',
    features: [
      { icon: '🏅', title: 'Internationally accredited', desc: 'ACBSP and FIBAA accreditations' },
      { icon: '🌐', title: 'Multicultural campus', desc: 'Students from 60+ countries' },
      { icon: '💼', title: 'Career placement', desc: '92% employment within 6 months' },
      { icon: '💲', title: 'Affordable tuition', desc: 'Lowest fees in the region' }
    ],
    deadline: 'Apr 30, 2025'
  },
  bsu: {
    name: 'Baku State University',
    location: 'Baku, Azerbaijan',
    founded: '1919',
    rank: '#2 in AZ',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80',
    match: '91%',
    verified: true,
    stats: {
      students: '22,000',
      acceptance: '55%',
      tuition: '$2,800/yr',
      scholarship: 'Merit-based',
      language: 'Azerbaijani, English'
    },
    about: 'Baku State University is one of the oldest and most prestigious universities in Azerbaijan, offering a wide range of programs in sciences and humanities.',
    features: [
      { icon: '🏛️', title: 'Historic Institution', desc: 'Founded in 1919' },
      { icon: '📚', title: 'Extensive Library', desc: 'Over 2.5 million books' },
      { icon: '🔬', title: 'Research Focused', desc: 'Numerous research centers' },
      { icon: '💲', title: 'Affordable tuition', desc: 'Cost-effective education' }
    ],
    deadline: 'May 15, 2025'
  }
};

function UniversityDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Default to ADA if not found
  const uni = uniData[id] || uniData['ada'];

  const tabs = ['Overview', 'Programs', 'Scholarships', 'Admissions', 'Campus', 'Reviews'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="tab-overview">
            <div className="overview-main">
              <h2>About {uni.name}</h2>
              <p>{uni.about}</p>

              {/* Chart Placeholder */}
              <div className="chart-container">
                <div className="chart-header">
                  <h3>International Student Growth</h3>
                </div>
                <div className="chart-body">
                  <div className="chart-line-bg">
                    {/* Simplified SVG line chart mimicking the screenshot */}
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

              {/* Features Grid */}
              <div className="features-grid">
                {uni.features.map((f, i) => (
                  <div key={i} className="feature-card">
                    <span className="f-icon">{f.icon}</span>
                    <div className="f-text">
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="overview-sidebar">
              {/* Deadline Card */}
              <div className="sidebar-card deadline-card">
                <p>Application Deadline</p>
                <h2>{uni.deadline}</h2>
                <button className="btn-apply-now">Apply Now &rarr;</button>
                <span className="free-apply-text">Free to apply via EDUSAZ</span>
              </div>

              {/* Key Info Card */}
              <div className="sidebar-card key-info-card">
                <h3>Key Information</h3>
                <ul>
                  <li><span>Annual Tuition</span> <span>{uni.stats.tuition}</span></li>
                  <li><span>Acceptance Rate</span> <span>{uni.stats.acceptance}</span></li>
                  <li><span>Language</span> <span>{uni.stats.language}</span></li>
                  <li><span>Scholarship</span> <span>{uni.stats.scholarship}</span></li>
                  <li><span>Total Students</span> <span>{uni.stats.students}</span></li>
                  <li><span>Ranking</span> <span>{uni.rank}</span></li>
                </ul>
              </div>

              {/* Scholarship Card */}
              <div className="sidebar-card scholarship-card">
                <span className="badge-icon">🎗️</span>
                <h3>Scholarship Available</h3>
                <p>Up to 100% — merit and need-based for international students.</p>
                <button className="btn-check-eligibility">Check Eligibility</button>
              </div>

              {/* Similar Unis */}
              <div className="sidebar-card similar-unis-card">
                <h3>Similar Universities</h3>
                <div className="similar-list">
                  <Link to="/universities/bsu" className="similar-item">
                    <img src={uniData.bsu.image} alt="BSU" />
                    <div className="si-info">
                      <h4>{uniData.bsu.name}</h4>
                      <p>{uniData.bsu.stats.tuition} &bull; {uniData.bsu.match} match</p>
                    </div>
                  </Link>
                  <div className="similar-item">
                    <img src="https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=100&q=80" alt="ITU" />
                    <div className="si-info">
                      <h4>Istanbul Technical Uni</h4>
                      <p>$3,200/yr &bull; 88% match</p>
                    </div>
                  </div>
                  <div className="similar-item">
                    <img src="https://images.unsplash.com/photo-1519658253479-79a6d71317d7?auto=format&fit=crop&w=100&q=80" alt="Warsaw" />
                    <div className="si-info">
                      <h4>University of Warsaw</h4>
                      <p>$2,500/yr &bull; 84% match</p>
                    </div>
                  </div>
                </div>
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
                  <span className="p-tuition">{uni.stats.tuition}</span>
                  <button className="btn-apply-sm">Apply</button>
                </div>
              </div>
              <div className="program-item">
                <div className="p-main">
                  <h3>Bachelor in Business Administration</h3>
                  <p>4 years &bull; Full-time &bull; On Campus</p>
                </div>
                <div className="p-side">
                  <span className="p-tuition">{uni.stats.tuition}</span>
                  <button className="btn-apply-sm">Apply</button>
                </div>
              </div>
              <div className="program-item">
                <div className="p-main">
                  <h3>Master of Data Science</h3>
                  <p>2 years &bull; Full-time &bull; On Campus</p>
                </div>
                <div className="p-side">
                  <span className="p-tuition">$8,000/yr</span>
                  <button className="btn-apply-sm">Apply</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Scholarships':
        return (
          <div className="tab-dummy-content">
            <h2>Scholarships at {uni.name}</h2>
            <p>International students are eligible for various merit-based and need-based scholarships.</p>
            <div className="scholarship-list">
              <div className="s-card">
                <h3>Global Excellence Scholarship</h3>
                <p>Covers 100% of tuition fees for students with outstanding academic records.</p>
                <span>Deadline: March 1st</span>
              </div>
              <div className="s-card">
                <h3>Regional Award</h3>
                <p>Provides a 50% tuition waiver for students from specific developing regions.</p>
                <span>Deadline: {uni.deadline}</span>
              </div>
            </div>
          </div>
        );

      case 'Admissions':
        return (
          <div className="tab-dummy-content">
            <h2>Admission Requirements</h2>
            <ul>
              <li>Completed online application form</li>
              <li>High school diploma or equivalent (translated into English)</li>
              <li>English proficiency test scores (IELTS 6.0+ or TOEFL 75+)</li>
              <li>Motivation letter and 2 recommendation letters</li>
              <li>Passport copy</li>
            </ul>
            <button className="btn-apply-now" style={{ marginTop: '20px', width: 'auto' }}>Start Application</button>
          </div>
        );

      case 'Campus':
        return (
          <div className="tab-dummy-content">
            <h2>Campus Life</h2>
            <p>Located in the heart of {uni.location}, the campus offers state-of-the-art facilities, modern libraries, and student dormitories.</p>
            <div className="campus-gallery" style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
              <img src={uni.image} alt="Campus" style={{ width: '200px', borderRadius: '12px', objectFit: 'cover' }} />
              <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=200&q=80" alt="Campus 2" style={{ width: '200px', borderRadius: '12px', objectFit: 'cover' }} />
            </div>
          </div>
        );

      case 'Reviews':
        return (
          <div className="tab-dummy-content">
            <h2>Student Reviews</h2>
            <div className="review-card">
              <div className="r-stars">⭐⭐⭐⭐⭐</div>
              <p>"Great international community and supportive professors. The campus is beautiful!"</p>
              <span>- Ahmed from Egypt, Computer Science</span>
            </div>
            <div className="review-card" style={{ marginTop: '16px' }}>
              <div className="r-stars">⭐⭐⭐⭐</div>
              <p>"Very good programs, though the workload is quite heavy in the first year."</p>
              <span>- Sarah from UK, Business</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="university-detail-page">
      {/* Hero Section */}
      <section 
        className="uni-hero" 
        style={{ backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%), url(${uni.image})` }}
      >
        <div className="uni-hero-content">
          <div className="badges">
            {uni.verified && <span className="badge-verified">🛡️ Verified Partner</span>}
            <span className="badge-match">✨ {uni.match} Match</span>
          </div>
          <h1>{uni.name}</h1>
          <p className="subtitle">
            <span className="flag">🇦🇿</span> {uni.location} &bull; Founded {uni.founded} &bull; {uni.rank}
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
            <span className="s-icon">👥</span>
            <div className="s-text">
              <span className="s-label">Students</span>
              <span className="s-val">{uni.stats.students}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="s-icon">📈</span>
            <div className="s-text">
              <span className="s-label">Acceptance</span>
              <span className="s-val">{uni.stats.acceptance}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="s-icon">💲</span>
            <div className="s-text">
              <span className="s-label">Tuition/yr</span>
              <span className="s-val">{uni.stats.tuition}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="s-icon">🎗️</span>
            <div className="s-text">
              <span className="s-label">Scholarship</span>
              <span className="s-val">{uni.stats.scholarship}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="s-icon">🗣️</span>
            <div className="s-text">
              <span className="s-label">Language</span>
              <span className="s-val">{uni.stats.language}</span>
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
