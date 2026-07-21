import './Step6.scss';

const languages = [
  { name: 'English', flag: '🇬🇧' },
  { name: 'Turkish', flag: '🇹🇷' },
  { name: 'Russian', flag: '🇷🇺' },
  { name: 'German', flag: '🇩🇪' },
  { name: 'French', flag: '🇫🇷' },
  { name: 'Arabic', flag: '🇸🇦' },
  { name: 'Azerbaijani', flag: '🇦🇿' },
  { name: 'Any language', flag: '🌐' }
];

function Step6({ selection, onSelect }) {
  return (
    <div className="ad-step-container step6-container">
      <div className="ad-step-header">
        <span className="ad-step-subtitle-top">Step 6 of 6</span>
        <h1>Preferred instruction language?</h1>
        <p className="ad-step-subtitle">Select the language you are comfortable studying in.</p>
      </div>

      <div className="language-grid">
        {languages.map(lang => (
          <div 
            key={lang.name} 
            className={`ad-option-card language-card ${selection === lang.name ? 'selected' : ''}`}
            onClick={() => onSelect(lang.name)}
          >
            <span className="flag">{lang.flag}</span>
            <span className="name">{lang.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step6;
