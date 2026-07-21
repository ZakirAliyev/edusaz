import './index.scss';

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const TrendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const features = [
  {
    icon: <ShieldIcon />,
    title: "Verified University Profile",
    desc: "Official badge, rankings, accreditations displayed prominently to students"
  },
  {
    icon: <TrendIcon />,
    title: "Premium Visibility & AI Priority",
    desc: "Appear first in AI recommendations and search results for matched students"
  },
  {
    icon: <TargetIcon />,
    title: "Pre-Qualified Lead Generation",
    desc: "Connect with students who match your programs, requirements, and budget range"
  },
  {
    icon: <BarChartIcon />,
    title: "Recruitment Analytics Dashboard",
    desc: "Track views, inquiries, applications, and enrollment conversions in real-time"
  }
];

function ForUniversities() {
  return (
    <section id="for-universities">
      <div className="fu-inner">
        <div className="fu-content">
          <div className="fu-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10v12" />
              <path d="M20 10v12" />
              <path d="M4 10l8-8 8 8" />
              <path d="M12 22v-8" />
            </svg>
            For Universities
          </div>
          
          <h2 className="fu-title">
            Recruit 500,000+ global students <br />
            <span className="fu-title-colored">with AI precision</span>
          </h2>
          
          <p className="fu-subtitle">
            Join 180+ universities using EDUSAZ to reach pre-qualified international students. 
            Verified profile, premium visibility, AI matching, and detailed analytics.
          </p>

          <div className="fu-stats">
            <div className="fu-stat-card">
              <h3>12K+</h3>
              <p>Monthly leads</p>
            </div>
            <div className="fu-stat-card">
              <h3>94%</h3>
              <p>Lead quality score</p>
            </div>
            <div className="fu-stat-card">
              <h3>35+</h3>
              <p>Source countries</p>
            </div>
            <div className="fu-stat-card">
              <h3>180+</h3>
              <p>Partner universities</p>
            </div>
          </div>
        </div>

        <div className="fu-features">
          <div className="features-list">
            {features.map((feature, idx) => (
              <div className="feature-item" key={idx}>
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <div className="feature-text">
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="btn-partner">
            Partner with EDUSAZ <ArrowRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

export default ForUniversities;
