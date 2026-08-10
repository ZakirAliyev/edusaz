import { useTranslation } from 'react-i18next';
import './index.scss';

const AiIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7b4dff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

function AiAdvisor() {
  const { t } = useTranslation();

  return (
    <section id="ai-advisor">
      <div className="ai-inner">
        <div className="ai-content">
          <span className="ai-badge">
            <AiIcon />
            {t('aiAdvisorSection.badge')}
          </span>
          <h2 className="ai-title">
            {t('aiAdvisorSection.titlePart1')}<br/>
            <span className="ai-title-colored">{t('aiAdvisorSection.titlePart2')}</span>
          </h2>
          <p className="ai-desc">
            {t('aiAdvisorSection.descPart1')}<strong>{t('aiAdvisorSection.descExample')}</strong>{t('aiAdvisorSection.descPart2')}
          </p>
          <ul className="ai-features">
            <li>
              <CheckIcon />
              {t('aiAdvisorSection.feature1')}
            </li>
            <li>
              <CheckIcon />
              {t('aiAdvisorSection.feature2')}
            </li>
            <li>
              <CheckIcon />
              {t('aiAdvisorSection.feature3')}
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
                <strong>{t('aiAdvisorSection.chatTitle')}</strong>
                <span>{t('aiAdvisorSection.chatSubtitle')}</span>
              </div>
              <div className="chat-status"></div>
            </div>

            <div className="chat-body">
              <div className="chat-msg user-msg">
                {t('aiAdvisorSection.userMsg')}
              </div>
              <div className="chat-msg bot-msg">
                <div className="bot-avatar">
                  <AiIcon />
                </div>
                <div className="bot-content">
                  <p>{t('aiAdvisorSection.botResponse')}</p>
                  
                  <div className="chat-cards">
                    <div className="chat-card">
                      <div className="card-info">
                        <strong>ADA University</strong>
                        <span>$4,800/yr • 🎓 {t('aiAdvisorSection.upTo100')}</span>
                      </div>
                      <div className="card-match green">96%</div>
                    </div>
                    <div className="chat-card">
                      <div className="card-info">
                        <strong>Baku State Univ.</strong>
                        <span>$2,800/yr • 🎓 {t('aiAdvisorSection.partial75')}</span>
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

