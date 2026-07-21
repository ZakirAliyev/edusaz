import './index.scss';

const BuildingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10v12"/>
    <path d="M20 10v12"/>
    <path d="M4 22h16"/>
    <path d="M2 10h20"/>
    <path d="M12 2l-8 4v4h16V6z"/>
  </svg>
);

const ScholarshipIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const universities = [
  {
    id: 1,
    name: "ADA University",
    match: "96%",
    matchColor: "#10b981",
    rank: "#1 in AZ",
    location: "🇦🇿 Baku, Azerbaijan",
    program: "Bachelor in Computer Science",
    tuition: "$6,500/yr",
    acceptance: "42%",
    language: "English",
    deadline: "Apr 30, 2025",
    hasScholarship: true,
    img: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    name: "Baku State University",
    match: "91%",
    matchColor: "#10b981",
    rank: "#2 in AZ",
    location: "🇦🇿 Baku, Azerbaijan",
    program: "Bachelor in Computer Science",
    tuition: "$2,800/yr",
    acceptance: "55%",
    language: "Azerbaijani",
    deadline: "May 15, 2025",
    hasScholarship: true,
    img: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    name: "Istanbul Technical University",
    match: "88%",
    matchColor: "#8b5cf6",
    rank: "#501-600 QS",
    location: "🇹🇷 Istanbul, Turkey",
    program: "Bachelor in Computer Engineering",
    tuition: "$3,200/yr",
    acceptance: "38%",
    language: "Turkish",
    deadline: "Mar 1, 2025",
    hasScholarship: true,
    img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    name: "University of Warsaw",
    match: "84%",
    matchColor: "#8b5cf6",
    rank: "#351-400 QS",
    location: "🇵🇱 Warsaw, Poland",
    program: "Bachelor in Computer Science",
    tuition: "$2,500/yr",
    acceptance: "48%",
    language: "English",
    deadline: "Jun 30, 2025",
    hasScholarship: false,
    img: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    name: "Universiti Malaya",
    match: "79%",
    matchColor: "#f59e0b",
    rank: "#65 QS Asia",
    location: "🇲🇾 Kuala Lumpur, Malaysia",
    program: "Bachelor in Computer Science",
    tuition: "$4,100/yr",
    acceptance: "35%",
    language: "English",
    deadline: "May 31, 2025",
    hasScholarship: true,
    img: "https://images.unsplash.com/photo-1596422846543-74c6eb24f628?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    name: "University of Pecs",
    match: "74%",
    matchColor: "#f59e0b",
    rank: "#801-1000 QS",
    location: "🇭🇺 Pecs, Hungary",
    program: "Bachelor in Computer Science",
    tuition: "$3,800/yr",
    acceptance: "62%",
    language: "English",
    deadline: "Jan 15, 2025",
    hasScholarship: true,
    img: "https://images.unsplash.com/photo-1569972394105-89104f762744?auto=format&fit=crop&w=600&q=80"
  }
];

function MatchedUniversities() {
  return (
    <section id="matched-universities">
      <div className="mu-inner">
        <div className="mu-header">
          <div className="mu-header-left">
            <span className="mu-badge">
              <BuildingIcon />
              Universities
            </span>
            <h2 className="mu-title">Matched for international students</h2>
          </div>
          <button className="btn-browse-all">Browse all &gt;</button>
        </div>

        <div className="mu-grid">
          {universities.map(uni => (
            <div key={uni.id} className="mu-card">
              <div className="mu-card-img-wrapper">
                <img src={uni.img} alt={uni.name} className="mu-card-img" />
                <div className="mu-card-tags">
                  <div className="mu-tag-match" style={{ backgroundColor: uni.matchColor }}>
                    <SparkleIcon /> {uni.match} Match
                  </div>
                  {uni.hasScholarship && (
                    <div className="mu-tag-scholarship">
                      <ScholarshipIcon /> Scholarship
                    </div>
                  )}
                </div>
              </div>

              <div className="mu-card-body">
                <div className="mu-card-header">
                  <h3 className="mu-uni-name">{uni.name}</h3>
                  <span className="mu-uni-rank">{uni.rank}</span>
                </div>
                
                <span className="mu-uni-location">{uni.location}</span>
                <span className="mu-uni-program">{uni.program}</span>

                <div className="mu-uni-stats">
                  <div className="stat-box">
                    <span className="stat-label">Tuition</span>
                    <span className="stat-val">{uni.tuition}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Acceptance</span>
                    <span className="stat-val">{uni.acceptance}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Language</span>
                    <span className="stat-val">{uni.language}</span>
                  </div>
                </div>

                <div className="mu-card-footer">
                  <div className="mu-deadline">
                    <CalendarIcon /> {uni.deadline}
                  </div>
                  <ChevronIcon />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MatchedUniversities;
