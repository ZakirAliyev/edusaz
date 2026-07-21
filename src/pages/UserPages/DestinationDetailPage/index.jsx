import { useParams, Link } from 'react-router-dom';
import './index.scss';

// Mock data to simulate API response based on the country ID
const destinationData = {
  az: {
    name: 'Azerbaijan',
    flag: '🇦🇿',
    image: 'https://images.unsplash.com/photo-1600122553956-618d3615291f?auto=format&fit=crop&w=1920&q=80',
    stats: {
      universities: 48,
      tuition: '$1,500-$8,000',
      living: '$400-$900',
      visa: '~72%'
    },
    universities: [
      {
        id: 'ada',
        name: 'ADA University',
        location: 'Baku, Azerbaijan',
        rank: '#1 in AZ',
        match: '96%',
        tuition: '$6,500/yr',
        acceptance: '42%',
        language: 'English',
        deadline: 'Apr 30, 2025',
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
        program: 'Bachelor in Computer Science'
      },
      {
        id: 'bsu',
        name: 'Baku State University',
        location: 'Baku, Azerbaijan',
        rank: '#2 in AZ',
        match: '91%',
        tuition: '$2,800/yr',
        acceptance: '55%',
        language: 'Azerbaijani',
        deadline: 'May 15, 2025',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
        program: 'Bachelor in Computer Science'
      }
    ]
  },
  tr: {
    name: 'Turkey',
    flag: '🇹🇷',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1920&q=80',
    stats: {
      universities: 186,
      tuition: '$2,000-$10,000',
      living: '$300-$800',
      visa: '~80%'
    },
    universities: []
  },
  // Add fallback for others...
};

function DestinationDetailPage() {
  const { id } = useParams();
  
  // Default to Azerbaijan if not found for demo purposes
  const data = destinationData[id] || destinationData['az'];

  return (
    <div className="destination-detail-page">
      {/* Hero Banner */}
      <section 
        className="dest-hero" 
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${data.image})` }}
      >
        <div className="dest-hero-content">
          <span className="dest-flag">{data.flag}</span>
          <h1>Study in {data.name}</h1>
          <p>{data.stats.universities} universities &bull; {data.stats.tuition}</p>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="dest-stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <h2>{data.stats.universities}</h2>
            <p>Universities</p>
          </div>
          <div className="stat-card">
            <h2>{data.stats.tuition}</h2>
            <p>Avg. Tuition/yr</p>
          </div>
          <div className="stat-card">
            <h2>{data.stats.living}</h2>
            <p>Living cost/mo</p>
          </div>
          <div className="stat-card">
            <h2>{data.stats.visa}</h2>
            <p>Visa success rate</p>
          </div>
        </div>
      </section>

      {/* Universities List */}
      <section className="dest-unis-section">
        <div className="unis-grid">
          {data.universities.map(uni => (
            <Link to={`/universities/${uni.id}`} key={uni.id} className="uni-card-link">
              <div className="uni-card">
                <div className="uni-image" style={{ backgroundImage: `url(${uni.image})` }}>
                  <div className="badges-top">
                    <span className="match-badge">⭐ {uni.match} Match</span>
                    <span className="scholarship-badge">🎓 Scholarship</span>
                  </div>
                </div>
                <div className="uni-info">
                  <div className="uni-title-row">
                    <h3>{uni.name}</h3>
                    <span className="uni-rank">{uni.rank}</span>
                  </div>
                  <p className="location">{data.flag} {uni.location}</p>
                  <p className="program">{uni.program}</p>
                  
                  <div className="uni-metrics">
                    <div className="metric">
                      <span className="label">Tuition</span>
                      <span className="val">{uni.tuition}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Acceptance</span>
                      <span className="val">{uni.acceptance}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Language</span>
                      <span className="val">{uni.language}</span>
                    </div>
                  </div>
                  
                  <div className="uni-footer">
                    <span className="deadline">📅 {uni.deadline}</span>
                    <span className="arrow">&rsaquo;</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="find-programs-action">
          <button className="btn-find-programs">
            Find Programs in {data.name} <span>✨</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default DestinationDetailPage;
