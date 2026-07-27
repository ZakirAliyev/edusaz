import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './index.scss';

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const destinations = [
  { id: 'az', name: 'Azerbaijan', count: 48, cost: '$1,500-$8,000/yr', label: 'Affordable & Growing', img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80', flag: '🇦🇿' },
  { id: 'tr', name: 'Turkey', count: 186, cost: '$2,000-$10,000/yr', label: 'Popular Destination', img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80', flag: '🇹🇷' },
  { id: 'de', name: 'Germany', count: 300, cost: '€0-€3,500/yr', label: 'Tuition-Free Options', img: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=800&q=80', flag: '🇩🇪' },
  { id: 'uk', name: 'United Kingdom', count: 165, cost: '£9,000-£38,000/yr', label: 'World-Class Rankings', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80', flag: '🇬🇧' },
  { id: 'ca', name: 'Canada', count: 220, cost: '$15,000-$35,000/yr', label: 'Post-Study Work Visa', img: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80', flag: '🇨🇦' },
  { id: 'my', name: 'Malaysia', count: 95, cost: '$3,000-$12,000/yr', label: 'Affordable English', img: 'https://images.unsplash.com/photo-1596422846543-74c6eb24f628?auto=format&fit=crop&w=800&q=80', flag: '🇲🇾' },
  { id: 'pl', name: 'Poland', count: 130, cost: '$2,500-$8,000/yr', label: 'EU Recognition', img: 'https://images.unsplash.com/photo-1519197924294-4ac978a3e048?auto=format&fit=crop&w=800&q=80', flag: '🇵🇱' },
  { id: 'hu', name: 'Hungary', count: 78, cost: '$3,000-$12,000/yr', label: 'Stipendium Scholarships', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80', flag: '🇭🇺' },
  { id: 'it', name: 'Italy', count: 99, cost: '€1,000-€18,000/yr', label: 'Historic Universities', img: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=800&q=80', flag: '🇮🇹' },
  { id: 'ae', name: 'UAE', count: 67, cost: '$8,000-$25,000/yr', label: 'Global Business Hub', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80', flag: '🇦🇪' },
];


function DestinationsPage() {
  const { t } = useTranslation();

  return (
    <div className="destinations-page">
      <div className="dp-header">
        <span className="dp-badge">
          <GlobeIcon />
          {t('topDestinations.badge')}
        </span>
        <h1 className="dp-title">
          {t('topDestinations.title')}
        </h1>
        <p className="dp-subtitle">
          {t('hero.subtitle')}
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
                  <span className="dp-label">{t(`destinations.labels.${dest.id}`) || dest.label}</span>
                </div>
                <h3 className="dp-name">{dest.name}</h3>
                <p className="dp-stats">
                  {dest.count} {t('topDestinations.countSuffix')} &bull; {dest.cost}
                </p>
                <Link to={`/destinations/${dest.id}`} className="dp-explore-link">
                  {t('destinations.explore')} <span>&rarr;</span>
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
