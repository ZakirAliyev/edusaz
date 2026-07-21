import './Step5.scss';

const budgets = [
  { id: 'under3k', range: 'Under $3,000/yr', desc: 'Very affordable options available', color: '#22c55e', icon: '💚' },
  { id: '3k-5k', range: '$3,000 - $5,000/yr', desc: 'Budget-friendly, many scholarships', color: '#eab308', icon: '💛' },
  { id: '5k-10k', range: '$5,000 - $10,000/yr', desc: 'Mid-range, strong university options', color: '#f97316', icon: '🟠' },
  { id: '10k-20k', range: '$10,000 - $20,000/yr', desc: 'Above average, premium programs', color: '#3b82f6', icon: '🔵' },
  { id: '20k+', range: '$20,000+/yr', desc: 'Premium global universities', color: '#a855f7', icon: '🟣' },
  { id: 'scholarship', range: 'Scholarship required', desc: 'Need full or near-full funding', color: '#1e293b', icon: '🎓' }
];

function Step5({ selection, onSelect }) {
  return (
    <div className="ad-step-container step5-container">
      <div className="ad-step-header">
        <span className="ad-step-subtitle-top">Step 5 of 6</span>
        <h1>What is your annual budget?</h1>
        <p className="ad-step-subtitle">Tuition only. We will estimate living costs separately.</p>
      </div>

      <div className="budget-grid">
        {budgets.map(budget => (
          <div 
            key={budget.id} 
            className={`ad-option-card budget-card ${selection === budget.id ? 'selected' : ''}`}
            onClick={() => onSelect(budget.id)}
          >
            <div className="budget-icon">
              {budget.icon}
            </div>
            <div className="budget-info">
              <div className="budget-range">{budget.range}</div>
              <div className="budget-desc">{budget.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step5;
