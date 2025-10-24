import React, { useState, useEffect } from 'react';
import { bankAnalysisConfig } from '../data/bankAnalysisConfig';
import './BankAnalysisForm.css';
import FormTabs from './FormTabs';
import axios from 'axios';

const BankAnalysisForm = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({});
  const [calculatedValues, setCalculatedValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [clientId, setClientId] = useState(null);
  const [activeFormId, setActiveFormId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize form - check for existing form or create new one
  useEffect(() => {
    const initializeForm = async () => {
      const storedClientId = localStorage.getItem('activeClientId');
      
      if (!storedClientId) {
        alert('❌ No active client found. Please start from the Standard Form.');
        window.location.href = '/loan-officer/dashboard';
        return;
      }
      
      setClientId(storedClientId);
      
      try {
        // Check if form already exists for this client
        const existingFormId = localStorage.getItem('activeFormId_bank_analysis');
        
        if (existingFormId) {
          // Load existing form data
          const response = await axios.get(`/api/loan-officer/forms/${existingFormId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          const formDataFromServer = response.data.form.formData || {};
          setFormData(formDataFromServer);
          setActiveFormId(existingFormId);
        } else {
          // Create new form for this client (or get existing)
          const formResponse = await axios.post(`/api/loan-officer/clients/${storedClientId}/forms`, {
            formType: 'bank_analysis'
          }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          const newFormId = formResponse.data.form._id;
          const existingFormData = formResponse.data.form.formData || {};
          
          setActiveFormId(newFormId);
          localStorage.setItem('activeFormId_bank_analysis', newFormId);
          
          // If form has existing data, use it; otherwise initialize empty
          if (Object.keys(existingFormData).length > 0) {
            setFormData(existingFormData);
          } else {
            // Initialize empty form data
            const initialData = {};
            bankAnalysisConfig.sections.forEach(section => {
              section.fields.forEach(field => {
                if (field.type !== 'calculated') {
                  initialData[field.id] = '';
                }
              });
            });
            setFormData(initialData);
          }
        }
      } catch (error) {
        console.error('Error initializing form:', error);
        console.error('Error details:', error.response?.data);
        
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
        alert(`❌ Error loading form: ${errorMessage}\n\nPlease try again or contact support.`);
        
        // Redirect back to dashboard on error
        setTimeout(() => {
          window.location.href = '/loan-officer/dashboard';
        }, 2000);
      } finally {
        setLoading(false);
      }
    };
    
    initializeForm();
  }, []);

  // Real-time calculations
  useEffect(() => {
    const newCalculatedValues = {};
    
    // Calculate all computed fields
    bankAnalysisConfig.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type === 'calculated' && bankAnalysisConfig.calculations[field.formula]) {
          newCalculatedValues[field.id] = bankAnalysisConfig.calculations[field.formula](formData);
        }
      });
    });
    
    // Calculate monthly total credits for display
    for (let month = 1; month <= 12; month++) {
      const bank1Credit = parseFloat(formData[`bank1_credit_month_${month}`] || 0);
      const bank2Credit = parseFloat(formData[`bank2_credit_month_${month}`] || 0);
      newCalculatedValues[`total_credit_month_${month}`] = bank1Credit + bank2Credit;
    }
    
    setCalculatedValues(newCalculatedValues);
  }, [formData]);

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateSection = (sectionIndex) => {
    const section = bankAnalysisConfig.sections[sectionIndex];
    const errors = {};
    
    section.fields.forEach(field => {
      if (field.required && field.type !== 'calculated') {
        const value = formData[field.id];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors[field.id] = `${field.label} is required`;
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveProgress = async () => {
    const clientId = localStorage.getItem('activeClientId');
    const formId = localStorage.getItem('activeFormId_bank_analysis');

    if (!clientId || !formId) {
      alert('❌ No active client or form found. Please start from dashboard.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/loan-officer/forms/${formId}/save`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          formData,
          calculatedFields: calculatedValues,
          currentStep: currentSection + 1,
          totalSteps: bankAnalysisConfig.sections.length
        })
      });

      if (response.ok) {
        alert('✓ Progress saved successfully!');
      } else {
        alert('❌ Error saving progress');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Error saving progress');
    }
  };

    const formatValue = (value, format) => {
      if (value === null || value === undefined || isNaN(value)) return '0';

      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(value);
        case 'percentage':
          return `${Number(value).toFixed(2)}%`;
        case 'score':
          return `${Number(value).toFixed(1)}/100`;
        default:
          return Number(value).toFixed(2);
      }
    };

  const renderField = (field) => {
    const value = field.type === 'calculated' ? calculatedValues[field.id] : formData[field.id];
    const hasError = validationErrors[field.id];

    if (field.type === 'calculated') {
      return (
        <div key={field.id} className="form-field calculated-field">
          <label className="field-label calculated-label">
            {field.label}
          </label>
          <div className="calculated-value">
            {formatValue(value, field.format)}
          </div>
        </div>
      );
    }

    return (
      <div key={field.id} className={`form-field ${hasError ? 'field-error' : ''}`}>
        <label className="field-label">
          {field.label}
          {field.required && <span className="required-indicator">*</span>}
        </label>
        
        {field.type === 'select' ? (
          <select
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="form-input form-select"
          >
            <option value="">Select {field.label}</option>
            {field.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === 'currency' ? (
          <input
            type="number"
            min="0"
            step="0.01"
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="form-input currency-input"
          />
        ) : (
          <input
            type={field.type === 'text' ? 'text' : 'number'}
            value={value || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="form-input"
          />
        )}
        
        {hasError && (
          <div className="error-message">{hasError}</div>
        )}
      </div>
    );
  };

  const completeFormAndRedirect = async () => {
    if (!clientId || !activeFormId) {
      alert('❌ No active client or form found.');
      return;
    }

    try {
      // Mark form as completed
      const response = await axios.put(`/api/loan-officer/forms/${activeFormId}/save`, {
        formData,
        calculatedFields: calculatedValues,
        currentStep: bankAnalysisConfig.sections.length,
        totalSteps: bankAnalysisConfig.sections.length,
        completionPercentage: 100,
        isCompleted: true
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.status === 200) {
        alert('✓ Bank Analysis form completed! Redirecting to Financial Analysis...');
        // Redirect to next form
        window.location.href = '/financial-analysis';
      } else {
        alert('❌ Error completing form');
      }
    } catch (error) {
      console.error('Complete error:', error);
      alert('❌ Error completing form');
    }
  };

  const handleNextSection = () => {
    if (validateSection(currentSection)) {
      // Check if this is the last section
      if (currentSection === bankAnalysisConfig.sections.length - 1) {
        // All sections complete, mark as complete and redirect
        completeFormAndRedirect();
      } else {
        // Move to next section within current form
        setCurrentSection(prev => Math.min(prev + 1, bankAnalysisConfig.sections.length - 1));
      }
    }
  };

  const handlePrevSection = () => {
    setCurrentSection(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate all sections
    let isValid = true;
    for (let i = 0; i < bankAnalysisConfig.sections.length; i++) {
      if (!validateSection(i)) {
        isValid = false;
        setCurrentSection(i);
        break;
      }
    }

    if (isValid) {
      const submissionData = {
        ...formData,
        calculatedValues,
        submittedAt: new Date().toISOString()
      };

      console.log('Bank Analysis Form Submitted:', submissionData);
      alert('Bank Analysis form submitted successfully!');
    }
  };

  const renderBalanceGrid = () => {
    const months = ['July', 'August', 'September', 'October', 'November', 'December'];
    const dates = ['5th', '10th', '15th', '20th', '25th', 'Last Day'];
    
    return (
      <div className="balance-grid-container">
        <div className="balance-grid">
          <div className="balance-grid-header">
            <div className="balance-grid-cell header-cell">Date</div>
            {months.map(month => (
              <div key={month} className="balance-grid-cell header-cell">{month}</div>
            ))}
          </div>
          
          {dates.map((date) => (
            <div key={date} className="balance-grid-row">
              <div className="balance-grid-cell date-cell">{date}</div>
              {months.map((month, monthIndex) => {
                const fieldId = `balance_${date === 'Last Day' ? 'lastDay' : date}_month_${monthIndex + 1}`;
                const value = formData[fieldId];
                
                return (
                  <div key={`${date}-${month}`} className="balance-grid-cell input-cell">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={value || ''}
                      onChange={(e) => handleInputChange(fieldId, e.target.value)}
                      placeholder="0.00"
                      className="balance-input"
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCreditGrid = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    return (
      <div className="credit-grid-container">
        <div className="credit-grid">
          <div className="credit-grid-header">
            <div className="credit-grid-cell header-cell">Bank</div>
            {months.map(month => (
              <div key={month} className="credit-grid-cell header-cell">{month}</div>
            ))}
            <div className="credit-grid-cell header-cell">Total</div>
          </div>
          
          {/* Bank 1 Row */}
          <div className="credit-grid-row">
            <div className="credit-grid-cell bank-cell">Bank 1</div>
            {months.map((month, index) => {
              const fieldId = `bank1_credit_month_${index + 1}`;
              const value = formData[fieldId];
              
              return (
                <div key={`bank1-${month}`} className="credit-grid-cell input-cell">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={value || ''}
                    onChange={(e) => handleInputChange(fieldId, e.target.value)}
                    placeholder="0.00"
                    className="credit-input"
                  />
                </div>
              );
            })}
            <div className="credit-grid-cell total-cell">
              {formatValue(
                Array.from({length: 12}, (_, i) => parseFloat(formData[`bank1_credit_month_${i + 1}`] || 0))
                  .reduce((sum, val) => sum + val, 0),
                'currency'
              )}
            </div>
          </div>
          
          {/* Bank 2 Row */}
          <div className="credit-grid-row">
            <div className="credit-grid-cell bank-cell">Bank 2</div>
            {months.map((month, index) => {
              const fieldId = `bank2_credit_month_${index + 1}`;
              const value = formData[fieldId];
              
              return (
                <div key={`bank2-${month}`} className="credit-grid-cell input-cell">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={value || ''}
                    onChange={(e) => handleInputChange(fieldId, e.target.value)}
                    placeholder="0.00"
                    className="credit-input"
                  />
                </div>
              );
            })}
            <div className="credit-grid-cell total-cell">
              {formatValue(
                Array.from({length: 12}, (_, i) => parseFloat(formData[`bank2_credit_month_${i + 1}`] || 0))
                  .reduce((sum, val) => sum + val, 0),
                'currency'
              )}
            </div>
          </div>
          
          {/* Total Row */}
          <div className="credit-grid-row total-row">
            <div className="credit-grid-cell bank-cell total-label">Monthly Total</div>
            {months.map((month, index) => (
              <div key={`total-${month}`} className="credit-grid-cell total-cell">
                {formatValue(calculatedValues[`total_credit_month_${index + 1}`] || 0, 'currency')}
              </div>
            ))}
            <div className="credit-grid-cell total-cell grand-total">
              {formatValue(calculatedValues.totalAnnualCredits || 0, 'currency')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentSectionData = bankAnalysisConfig.sections[currentSection];

  if (loading) {
    return (
      <div className="bank-analysis-form">
        <div className="form-header">
          <h1 className="form-title">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-analysis-form">
      {/* Form Tabs Navigation (centralized with lock functionality) */}
      <FormTabs currentFormType="bank_analysis" />
      
      <div className="form-header">
        <h1 className="form-title">{bankAnalysisConfig.title}</h1>
        <p className="form-description">{bankAnalysisConfig.description}</p>
      </div>

      <div className="form-header">        
        <div className="section-progress">
          {bankAnalysisConfig.sections.map((section, index) => (
            <div
              key={section.id}
              className={`progress-step ${index === currentSection ? 'active' : ''} ${index < currentSection ? 'completed' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">{section.title}</div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">{currentSectionData.title}</h2>
            <p className="section-description">{currentSectionData.description}</p>
          </div>

          <div className="section-content">
            {currentSectionData.id === 'monthly-balances' ? (
              renderBalanceGrid()
            ) : currentSectionData.id === 'banking-credits' ? (
              renderCreditGrid()
            ) : (
              <div className="fields-grid">
                {currentSectionData.fields.map(renderField)}
              </div>
            )}
          </div>
        </div>

        <div className="form-navigation">
          <button
            type="button"
            onClick={handlePrevSection}
            disabled={currentSection === 0}
            className="nav-button prev-button"
          >
            ← Previous
          </button>
          
          <button
            type="button"
            onClick={saveProgress}
            className="nav-button save-button"
          >
            💾 Save Progress
          </button>
          
          <button
            type="button"
            onClick={handleNextSection}
            className="nav-button next-button"
          >
            Next →
          </button>
        </div>
        
        <div className="section-info">
          Section {currentSection + 1} of {bankAnalysisConfig.sections.length}
        </div>
      </form>

      {/* Calculation Summary Panel */}
      {Object.keys(calculatedValues).length > 0 && (
        <div className="calculation-summary">
          <h3>Banking Analysis Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Average Monthly Balance:</span>
              <span className="summary-value">
                {formatValue(calculatedValues.averageMonthlyBalance, 'currency')}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Annual Credits:</span>
              <span className="summary-value">
                {formatValue(calculatedValues.totalAnnualCredits, 'currency')}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Balance Volatility:</span>
              <span className="summary-value">
                {formatValue(calculatedValues.balanceVolatility, 'percentage')}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Cash Flow Stability:</span>
              <span className="summary-value">
                {formatValue(calculatedValues.cashFlowStability, 'score')}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Concentration Risk:</span>
              <span className="summary-value">
                {formatValue(calculatedValues.bankConcentrationRisk, 'percentage')}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Operational Efficiency:</span>
              <span className="summary-value">
                {formatValue(calculatedValues.operationalEfficiency, 'score')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAnalysisForm;