import './index.scss';
import { AiOutlineSearch, AiOutlineBulb } from 'react-icons/ai';
import { Link } from 'react-router-dom';

function AiDiscoveryResultsPage() {
  return (
    <div className="results-page">
      {/* Top Header Section */}
      <section className="results-header-section">
        <div className="results-header-content">
          <div className="ai-label">
            <span className="brain-icon">🧠</span> AI analyzed your profile
          </div>
          <div className="header-title-row">
            <h1>Found <span>23 universities</span> for you</h1>
            <button className="btn-refine">
              <span className="filter-icon">⚙️</span> Refine
            </button>
          </div>
          <p className="summary-text">
            Computer Science · Azerbaijan · Bachelor's · $3k–5k/yr · English
          </p>

          {/* Highlights Row */}
          <div className="highlights-row">
            <div className="highlight-item">
              <div className="hl-icon">🏆</div>
              <div className="hl-text">
                <span className="hl-title">Best Match</span>
                <span className="hl-value">ADA University · 96%</span>
              </div>
            </div>
            <div className="highlight-item">
              <div className="hl-icon">🎓</div>
              <div className="hl-text">
                <span className="hl-title">Scholarships</span>
                <span className="hl-value">12 options available</span>
              </div>
            </div>
            <div className="highlight-item">
              <div className="hl-icon">💰</div>
              <div className="hl-text">
                <span className="hl-title">Under budget</span>
                <span className="hl-value">7 universities fit</span>
              </div>
            </div>
            <div className="highlight-item">
              <div className="hl-icon">🛡️</div>
              <div className="hl-text">
                <span className="hl-title">Visa success rate</span>
                <span className="hl-value">~78% for your profile</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="results-main-section">
        <div className="results-layout">
          
          {/* Left Column - List */}
          <div className="results-list-column">
            
            {/* Filter Pills */}
            <div className="filters-bar">
              <div className="filter-pills">
                <button className="pill active">All Results</button>
                <button className="pill"><span className="emoji">🎓</span> Scholarship</button>
                <button className="pill"><span className="emoji">🇬🇧</span> English-taught</button>
                <button className="pill"><span className="emoji">💚</span> Under $5k</button>
                <button className="pill"><span className="emoji">⭐</span> Highly Ranked</button>
              </div>
              <div className="sort-by">
                <label>Sort:</label>
                <select>
                  <option>AI Match Score</option>
                  <option>Tuition (Low to High)</option>
                  <option>Acceptance Rate</option>
                </select>
              </div>
            </div>

            {/* University Cards */}
            <div className="university-cards-list">
              
              {/* Card 1 */}
              <Link to="/universities/ada" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="uni-card">
                  <div className="uni-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)' }}>
                    <div className="badge-scholarship">🎓 Scholarship</div>
                  </div>
                  <div className="uni-info">
                    <div className="uni-top-row">
                      <div className="match-badge">⭐ 96% Match <span className="rank-num">#1</span></div>
                      <button className="btn-bookmark">🔖</button>
                    </div>
                    <h3>ADA University</h3>
                    <p className="location">Baku, Azerbaijan · #1 in AZ</p>
                    <div className="program-name">Bachelor in Computer Science</div>
                    
                    <div className="uni-stats">
                      <div className="stat">
                        <span className="label">Tuition/yr</span>
                        <span className="val">$6,500/yr</span>
                      </div>
                      <div className="stat">
                        <span className="label">Acceptance</span>
                        <span className="val">42%</span>
                      </div>
                      <div className="stat">
                        <span className="label">Deadline</span>
                        <span className="val">Apr 30, 2025</span>
                      </div>
                    </div>
                    
                    <div className="uni-tags">
                      <span className="tag">English-taught</span>
                      <span className="tag">Scholarship available</span>
                      <span className="tag">Government recognized</span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card 2 */}
              <Link to="/universities/bsu" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="uni-card">
                  <div className="uni-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80)' }}>
                    <div className="badge-scholarship">🎓 Scholarship</div>
                  </div>
                  <div className="uni-info">
                    <div className="uni-top-row">
                      <div className="match-badge green">⭐ 91% Match <span className="rank-num">#2</span></div>
                      <button className="btn-bookmark">🔖</button>
                    </div>
                    <h3>Baku State University</h3>
                    <p className="location">Baku, Azerbaijan · #2 in AZ</p>
                    <div className="program-name">Bachelor in Computer Science</div>
                    
                    <div className="uni-stats">
                      <div className="stat">
                        <span className="label">Tuition/yr</span>
                        <span className="val">$2,800/yr</span>
                      </div>
                      <div className="stat">
                        <span className="label">Acceptance</span>
                        <span className="val">55%</span>
                      </div>
                      <div className="stat">
                        <span className="label">Deadline</span>
                        <span className="val">May 15, 2025</span>
                      </div>
                    </div>
                    
                    <div className="uni-tags">
                      <span className="tag">Most affordable</span>
                      <span className="tag">Large campus</span>
                      <span className="tag">International students</span>
                    </div>
                  </div>
                </div>
              </Link>

            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="results-sidebar">
            
            {/* Profile Card */}
            <div className="sidebar-card profile-card">
              <h3>Your Profile</h3>
              <div className="profile-details">
                <div className="pd-row">
                  <span className="pd-label">From</span>
                  <span className="pd-val">Nigeria 🇳🇬</span>
                </div>
                <div className="pd-row">
                  <span className="pd-label">Destination</span>
                  <span className="pd-val">Azerbaijan 🇦🇿</span>
                </div>
                <div className="pd-row">
                  <span className="pd-label">Program</span>
                  <span className="pd-val">Computer Science</span>
                </div>
                <div className="pd-row">
                  <span className="pd-label">Degree</span>
                  <span className="pd-val">Bachelor's</span>
                </div>
                <div className="pd-row">
                  <span className="pd-label">Budget</span>
                  <span className="pd-val">$3k–5k/yr</span>
                </div>
                <div className="pd-row">
                  <span className="pd-label">Language</span>
                  <span className="pd-val">English</span>
                </div>
              </div>
              <button className="btn-edit-profile">Edit profile</button>
            </div>

            {/* AI Advisor Card */}
            <div className="sidebar-card ai-advisor-card">
              <div className="ai-advisor-header">
                <span className="brain-icon">🧠</span>
                <h3>Ask AI Advisor</h3>
              </div>
              <p>Questions about visas, scholarships, or requirements?</p>
              <div className="ai-input-container">
                <input type="text" placeholder="Ask anything..." />
                <button className="btn-ask-ai">Ask AI</button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

export default AiDiscoveryResultsPage;
