import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Step1 from './Steps/Step1';
import Step2 from './Steps/Step2';
import AnalyzingScreen from './AnalyzingScreen';
import './index.scss';

function AiDiscoveryPage() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const totalSteps = 2;
  const navigate = useNavigate();

  // State to hold country & teaching language selections
  const [selections, setSelections] = useState({
    countryTo: '',
    countryName: '',
    teachingLanguage: '',
    languageName: ''
  });

  const canContinue = currentStep === 1 
    ? Boolean(selections.countryTo)
    : Boolean(selections.teachingLanguage);

  const handleNext = () => {
    if (!canContinue) return;

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finished all 2 steps, start analyzing
      setIsAnalyzing(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateCountry = (id, name) => {
    setSelections(prev => ({ ...prev, countryTo: id, countryName: name }));
  };

  const updateLanguage = (id, name) => {
    setSelections(prev => ({ ...prev, teachingLanguage: id, languageName: name }));
  };
  
  const handleAnalyzingComplete = () => {
    localStorage.setItem('edusaz_ai_selections', JSON.stringify(selections));
    navigate('/ai-discovery/results');
  };

  // Render the current step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1 
            selection={selections.countryTo} 
            onSelect={(id, name) => updateCountry(id, name)} 
          />
        );
      case 2:
        return (
          <Step2 
            selection={selections.teachingLanguage} 
            onSelect={(id, name) => updateLanguage(id, name)} 
          />
        );
      default:
        return (
          <Step1 
            selection={selections.countryTo} 
            onSelect={(id, name) => updateCountry(id, name)} 
          />
        );
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  if (isAnalyzing) {
    return <AnalyzingScreen onComplete={handleAnalyzingComplete} />;
  }

  return (
    <div className="ai-discovery-page">
      {/* Header Area */}
      <header className="ad-header">
        <div className="ad-header-content">
          <div className="ad-header-left">
            {currentStep > 1 ? (
              <button className="btn-back" onClick={handleBack}>
                &lsaquo; {t('common.back', 'Geri')}
              </button>
            ) : (
              <div className="btn-back-placeholder"></div>
            )}
            <span className="step-label">
              {t('aiDiscovery.stepLabel', { current: currentStep, total: totalSteps, defaultValue: `Addım ${currentStep} / ${totalSteps}` })}
            </span>
          </div>
          <div className="ad-progress-container">
            <div className="ad-progress-bar">
              <div 
                className="ad-progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="ad-header-right">
            <span className="completion-label">{Math.round(progressPercentage)}% {t('aiDiscovery.complete', 'tamamlandı')}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ad-main-content">
        {renderStep()}
      </main>

      {/* Footer Area */}
      <footer className="ad-footer">
        <div className="ad-footer-content">
          <button 
            className="btn-primary-continue" 
            onClick={handleNext}
            disabled={!canContinue}
            style={{
              opacity: canContinue ? 1 : 0.45,
              cursor: canContinue ? 'pointer' : 'not-allowed'
            }}
          >
            {currentStep === totalSteps 
              ? (t('aiDiscovery.btnFind', 'Universitetləri Tap') || 'Find My Universities')
              : (t('aiDiscovery.btnContinue', 'Davam Et') || 'Continue')
            } <span>&rarr;</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default AiDiscoveryPage;
