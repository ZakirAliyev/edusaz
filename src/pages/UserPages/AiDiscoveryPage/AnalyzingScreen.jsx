import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import './AnalyzingScreen.scss';

const STEP_MS = 600;
const FINAL_MS = 500;

function AnalyzingScreen({ onComplete }) {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  // Plain description of what actually happens with the answers.
  const steps = [
    t('pages.matchQuiz.checkCountry', 'Seçdiyiniz ölkənin universitetləri yoxlanılır'),
    t('pages.matchQuiz.checkLanguage', 'Tədris dili uyğunluğu yoxlanılır'),
    t('pages.matchQuiz.checkSort', 'Nəticələr uyğunluğa görə sıralanır')
  ];

  useEffect(() => {
    // Step through the items one by one
    if (activeStep < steps.length) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, STEP_MS);
      return () => clearTimeout(timer);
    }
    // Once all steps are done, wait a little bit then call onComplete
    const finalTimer = setTimeout(() => {
      onComplete();
    }, FINAL_MS);
    return () => clearTimeout(finalTimer);
  }, [activeStep, steps.length, onComplete]);

  const pct = Math.round((activeStep / steps.length) * 100);

  return (
    <section className="ds-card gq-analyzing" role="status" aria-live="polite" aria-busy="true">
      <h1 className="gq-analyzing__title">
        {t('pages.matchQuiz.analyzingTitle', 'Uyğun universitetlər seçilir')}
      </h1>
      <p className="gq-analyzing__lead">
        {t('pages.matchQuiz.analyzingLead', 'Cavablarınız əsasında siyahı hazırlanır. Bu bir neçə saniyə çəkir.')}
      </p>

      <div className="gq-analyzing__track" aria-hidden>
        <div className="gq-analyzing__fill" style={{ width: `${pct}%` }} />
      </div>

      <ol className="gq-analyzing__list">
        {steps.map((step, index) => {
          const state = index < activeStep ? 'done' : index === activeStep ? 'active' : 'pending';
          return (
            <li key={index} className="gq-analyzing__item" data-state={state}>
              <span className="gq-analyzing__icon" aria-hidden>
                {state === 'done' ? <Check /> : null}
              </span>
              <span>{step}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default AnalyzingScreen;
