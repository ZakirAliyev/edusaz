import './Step3.scss';

const fields = [
  { id: 'med', name: 'Medicine', category: 'Health Sciences', icon: '🏥' },
  { id: 'den', name: 'Dentistry', category: 'Health Sciences', icon: '🦷' },
  { id: 'cs', name: 'Computer Science', category: 'Technology', icon: '💻' },
  { id: 'ai', name: 'Artificial Intelligence', category: 'Technology', icon: '🤖' },
  { id: 'ba', name: 'Business Administration', category: 'Business', icon: '📊' },
  { id: 'eco', name: 'Economics', category: 'Business', icon: '📈' },
  { id: 'arch', name: 'Architecture', category: 'Design & Art', icon: '🏛️' },
  { id: 'law', name: 'Law', category: 'Humanities', icon: '⚖️' },
  { id: 'eng', name: 'Engineering', category: 'Technology', icon: '⚙️' },
  { id: 'nur', name: 'Nursing', category: 'Health Sciences', icon: '💊' },
  { id: 'psy', name: 'Psychology', category: 'Social Sciences', icon: '🧠' },
  { id: 'des', name: 'Design', category: 'Design & Art', icon: '🎨' },
  { id: 'fin', name: 'Finance', category: 'Business', icon: '💰' },
  { id: 'edu', name: 'Education', category: 'Humanities', icon: '📚' },
  { id: 'phy', name: 'Physics', category: 'Sciences', icon: '⚛️' },
  { id: 'phar', name: 'Pharmacy', category: 'Health Sciences', icon: '🔬' }
];

function Step3({ selection, onSelect }) {
  return (
    <div className="ad-step-container step3-container">
      <div className="ad-step-header">
        <span className="ad-step-subtitle-top">Step 3 of 6</span>
        <h1>What would you like to study?</h1>
        <p className="ad-step-subtitle">Choose your field of study.</p>
      </div>

      <div className="field-grid">
        {fields.map(field => (
          <div 
            key={field.id} 
            className={`ad-option-card field-card ${selection === field.id ? 'selected' : ''}`}
            onClick={() => onSelect(field.id)}
          >
            <div className="field-icon">{field.icon}</div>
            <div className="field-name">{field.name}</div>
            <div className="field-category">{field.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step3;
