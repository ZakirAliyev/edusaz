import './index.scss';

const AiIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"/>
    <path d="M12 6v6l4 2"/>
  </svg>
); // Placeholder AI icon

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7b4dff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

function AiAdvisor() {
  return (
    <section id="ai-advisor">
      <div className="ai-inner">
        <div className="ai-content">
          <span className="ai-badge">
            <AiIcon />
            AI Education Advisor
          </span>
          <h2 className="ai-title">
            Not a search engine.<br/>
            <span className="ai-title-colored">An AI that understands you.</span>
          </h2>
          <p className="ai-desc">
            Instead of browsing manually, just tell our AI: <strong>"I am from Nigeria and want to study Medicine in Azerbaijan with a budget of $5,000."</strong> Get instant, personalized results.
          </p>
          <ul className="ai-features">
            <li>
              <CheckIcon />
              Admission probability for each university
            </li>
            <li>
              <CheckIcon />
              Available scholarships matched to your profile
            </li>
            <li>
              <CheckIcon />
              Visa requirements and step-by-step guidance
            </li>
          </ul>
        </div>

        <div className="ai-visual">
          <div className="ai-chat-ui">
            <div className="chat-header">
              <div className="chat-avatar">
                <AiIcon />
              </div>
              <div className="chat-info">
                <strong>EDUSAZ AI Advisor</strong>
                <span>Analyzing 2,500+ universities</span>
              </div>
              <div className="chat-status"></div>
            </div>

            <div className="chat-body">
              <div className="chat-msg user-msg">
                I am from Nigeria. I want to study Medicine in Azerbaijan. Budget: $5,000/year.
              </div>
              <div className="chat-msg bot-msg">
                <div className="bot-avatar">
                  <AiIcon />
                </div>
                <div className="bot-content">
                  <p>Found 8 universities matching your profile:</p>
                  
                  <div className="chat-cards">
                    <div className="chat-card">
                      <div className="card-info">
                        <strong>ADA University</strong>
                        <span>$4,800/yr • 🎓 Up to 100%</span>
                      </div>
                      <div className="card-match green">96%</div>
                    </div>
                    <div className="chat-card">
                      <div className="card-info">
                        <strong>Baku State Univ.</strong>
                        <span>$2,800/yr • 🎓 75% partial</span>
                      </div>
                      <div className="card-match green">91%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AiAdvisor;
