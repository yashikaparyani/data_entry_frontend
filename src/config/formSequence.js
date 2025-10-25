// Define the sequence of forms that must be completed in order
export const FORM_SEQUENCE = [
  {
    id: 1,
    name: 'Standard Form',
    formType: 'user_form',
    route: '/form',
    icon: '📋',
    hasSections: true
  },
  {
    id: 2,
    name: 'MSE Assessment',
    formType: 'mse_assessment',
    route: '/mse-assessment',
    icon: '📝',
    hasSections: true
  },
  {
    id: 3,
    name: 'Output Sheet',
    formType: 'output_sheet',
    route: '/output-analysis',
    icon: '�',
    hasSections: true
  },
  {
    id: 4,
    name: 'Expert Scorecard',
    formType: 'expert_scorecard',
    route: '/expert-scorecard',
    icon: '⭐',
    hasSections: false
  },
  {
    id: 5,
    name: 'Financial Analysis',
    formType: 'financial_analysis',
    route: '/financial-analysis',
    icon: '�',
    hasSections: true
  },
  {
    id: 6,
    name: 'Bank Analysis',
    formType: 'bank_analysis',
    route: '/bank-analysis',
    icon: '🏦',
    hasSections: true
  },
  {
    id: 7,
    name: 'Credit App Memo',
    formType: 'credit_app_memo',
    route: '/credit-app-memo',
    icon: '�',
    hasSections: true
  }
];

// Get next form in sequence
export const getNextForm = (currentFormType) => {
  const currentIndex = FORM_SEQUENCE.findIndex(f => f.formType === currentFormType);
  if (currentIndex === -1 || currentIndex === FORM_SEQUENCE.length - 1) {
    return null; // Last form or form not found
  }
  return FORM_SEQUENCE[currentIndex + 1];
};

// Get previous form in sequence
export const getPreviousForm = (currentFormType) => {
  const currentIndex = FORM_SEQUENCE.findIndex(f => f.formType === currentFormType);
  if (currentIndex <= 0) {
    return null; // First form or form not found
  }
  return FORM_SEQUENCE[currentIndex - 1];
};

// Check if a form is locked based on completed forms
export const isFormLocked = (formType, completedForms = []) => {
  const formIndex = FORM_SEQUENCE.findIndex(f => f.formType === formType);
  if (formIndex === 0) return false; // First form is never locked
  
  // Check if previous form is completed
  const previousForm = FORM_SEQUENCE[formIndex - 1];
  return !completedForms.includes(previousForm.formType);
};

// Get form by type
export const getFormByType = (formType) => {
  return FORM_SEQUENCE.find(f => f.formType === formType);
};

// Get completed forms count
export const getCompletedFormsCount = (completedForms = []) => {
  return FORM_SEQUENCE.filter(f => completedForms.includes(f.formType)).length;
};

// Check if all forms are completed
export const areAllFormsCompleted = (completedForms = []) => {
  return FORM_SEQUENCE.every(f => completedForms.includes(f.formType));
};
