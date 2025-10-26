import React, { useState, useEffect } from 'react';
import { 
  expertScorecardConfig, 
  calculateTotalScore, 
  getRiskCategory, 
  getParametersByCategory 
} from '../data/expertScorecardConfig';
import { completeFormAndNavigate } from '../utils/formHelpers';
import './ExpertScorecardForm.css';
import FormTabs from './FormTabs';
import axios from 'axios';

const ExpertScorecardForm = () => {
  const [formData, setFormData] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [riskCategory, setRiskCategory] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
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
        const existingFormId = localStorage.getItem('activeFormId_expert_scorecard');
        
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
            formType: 'expert_scorecard'
          }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          const newFormId = formResponse.data.form._id;
          const existingFormData = formResponse.data.form.formData || {};
          
          setActiveFormId(newFormId);
          localStorage.setItem('activeFormId_expert_scorecard', newFormId);
          
          // Use existing data if available
          if (Object.keys(existingFormData).length > 0) {
            setFormData(existingFormData);
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

  // Get categorized parameters
  const { qualitative, quantitative, qualitativeWeight, quantitativeWeight } = getParametersByCategory();

  // Calculate score and risk category whenever form data changes
  useEffect(() => {
    const score = calculateTotalScore(formData);
    const risk = getRiskCategory(score);
    setTotalScore(score);
    setRiskCategory(risk);
  }, [formData]);

  const handleInputChange = (parameterName, value) => {
    setFormData(prev => ({
      ...prev,
      [parameterName]: value
    }));
    
    // Clear error for this field
    if (errors[parameterName]) {
      setErrors(prev => ({
        ...prev,
        [parameterName]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    expertScorecardConfig.parameters.forEach(parameter => {
      if (parameter.required && !formData[parameter.name]) {
        newErrors[parameter.name] = `${parameter.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const completeFormAndRedirect = async () => {
    if (!clientId || !activeFormId) {
      alert('❌ No active client or form found.');
      return;
    }

    try {
      const submissionData = {
        ...formData,
        totalScore,
        riskCategory: riskCategory.name,
        timestamp: new Date().toISOString(),
        assessmentType: 'Expert Scorecard'
      };

      // Use helper function to complete and navigate to next form
      await completeFormAndNavigate(
        'expert_scorecard',
        activeFormId,
        submissionData,
        (nextForm) => {
          if (nextForm) {
            alert(`✓ Expert Scorecard completed!\nTotal Score: ${totalScore}\nRisk Category: ${riskCategory.name}\n\nRedirecting to ${nextForm.name}...`);
          } else {
            alert(`✓ Expert Scorecard completed!\nTotal Score: ${totalScore}\nRisk Category: ${riskCategory.name}\n\nAll forms completed!`);
          }
        },
        (error) => {
          console.error('Complete error:', error);
          alert('❌ Error completing form: ' + (error.response?.data?.message || error.message));
        }
      );
    } catch (error) {
      console.error('Complete error:', error);
      alert('❌ Error completing form');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitted(true);
      // Complete form and redirect to next
      completeFormAndRedirect();
    }
  };

  const resetForm = () => {
    setFormData({});
    setErrors({});
    setIsSubmitted(false);
  };

  const renderParameterSection = (parameters, sectionTitle, sectionWeight) => (
    <div className="scorecard-section">
      <h3 className="section-header">
        {sectionTitle}
        <span className="section-weight">Weight: {sectionWeight}%</span>
      </h3>
      
      {parameters.map((parameter) => (
        <div key={parameter.name} className="parameter-container">
          <div className="parameter-header">
            <label className="parameter-label">
              {parameter.label}
              {parameter.required && <span className="required">*</span>}
            </label>
            <span className="parameter-weight">{parameter.weight}%</span>
          </div>
          
          <select
            className={`parameter-select ${errors[parameter.name] ? 'error' : ''}`}
            value={formData[parameter.name] || ''}
            onChange={(e) => handleInputChange(parameter.name, e.target.value)}
          >
            <option value="">Select an option...</option>
            {parameter.options.map((option, index) => (
              <option key={index} value={option.label}>
                {option.label} ({option.score} points)
              </option>
            ))}
          </select>
          
          {errors[parameter.name] && (
            <div className="error-message">{errors[parameter.name]}</div>
          )}
          
          <div className="parameter-rationale">
            <strong>Rationale:</strong> {parameter.rationale}
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="expert-scorecard-container">
        <div className="scorecard-header">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="expert-scorecard-container">
      {/* Form Tabs Navigation (centralized) */}
      <FormTabs currentFormType="expert_scorecard" />

      <div className="scorecard-header">
        <h1>{expertScorecardConfig.title}</h1>
        <p className="scorecard-description">{expertScorecardConfig.description}</p>
      </div>

      {/* Score Summary Card */}
      <div className="score-summary-card">
        <div className="score-display">
          <div className="total-score">
            <h3>Total Score</h3>
            <div className="score-value">{totalScore}</div>
            <div className="score-range">out of 100</div>
          </div>
          
          {riskCategory && (
            <div 
              className="risk-category"
              style={{ 
                color: riskCategory.color,
                backgroundColor: riskCategory.backgroundColor 
              }}
            >
              <h4>{riskCategory.name}</h4>
              <p>{riskCategory.description}</p>
              <div className="score-range-info">
                Score Range: {riskCategory.range[0]}-{riskCategory.range[1]}
              </div>
            </div>
          )}
        </div>
        
        <div className="scoring-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Math.min(totalScore, 100)}%`,
                backgroundColor: riskCategory?.color || '#6c757d'
              }}
            ></div>
          </div>
          <div className="progress-labels">
            <span>30</span>
            <span>50</span>
            <span>70</span>
            <span>85</span>
            <span>100</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="scorecard-form">
        {/* Qualitative Parameters Section */}
        {renderParameterSection(qualitative, "Qualitative Parameters", qualitativeWeight)}
        
        {/* Quantitative Parameters Section */}
        {renderParameterSection(quantitative, "Quantitative Parameters", quantitativeWeight)}
        
        {/* Sales Officer Comments Section */}
        <div className="scorecard-section">
          <h3 className="section-header">Sales Officer Assessment</h3>
          
          <div className="parameter-container">
            <label className="parameter-label">
              {expertScorecardConfig.salesOfficerField.label}
            </label>
            
            <textarea
              className="sales-officer-textarea"
              placeholder={expertScorecardConfig.salesOfficerField.placeholder}
              value={formData[expertScorecardConfig.salesOfficerField.name] || ''}
              onChange={(e) => handleInputChange(expertScorecardConfig.salesOfficerField.name, e.target.value)}
              maxLength={expertScorecardConfig.salesOfficerField.maxLength}
              rows={4}
            />
            
            <div className="char-count">
              {(formData[expertScorecardConfig.salesOfficerField.name] || '').length} / {expertScorecardConfig.salesOfficerField.maxLength} characters
            </div>
          </div>
        </div>

        {/* Risk Assessment Summary */}
        <div className="risk-assessment-summary">
          <h3>Risk Assessment Summary</h3>
          <div className="risk-grid">
            {Object.entries(expertScorecardConfig.riskCategories).map(([categoryName, categoryData]) => (
              <div 
                key={categoryName}
                className={`risk-item ${riskCategory?.name === categoryName ? 'active' : ''}`}
                style={{ borderColor: categoryData.color }}
              >
                <div className="risk-name" style={{ color: categoryData.color }}>
                  {categoryName}
                </div>
                <div className="risk-range">
                  {categoryData.range[0]}-{categoryData.range[1]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={resetForm}
            className="btn-secondary"
          >
            Reset Form
          </button>
          
          <button 
            type="submit" 
            className="btn-primary"
          >
            Next →
          </button>
        </div>
      </form>

      {/* Completion Status */}
      {isSubmitted && (
        <div className="submission-success">
          <h3>✅ Assessment Completed Successfully!</h3>
          <div className="submission-summary">
            <p><strong>Final Score:</strong> {totalScore} points</p>
            <p><strong>Risk Category:</strong> {riskCategory.name}</p>
            <p><strong>Recommendation:</strong> {riskCategory.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertScorecardForm;