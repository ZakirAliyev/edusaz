import './index.scss';

const TargetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const BrainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/>
    <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
);

const CapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
);

function HowItWorks() {
  return (
    <section id="how-it-works">
      <div className="hiw-inner">
        <div className="hiw-header">
          <span className="hiw-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3z"/></svg>
            How EDUSAZ Works
          </span>
          <h2 className="hiw-title">
            From profile to shortlist in <span className="hiw-title-colored">3 minutes</span>
          </h2>
        </div>

        <div className="hiw-steps">
          <div className="hiw-step">
            <div className="step-icon-wrapper">
              <div className="step-icon blue"><TargetIcon /></div>
            </div>
            <div className="step-content">
              <span className="step-number">01</span>
              <h3 className="step-title">Tell us about you</h3>
              <p className="step-desc">Share your background, destination preferences, program, budget, and language. Our 7-step intake takes under 3 minutes.</p>
            </div>
          </div>
          
          <div className="hiw-step">
            <div className="step-icon-wrapper">
              <div className="step-icon purple"><BrainIcon /></div>
            </div>
            <div className="step-content">
              <span className="step-number">02</span>
              <h3 className="step-title">AI analyzes everything</h3>
              <p className="step-desc">Cross-references 2,500+ universities, 150,000+ scholarships, visa rules, admission statistics, and career outcomes.</p>
            </div>
          </div>

          <div className="hiw-step">
            <div className="step-icon-wrapper">
              <div className="step-icon indigo"><CapIcon /></div>
            </div>
            <div className="step-content">
              <span className="step-number">03</span>
              <h3 className="step-title">Get your ranked shortlist</h3>
              <p className="step-desc">A personalized list of matching universities with AI match scores, scholarship options, and step-by-step next actions.</p>
            </div>
          </div>
        </div>

        <div className="hiw-action">
          <button className="btn-start">
            Start AI Discovery <ArrowRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
