import { useState, useEffect } from 'react';
import './AnalyzingScreen.scss';

function AnalyzingScreen({ onComplete }) {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    "Matching university programs",
    "Calculating admission probability",
    "Finding relevant scholarships",
    "Checking visa requirements by nationality",
    "Estimating living and tuition costs"
  ];

  useEffect(() => {
    // Step through the analyzing items one by one
    if (activeStep < steps.length) {
      const timer = setTimeout(() => {
        setActiveStep(prev => prev + 1);
      }, 800); // Wait 800ms between each step
      return () => clearTimeout(timer);
    } else {
      // Once all steps are done, wait a little bit then call onComplete
      const finalTimer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(finalTimer);
    }
  }, [activeStep, steps.length, onComplete]);

  return (
    <div className="analyzing-screen-container">
      <div className="analyzing-content">
        <div className="icon-container">
           {/* Brain icon representation */}
           <div className="brain-icon-wrapper">
             <span className="brain-icon">🧠</span>
           </div>
        </div>
        
        <h2>Analyzing your profile...</h2>
        <p className="subtitle">Cross-referencing 2,500+ universities and 150,000+ scholarships</p>
        
        <div className="analyzing-steps">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`analyzing-step ${index < activeStep ? 'completed' : index === activeStep ? 'active' : 'pending'}`}
            >
              <div className="step-icon">
                {index < activeStep ? (
                   <span className="check-icon">✓</span>
                ) : index === activeStep ? (
                   <div className="spinner"></div>
                ) : (
                   <span className="pending-icon">✓</span>
                )}
              </div>
              <span className="step-text">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnalyzingScreen;
