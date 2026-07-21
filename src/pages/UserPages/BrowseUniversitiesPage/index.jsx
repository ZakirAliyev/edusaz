import { Link } from 'react-router-dom';
import { useGetUniversitiesQuery } from '../../../services/apis/userApi';
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

function BrowseUniversitiesPage() {
  const { data: universities = [], isLoading, isError } = useGetUniversitiesQuery();

  if (isLoading) return <div>Loading universities...</div>;
  if (isError) return <div>Error loading universities.</div>;

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
            <Link to={`/universities/${uni.id}`} key={uni.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="bu-card">
                <div className="bu-card-img-wrapper">
                  <img src={uni.logoUrl || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} alt={uni.name} className="bu-card-img" />
                  <div className="bu-card-tags">
                    <span className="bu-tag-match high">
                      <SparkleIcon /> 96% Match
                    </span>
                    <span className="bu-tag-scholarship">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                      Scholarship
                    </span>
                  </div>
                </div>
                
                <div className="bu-card-body">
                  <div className="bu-card-header">
                    <div>
                      <h4 className="bu-card-title">{uni.name}</h4>
                      <p className="bu-card-location">{uni.city}, {uni.country}</p>
                    </div>
                    <span className="bu-card-ranking">Est. {uni.establishedYear}</span>
                  </div>
                  
                  <p className="bu-card-program">{uni.description?.substring(0, 50)}...</p>
                  
                  <div className="bu-card-stats">
                    <div className="bu-card-stat">
                      <span>Tuition</span>
                      <strong>{uni.tuition || "N/A"}</strong>
                    </div>
                    <div className="bu-card-stat">
                      <span>Acceptance</span>
                      <strong>{uni.acceptanceRate || "N/A"}</strong>
                    </div>
                    <div className="bu-card-stat">
                      <span>Language</span>
                      <strong>{uni.teachingLanguage || "English"}</strong>
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
                      {uni.deadline || "TBA"}
                    </div>
                    <button className="bu-card-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default BrowseUniversitiesPage;
