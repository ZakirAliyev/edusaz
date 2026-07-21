import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1 from './Steps/Step1';
import Step2 from './Steps/Step2';
import Step3 from './Steps/Step3';
import Step4 from './Steps/Step4';
import Step5 from './Steps/Step5';
import Step6 from './Steps/Step6';
import AnalyzingScreen from './AnalyzingScreen';
import './index.scss';

function AiDiscoveryPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const totalSteps = 6;
  const navigate = useNavigate();

  // State to hold all selections
  const [selections, setSelections] = useState({
    countryFrom: '',
    countryTo: '',
    fieldOfStudy: '',
    educationLevel: '',
    budget: '',
    finalStepData: ''
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Finished all steps, start analyzing
      setIsAnalyzing(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const updateSelection = (key, value) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  };
  
  const handleAnalyzingComplete = () => {
    navigate('/ai-discovery/results');
  };

  // Render the current step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 selection={selections.countryFrom} onSelect={(val) => updateSelection('countryFrom', val)} />;
      case 2:
        return <Step2 selection={selections.countryTo} onSelect={(val) => updateSelection('countryTo', val)} />;
      case 3:
        return <Step3 selection={selections.fieldOfStudy} onSelect={(val) => updateSelection('fieldOfStudy', val)} />;
      case 4:
        return <Step4 selection={selections.educationLevel} onSelect={(val) => updateSelection('educationLevel', val)} />;
      case 5:
        return <Step5 selection={selections.budget} onSelect={(val) => updateSelection('budget', val)} />;
      case 6:
        return <Step6 selection={selections.finalStepData} onSelect={(val) => updateSelection('finalStepData', val)} />;
      default:
        return <Step1 selection={selections.countryFrom} onSelect={(val) => updateSelection('countryFrom', val)} />;
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
                &lsaquo; Back
              </button>
            ) : (
              <div className="btn-back-placeholder"></div>
            )}
            <span className="step-label">Step {currentStep} of {totalSteps}</span>
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
            <span className="completion-label">{Math.round(progressPercentage)}% complete</span>
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
          <button className="btn-primary-continue" onClick={handleNext}>
            {currentStep === totalSteps ? 'Find My Universities' : 'Continue'} <span>&rarr;</span>
          </button>
          <button className="btn-skip" onClick={handleNext}>
            Skip
          </button>
        </div>
      </footer>
    </div>
  );
}

export default AiDiscoveryPage;
