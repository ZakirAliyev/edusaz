import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Step1 from './Steps/Step1';
import Step2 from './Steps/Step2';
import AnalyzingScreen from './AnalyzingScreen';
import './index.scss';

function AiDiscoveryPage() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showError, setShowError] = useState(false);
  const stepRef = useRef(null);
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

  // The action bar sits below the options, so bring the next question into view.
  const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

  // Validate before continuing: explain what is missing instead of silently doing nothing.
  const handleContinueClick = () => {
    if (!canContinue) {
      setShowError(true);
      stepRef.current?.querySelector('input')?.focus();
      return;
    }
    setShowError(false);
    handleNext();
    scrollToTop();
  };

  const handleBackClick = () => {
    setShowError(false);
    handleBack();
    scrollToTop();
  };

  const updateCountry = (id, name) => {
    setShowError(false);
    setSelections(prev => ({ ...prev, countryTo: id, countryName: name }));
  };

  const updateLanguage = (id, name) => {
    setShowError(false);
    setSelections(prev => ({ ...prev, teachingLanguage: id, languageName: name }));
  };

  const handleAnalyzingComplete = () => {
    localStorage.setItem('edusaz_ai_selections', JSON.stringify(selections));
    navigate('/ai-discovery/results');
  };

  // Render the current step component
  const renderStep = () => {
    switch (currentStep) {
      case 2:
        return (
          <Step2
            selection={selections.teachingLanguage}
            onSelect={(id, name) => updateLanguage(id, name)}
          />
        );
      case 1:
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
  const stepLabel = t('aiDiscovery.stepLabel', {
    current: currentStep,
    total: totalSteps,
    defaultValue: `Addım ${currentStep} / ${totalSteps}`
  });

  if (isAnalyzing) {
    return (
      <main className="ds-page gq-page">
        <div className="ds-container gq-container">
          <AnalyzingScreen onComplete={handleAnalyzingComplete} />
        </div>
      </main>
    );
  }

  const errorText = currentStep === 1
    ? t('pages.matchQuiz.errorCountry', 'Davam etmək üçün bir ölkə seçin.')
    : t('pages.matchQuiz.errorLanguage', 'Davam etmək üçün tədris dilini seçin.');

  return (
    <main className="ds-page gq-page">
      <div className="ds-container gq-container">
        <p className="gq-kicker">
          <span className="ds-eyebrow">{t('pages.matchQuiz.eyebrow', 'Uyğunluq testi')}</span>
        </p>

        <section className="ds-card gq-card" aria-label={t('pages.matchQuiz.eyebrow', 'Uyğunluq testi')}>
          <div className="gq-progress">
            <div className="gq-progress__meta">
              <span className="gq-progress__step">{stepLabel}</span>
              <span className="gq-progress__pct">
                {Math.round(progressPercentage)}% {t('aiDiscovery.complete', 'tamamlandı')}
              </span>
            </div>
            <div
              className="gq-progress__track"
              role="progressbar"
              aria-label={stepLabel}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressPercentage)}
            >
              <div className="gq-progress__fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          <div className="gq-card__body" ref={stepRef} key={currentStep}>
            {renderStep()}
          </div>

          <div className="gq-card__footer">
            <p className="gq-card__error ds-error" role="alert">
              {showError ? errorText : ''}
            </p>
            <div className="gq-card__actions">
              {currentStep > 1 ? (
                <button type="button" className="ds-btn ds-btn--ghost gq-back" onClick={handleBackClick}>
                  <ArrowLeft aria-hidden className="gq-flip" />
                  {t('common.back', 'Geri')}
                </button>
              ) : (
                <span className="gq-card__spacer" aria-hidden />
              )}
              <button
                type="button"
                className="ds-btn ds-btn--primary gq-next"
                onClick={handleContinueClick}
                data-ready={canContinue ? 'true' : 'false'}
              >
                {currentStep === totalSteps
                  ? t('aiDiscovery.btnFind', 'Universitetləri Tap')
                  : t('aiDiscovery.btnContinue', 'Davam Et')}
                <ArrowRight aria-hidden className="gq-flip" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AiDiscoveryPage;
