import { Link } from 'react-router-dom';
import './index.scss';

const BuildingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4"/>
    <path d="M8 6h.01"/>
    <path d="M16 6h.01"/>
    <path d="M12 6h.01"/>
    <path d="M12 10h.01"/>
    <path d="M12 14h.01"/>
    <path d="M16 10h.01"/>
    <path d="M16 14h.01"/>
    <path d="M8 10h.01"/>
    <path d="M8 14h.01"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const GlobeOutlineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const RibbonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.4 12.8 19 22l-7-3-7 3 3.6-9.2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7A5CFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

function ForUniversitiesPage() {
  return (
    <div className="for-universities-page">
      {/* Hero Section */}
      <section className="fu-hero">
        <div className="container">
          <div className="fu-hero-content">
            <span className="fu-badge">
              <BuildingIcon />
              For Universities
            </span>
            <h1 className="fu-title">
              Recruit global students <br />
              with <span className="fu-highlight">AI precision</span>
            </h1>
            <p className="fu-desc">
              Join 180+ universities using EDUSAZ to reach pre-qualified international students. Verified profiles, AI-powered matching, and real-time recruitment analytics.
            </p>
            <div className="fu-actions">
              <Link to="/register" className="btn-primary">
                Create University Profile <span>&rarr;</span>
              </Link>
              <button className="btn-secondary">
                <PlayIcon /> Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="fu-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon"><UsersIcon /></div>
              <h3>500K+</h3>
              <p>Active students on platform</p>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><GlobeOutlineIcon /></div>
              <h3>35+</h3>
              <p>Student source countries</p>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><TargetIcon /></div>
              <h3>12K+</h3>
              <p>Monthly qualified leads</p>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><RibbonIcon /></div>
              <h3>94%</h3>
              <p>Lead quality score</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="fu-pricing">
        <div className="container">
          <div className="pricing-header">
            <span className="pricing-badge">University Products</span>
            <h2>Choose your recruitment <span className="pricing-highlight">strategy</span></h2>
          </div>

          <div className="pricing-cards">
            {/* Verified Profile */}
            <div className="price-card">
              <div className="pc-header">
                <h3>Verified Profile</h3>
                <p>Get found by qualified students</p>
              </div>
              <div className="pc-price">
                <h2>$299<span>/mo</span></h2>
              </div>
              <button className="btn-outline">Get Started</button>
              <ul className="pc-features">
                <li><CheckIcon /> Official verified badge</li>
                <li><CheckIcon /> Basic university profile</li>
                <li><CheckIcon /> Appear in AI search results</li>
                <li><CheckIcon /> Student inquiries inbox</li>
                <li><CheckIcon /> Monthly analytics report</li>
              </ul>
            </div>

            {/* Premium */}
            <div className="price-card premium">
              <div className="popular-badge">Most Popular</div>
              <div className="pc-header">
                <h3>Premium</h3>
                <p>Maximize your visibility</p>
              </div>
              <div className="pc-price">
                <h2>$799<span>/mo</span></h2>
              </div>
              <button className="btn-solid">Get Started</button>
              <ul className="pc-features">
                <li><CheckIcon /> Everything in Verified</li>
                <li><CheckIcon /> Featured placement in results</li>
                <li><CheckIcon /> AI recommendation priority</li>
                <li><CheckIcon /> Sponsored programs (3)</li>
                <li><CheckIcon /> Full analytics dashboard</li>
                <li><CheckIcon /> Lead generation tools</li>
                <li><CheckIcon /> Video & virtual tour hosting</li>
              </ul>
            </div>

            {/* Custom */}
            <div className="price-card">
              <div className="pc-header">
                <h3>Enterprise</h3>
                <p>Full recruitment partnership</p>
              </div>
              <div className="pc-price">
                <h2>Custom</h2>
              </div>
              <button className="btn-outline">Contact Sales</button>
              <ul className="pc-features">
                <li><CheckIcon /> Everything in Premium</li>
                <li><CheckIcon /> Unlimited sponsored programs</li>
                <li><CheckIcon /> Dedicated account manager</li>
                <li><CheckIcon /> Custom recruitment campaigns</li>
                <li><CheckIcon /> White-label student portal</li>
                <li><CheckIcon /> API integration</li>
                <li><CheckIcon /> Priority support & SLA</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ForUniversitiesPage;
