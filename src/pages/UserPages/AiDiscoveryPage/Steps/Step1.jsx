import './Step1.scss';

const countries = [
  { name: 'Azerbaijan', flag: '🇦🇿' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'Pakistan', flag: '🇵🇰' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Egypt', flag: '🇪🇬' },
  { name: 'Kenya', flag: '🇰🇪' },
  { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Kazakhstan', flag: '🇰🇿' },
  { name: 'Bangladesh', flag: '🇧🇩' },
  { name: 'Ethiopia', flag: '🇪🇹' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Philippines', flag: '🇵🇭' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Colombia', flag: '🇨🇴' },
  { name: 'Vietnam', flag: '🇻🇳' },
  { name: 'Sri Lanka', flag: '🇱🇰' },
  { name: 'Nepal', flag: '🇳🇵' },
  { name: 'Uzbekistan', flag: '🇺🇿' },
  { name: 'Tanzania', flag: '🇹🇿' },
  { name: 'Uganda', flag: '🇺🇬' },
  { name: 'Jordan', flag: '🇯🇴' },
  { name: 'Cameroon', flag: '🇨🇲' }
];

function Step1({ selection, onSelect }) {
  return (
    <div className="ad-step-container step1-container">
      <div className="ad-step-header">
        <span className="ad-step-subtitle-top">Step 1 of 6</span>
        <h1>Which country are you from?</h1>
        <p className="ad-step-subtitle">This helps us find scholarships and visa routes available to your nationality.</p>
      </div>

      <div className="country-grid">
        {countries.map(country => (
          <div 
            key={country.name} 
            className={`ad-option-card country-card ${selection === country.name ? 'selected' : ''}`}
            onClick={() => onSelect(country.name)}
          >
            <span className="flag">{country.flag}</span>
            <span className="name">{country.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step1;
