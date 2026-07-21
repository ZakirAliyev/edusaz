import './index.scss';

const UniversityIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10v12" />
    <path d="M20 10v12" />
    <path d="M4 10l8-8 8 8" />
    <path d="M12 22v-8" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const universities = [
  {
    id: 1,
    name: "ADA University",
    location: "Baku, Azerbaijan",
    ranking: "#1 in AZ",
    program: "Bachelor in Computer Science",
    tuition: "$6,500/yr",
    acceptance: "42%",
    language: "English",
    deadline: "Apr 30, 2025",
    match: "96% Match",
    hasScholarship: true,
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    name: "Baku State University",
    location: "Baku, Azerbaijan",
    ranking: "#2 in AZ",
    program: "Bachelor in Computer Science",
    tuition: "$2,800/yr",
    acceptance: "55%",
    language: "Azerbaijani",
    deadline: "May 15, 2025",
    match: "91% Match",
    hasScholarship: true,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Istanbul Technical University",
    location: "Istanbul, Turkey",
    ranking: "#501-600 QS",
    program: "Bachelor in Computer Engineering",
    tuition: "$3,200/yr",
    acceptance: "38%",
    language: "Turkish",
    deadline: "Mar 1, 2025",
    match: "88% Match",
    hasScholarship: true,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    name: "University of Warsaw",
    location: "Warsaw, Poland",
    ranking: "#351-400 QS",
    program: "Bachelor in Computer Science",
    tuition: "$2,500/yr",
    acceptance: "48%",
    language: "English",
    deadline: "Jun 30, 2025",
    match: "84% Match",
    hasScholarship: false,
    image: "https://images.unsplash.com/photo-1555848962-6e79363ec58f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    name: "Universiti Malaya",
    location: "Kuala Lumpur, Malaysia",
    ranking: "#65 QS Asia",
    program: "Bachelor in Computer Science",
    tuition: "$4,100/yr",
    acceptance: "35%",
    language: "English",
    deadline: "May 31, 2025",
    match: "79% Match",
    hasScholarship: true,
    image: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    name: "University of Pecs",
    location: "Pecs, Hungary",
    ranking: "#801-1000 QS",
    program: "Bachelor in Computer Science",
    tuition: "$3,800/yr",
    acceptance: "62%",
    language: "English",
    deadline: "Jan 15, 2025",
    match: "74% Match",
    hasScholarship: true,
    image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

function BrowseUniversitiesPage() {
  return (
    <main id="browse-universities-page">
      <div className="bu-header">
        <div className="bu-badge">
          <UniversityIcon />
          All Universities
        </div>
        
        <h1 className="bu-title">
          Browse <span className="bu-title-colored">2,500+ universities</span>
        </h1>
        
        <p className="bu-subtitle">
          Filter by country, program, or let AI find perfect matches.
        </p>
      </div>

      <div className="bu-filter-card">
        <div className="filter-group">
          <div className="filter-field">
            <span className="filter-label">DESTINATION</span>
            <div className="filter-input-wrap">
              <select className="filter-select">
                <option>All Countries</option>
              </select>
              <ChevronDownIcon />
            </div>
          </div>
          
          <div className="filter-field">
            <span className="filter-label">PROGRAM</span>
            <div className="filter-input-wrap">
              <select className="filter-select">
                <option>All Programs</option>
              </select>
              <ChevronDownIcon />
            </div>
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="btn-apply-filters">
            <FilterIcon /> Apply Filters
          </button>
          <button className="btn-use-ai">
            <SparkleIcon /> Use AI
          </button>
        </div>
      </div>

      <div className="bu-grid-container">
        <div className="bu-grid">
          {universities.map(uni => (
            <div className="bu-card" key={uni.id}>
              <div className="bu-card-img-wrapper">
                <img src={uni.image} alt={uni.name} className="bu-card-img" />
                <div className="bu-card-tags">
                  <span className={`bu-tag-match ${parseInt(uni.match) >= 90 ? 'high' : parseInt(uni.match) >= 80 ? 'med' : 'low'}`}>
                    <SparkleIcon /> {uni.match}
                  </span>
                  {uni.hasScholarship && (
                    <span className="bu-tag-scholarship">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                      Scholarship
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bu-card-body">
                <div className="bu-card-header">
                  <div>
                    <h4 className="bu-card-title">{uni.name}</h4>
                    <p className="bu-card-location">{uni.location}</p>
                  </div>
                  <span className="bu-card-ranking">{uni.ranking}</span>
                </div>
                
                <p className="bu-card-program">{uni.program}</p>
                
                <div className="bu-card-stats">
                  <div className="bu-card-stat">
                    <span>Tuition</span>
                    <strong>{uni.tuition}</strong>
                  </div>
                  <div className="bu-card-stat">
                    <span>Acceptance</span>
                    <strong>{uni.acceptance}</strong>
                  </div>
                  <div className="bu-card-stat">
                    <span>Language</span>
                    <strong>{uni.language}</strong>
                  </div>
                </div>
                
                <div className="bu-card-footer">
                  <div className="bu-deadline">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {uni.deadline}
                  </div>
                  <button className="bu-card-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default BrowseUniversitiesPage;
