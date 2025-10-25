import React from 'react';
import { FORM_SEQUENCE, isFormLocked } from '../config/formSequence';
import { useFormProgress } from '../contexts/FormProgressContext';
import './form-tabs-common.css';

const FormTabs = ({ currentFormType }) => {
  const { completedForms, loading } = useFormProgress();

  const handleTabClick = (form) => {
    const locked = isFormLocked(form.formType, completedForms);
    
    if (locked) {
      const previousFormIndex = form.id - 2;
      const previousForm = FORM_SEQUENCE[previousFormIndex];
      alert(`🔒 ${form.name} is locked. Please complete ${previousForm?.name} first.`);
      return;
    }
    
    window.location.href = form.route;
  };

  if (loading) {
    return (
      <div className="form-tabs-container">
        <div className="form-tabs">
          <div className="loading-tabs">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-tabs-container">
      <div className="form-tabs">
        {FORM_SEQUENCE.map((form) => {
          const isLocked = isFormLocked(form.formType, completedForms);
          const isActive = form.formType === currentFormType;
          const isCompleted = completedForms.includes(form.formType);
          
          return (
            <button 
              key={form.id}
              type="button"
              className={`form-tab ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => handleTabClick(form)}
              disabled={isLocked}
              title={isLocked ? `Complete ${FORM_SEQUENCE[form.id - 2]?.name} first` : form.name}
            >
              <span className="tab-icon">{isLocked ? '🔒' : form.icon}</span>
              <span className="tab-text">{form.name}</span>
              {isCompleted && <span className="check-mark">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FormTabs;
