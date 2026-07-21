import './Step2.scss';

const destinations = [
  { id: 'aze', name: 'Azerbaijan', flag: '🇦🇿', universities: 48, minPrice: '$1,500', maxPrice: '$8,000', tag: 'Affordable & Growing', image: 'https://images.unsplash.com/photo-1583307584102-402434078da5?auto=format&fit=crop&w=150&q=80' },
  { id: 'tur', name: 'Turkey', flag: '🇹🇷', universities: 186, minPrice: '$2,000', maxPrice: '$10,000', tag: 'Popular Destination', image: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=150&q=80' },
  { id: 'ger', name: 'Germany', flag: '🇩🇪', universities: 300, minPrice: '€0', maxPrice: '€3,500', tag: 'Tuition-Free Options', image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=150&q=80' },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', universities: 165, minPrice: '£9,000', maxPrice: '£38,000', tag: 'World-Class Rankings', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=150&q=80' },
  { id: 'can', name: 'Canada', flag: '🇨🇦', universities: 220, minPrice: '$15,000', maxPrice: '$35,000', tag: 'Post-Study Work Visa', image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=150&q=80' },
  { id: 'mys', name: 'Malaysia', flag: '🇲🇾', universities: 95, minPrice: '$3,000', maxPrice: '$12,000', tag: 'Affordable English', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f0a?auto=format&fit=crop&w=150&q=80' },
  { id: 'pol', name: 'Poland', flag: '🇵🇱', universities: 130, minPrice: '$2,500', maxPrice: '$8,000', tag: 'EU Recognition', image: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?auto=format&fit=crop&w=150&q=80' },
  { id: 'hun', name: 'Hungary', flag: '🇭🇺', universities: 78, minPrice: '$3,000', maxPrice: '$12,000', tag: 'Stipendium Scholarships', image: 'https://images.unsplash.com/photo-1541344983050-4eb62c4a9235?auto=format&fit=crop&w=150&q=80' },
  { id: 'ita', name: 'Italy', flag: '🇮🇹', universities: 99, minPrice: '€1,000', maxPrice: '€18,000', tag: 'Historic Universities', image: 'https://images.unsplash.com/photo-1529260836202-8de012d93e8e?auto=format&fit=crop&w=150&q=80' },
  { id: 'uae', name: 'UAE', flag: '🇦🇪', universities: 67, minPrice: '$8,000', maxPrice: '$25,000', tag: 'Global Business Hub', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=150&q=80' }
];

function Step2({ selection, onSelect }) {
  return (
    <div className="ad-step-container step2-container">
      <div className="ad-step-header">
        <span className="ad-step-subtitle-top">Step 2 of 6</span>
        <h1>Where would you like to study?</h1>
        <p className="ad-step-subtitle">Select a country. You can refine this later in your results.</p>
      </div>

      <div className="destination-grid">
        {destinations.map(dest => (
          <div 
            key={dest.id} 
            className={`ad-option-card destination-card ${selection === dest.id ? 'selected' : ''}`}
            onClick={() => onSelect(dest.id)}
          >
            <div className="dest-image">
              <img src={dest.image} alt={dest.name} />
            </div>
            <div className="dest-info">
              <div className="dest-title">
                <span className="flag">{dest.flag}</span>
                <span className="name">{dest.name}</span>
              </div>
              <div className="dest-stats">
                {dest.universities} universities &middot; {dest.minPrice}-{dest.maxPrice}
              </div>
              <div className="dest-tag">
                {dest.tag}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step2;
