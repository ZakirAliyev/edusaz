import { Link } from 'react-router-dom';
import './index.scss';

const ScholarshipIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const scholarships = [
  {
    id: 1,
    name: "Stipendium Hungaricum",
    location: "Hungary",
    status: "Open",
    amount: "Full funding",
    deadline: "Jan 15, 2025",
    eligible: "All nationalities",
    places: "5,000/yr",
    buttonType: "check"
  },
  {
    id: 2,
    name: "Türkiye Scholarships",
    location: "Turkey",
    status: "Open",
    amount: "Full + stipend",
    deadline: "Feb 20, 2025",
    eligible: "All nationalities",
    places: "6,000/yr",
    buttonType: "check"
  },
  {
    id: 3,
    name: "DAAD Scholarships",
    location: "Germany",
    status: "Closed",
    amount: "€750-€1,200/mo",
    deadline: "Nov 1, 2024",
    eligible: "Developing countries",
    places: "23,000/yr",
    buttonType: "notify"
  },
  {
    id: 4,
    name: "Azerbaijan State Scholarship",
    location: "Azerbaijan",
    status: "Open",
    amount: "Tuition + housing",
    deadline: "Mar 31, 2025",
    eligible: "Developing countries",
    places: "500/yr",
    buttonType: "check"
  },
  {
    id: 5,
    name: "Erasmus+ Scholarships",
    location: "EU",
    status: "Open",
    amount: "€300-€500/mo",
    deadline: "Varies",
    eligible: "Partner countries",
    places: "Unlimited",
    buttonType: "check"
  },
  {
    id: 6,
    name: "Commonwealth Scholarship",
    location: "UK",
    status: "Closed",
    amount: "Full funding",
    deadline: "Dec 15, 2024",
    eligible: "Commonwealth nations",
    places: "800/yr",
    buttonType: "notify"
  }
];

function ScholarshipsPage() {
  return (
    <main id="scholarships-page">
      <div className="sp-header">
        <div className="sp-badge">
          <ScholarshipIcon />
          Scholarships
        </div>
        
        <h1 className="sp-title">
          150,000+ scholarships for <span className="sp-title-colored">international students</span>
        </h1>
        
        <p className="sp-subtitle">
          AI matches scholarships to your nationality, program, degree level, and academic background.
        </p>

        <Link to="/ai-discovery" style={{ textDecoration: 'none' }}>
          <button className="btn-find-scholarships">
            Find My Scholarships <SparkleIcon />
          </button>
        </Link>
      </div>

      <div className="sp-grid-container">
        <div className="sp-grid">
          {scholarships.map(sch => (
            <div className="sp-card" key={sch.id}>
              
              <div className="sp-card-header">
                <div>
                  <h4 className="sp-card-title">{sch.name}</h4>
                  <p className="sp-card-location">{sch.location}</p>
                </div>
                <span className={`sp-card-status ${sch.status.toLowerCase()}`}>
                  {sch.status}
                </span>
              </div>
              
              <div className="sp-card-details">
                <div className="sp-detail-row">
                  <span className="sp-detail-label">Amount</span>
                  <span className="sp-detail-value">{sch.amount}</span>
                </div>
                <div className="sp-detail-row">
                  <span className="sp-detail-label">Deadline</span>
                  <span className="sp-detail-value">{sch.deadline}</span>
                </div>
                <div className="sp-detail-row">
                  <span className="sp-detail-label">Eligible</span>
                  <span className="sp-detail-value">{sch.eligible}</span>
                </div>
                <div className="sp-detail-row">
                  <span className="sp-detail-label">Places</span>
                  <span className="sp-detail-value">{sch.places}</span>
                </div>
              </div>
              
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button className={`sp-card-btn ${sch.buttonType}`}>
                  {sch.buttonType === 'check' ? 'Check Eligibility' : 'Get Notified'}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default ScholarshipsPage;
