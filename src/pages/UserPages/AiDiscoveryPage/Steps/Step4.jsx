import './Step4.scss';

const levels = [
  { id: 'bachelor', name: "Bachelor's", duration: '3-4 years', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  )},
  { id: 'master', name: "Master's", duration: '1-2 years', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  )},
  { id: 'phd', name: "PhD", duration: '3-5 years', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 2.5 2.5 0 0 1-.3-4.36 2.5 2.5 0 0 1 1.09-4.38 2.5 2.5 0 0 1 2.54-5.68A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 2.5 2.5 0 0 0 .3-4.36 2.5 2.5 0 0 0-1.09-4.38 2.5 2.5 0 0 0-2.54-5.68A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  )},
  { id: 'language', name: "Language School", duration: '3-12 months', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 8 6 6"/>
      <path d="m4 14 6-6 2-3"/>
      <path d="M2 5h12"/>
      <path d="M7 2h1"/>
      <path d="m22 22-5-10-5 10"/>
      <path d="M14 18h6"/>
    </svg>
  )},
  { id: 'foundation', name: "Foundation", duration: '1 year', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  )},
  { id: 'exchange', name: "Exchange Program", duration: '1 semester', icon: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" x2="22" y1="12" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )}
];

function Step4({ selection, onSelect }) {
  return (
    <div className="ad-step-container step4-container">
      <div className="ad-step-header">
        <span className="ad-step-subtitle-top">Step 4 of 6</span>
        <h1>Education level?</h1>
        <p className="ad-step-subtitle">Select your intended degree level.</p>
      </div>

      <div className="level-grid">
        {levels.map(level => (
          <div 
            key={level.id} 
            className={`ad-option-card level-card ${selection === level.id ? 'selected' : ''}`}
            onClick={() => onSelect(level.id)}
          >
            <div className="level-icon-wrapper">
              {level.icon}
            </div>
            <div className="level-info">
              <div className="level-name">{level.name}</div>
              <div className="level-duration">{level.duration}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step4;
