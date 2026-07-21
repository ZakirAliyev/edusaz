import { Link } from 'react-router-dom';
import './index.scss';

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const destinations = [
  { id: 'az', name: 'Azerbaijan', count: 48, cost: '$1,500-$8,000/yr', label: 'Affordable & Growing', img: 'https://images.unsplash.com/photo-1600122553956-618d3615291f?auto=format&fit=crop&w=400&q=80', flag: '🇦🇿' },
  { id: 'tr', name: 'Turkey', count: 186, cost: '$2,000-$10,000/yr', label: 'Popular Destination', img: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=400&q=80', flag: '🇹🇷' },
  { id: 'de', name: 'Germany', count: 300, cost: '€0-€3,500/yr', label: 'Tuition-Free Options', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dc2b?auto=format&fit=crop&w=400&q=80', flag: '🇩🇪' },
  { id: 'uk', name: 'United Kingdom', count: 165, cost: '£9,000-£38,000/yr', label: 'World-Class Rankings', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80', flag: '🇬🇧' },
  { id: 'ca', name: 'Canada', count: 220, cost: '$15,000-$35,000/yr', label: 'Post-Study Work Visa', img: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=400&q=80', flag: '🇨🇦' },
  { id: 'my', name: 'Malaysia', count: 95, cost: '$3,000-$12,000/yr', label: 'Affordable English', img: 'https://images.unsplash.com/photo-1596422846543-74c6eb24f628?auto=format&fit=crop&w=400&q=80', flag: '🇲🇾' },
  { id: 'pl', name: 'Poland', count: 130, cost: '$2,500-$8,000/yr', label: 'EU Recognition', img: 'https://images.unsplash.com/photo-1519658253479-79a6d71317d7?auto=format&fit=crop&w=400&q=80', flag: '🇵🇱' },
  { id: 'hu', name: 'Hungary', count: 78, cost: '$3,000-$12,000/yr', label: 'Stipendium Scholarships', img: 'https://images.unsplash.com/photo-1569972394105-89104f762744?auto=format&fit=crop&w=400&q=80', flag: '🇭🇺' },
  { id: 'it', name: 'Italy', count: 99, cost: '€1,000-€18,000/yr', label: 'Historic Universities', img: 'https://images.unsplash.com/photo-1515542622106-78b28af7815d?auto=format&fit=crop&w=400&q=80', flag: '🇮🇹' },
  { id: 'ae', name: 'UAE', count: 67, cost: '$8,000-$25,000/yr', label: 'Global Business Hub', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80', flag: '🇦🇪' },
];

function DestinationsPage() {
  return (
    <div className="destinations-page">
      <div className="dp-header">
        <span className="dp-badge">
          <GlobeIcon />
          Study Destinations
        </span>
        <h1 className="dp-title">
          Explore study destinations <span className="dp-title-highlight">worldwide</span>
        </h1>
        <p className="dp-subtitle">
          Compare countries by cost, quality, visa ease, and career opportunities.
        </p>
      </div>

      <div className="dp-grid-wrapper">
        <div className="dp-grid">
          {destinations.map(dest => (
            <div key={dest.id} className="dp-card">
              <div className="dp-card-img-container">
                <img src={dest.img} alt={dest.name} className="dp-card-img" />
              </div>
              <div className="dp-card-content">
                <div className="dp-card-header">
                  <div className="dp-country">
                    <span className="dp-flag">{dest.flag}</span>
                  </div>
                  <span className="dp-label">{dest.label}</span>
                </div>
                <h3 className="dp-name">{dest.name}</h3>
                <p className="dp-stats">
                  {dest.count} universities &bull; {dest.cost}
                </p>
                <Link to={`/destinations/${dest.id}`} className="dp-explore-link">
                  Explore <span>&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DestinationsPage;
