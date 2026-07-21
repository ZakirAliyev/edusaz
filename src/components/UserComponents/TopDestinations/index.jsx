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
  { id: 'az', name: 'Azerbaijan', count: 48, label: 'Affordable & Growing', img: 'https://images.unsplash.com/photo-1600122553956-618d3615291f?auto=format&fit=crop&w=400&q=80', flag: '🇦🇿' },
  { id: 'tr', name: 'Turkey', count: 186, label: 'Popular Destination', img: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=400&q=80', flag: '🇹🇷' },
  { id: 'de', name: 'Germany', count: 300, label: 'Tuition-Free Options', img: 'https://images.unsplash.com/photo-1467269204594-9661b134dc2b?auto=format&fit=crop&w=400&q=80', flag: '🇩🇪' },
  { id: 'uk', name: 'United Kingdom', count: 165, label: 'World-Class Rankings', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80', flag: '🇬🇧' },
  { id: 'ca', name: 'Canada', count: 220, label: 'Post-Study Work Visa', img: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=400&q=80', flag: '🇨🇦' },
  { id: 'my', name: 'Malaysia', count: 95, label: 'Affordable English', img: 'https://images.unsplash.com/photo-1596422846543-74c6eb24f628?auto=format&fit=crop&w=400&q=80', flag: '🇲🇾' },
  { id: 'pl', name: 'Poland', count: 130, label: 'EU Recognition', img: 'https://images.unsplash.com/photo-1519658253479-79a6d71317d7?auto=format&fit=crop&w=400&q=80', flag: '🇵🇱' },
  { id: 'hu', name: 'Hungary', count: 78, label: 'Stipendium Scholarships', img: 'https://images.unsplash.com/photo-1569972394105-89104f762744?auto=format&fit=crop&w=400&q=80', flag: '🇭🇺' },
  { id: 'it', name: 'Italy', count: 99, label: 'Historic Universities', img: 'https://images.unsplash.com/photo-1515542622106-78b28af7815d?auto=format&fit=crop&w=400&q=80', flag: '🇮🇹' },
  { id: 'ae', name: 'UAE', count: 67, label: 'Global Business Hub', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80', flag: '🇦🇪' },
];

function TopDestinations() {
  return (
    <section id="top-destinations">
      <div className="td-inner">
        <div className="td-header">
          <div className="td-header-left">
            <span className="td-badge">
              <GlobeIcon />
              Destinations
            </span>
            <h2 className="td-title">Top study destinations</h2>
          </div>
          <button className="btn-view-all">View all &gt;</button>
        </div>

        <div className="td-grid">
          {destinations.map(dest => (
            <Link to={`/destinations/${dest.id}`} key={dest.id} style={{ textDecoration: 'none' }}>
              <div className="td-card">
                <img src={dest.img} alt={dest.name} className="td-card-img" />
                <div className="td-card-overlay">
                  <div className="td-card-content">
                    <div className="td-card-title">
                      <span className="td-flag">{dest.flag}</span>
                      <h3>{dest.name}</h3>
                    </div>
                    <span className="td-count">{dest.count} universities</span>
                    <span className="td-label">{dest.label}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TopDestinations;
