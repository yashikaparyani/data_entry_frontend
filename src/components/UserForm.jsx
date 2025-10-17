import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { formConfig } from '../data/formConfig';
import FormNavigation from './FormNavigation';
import axios from 'axios';
import './UserForm.css';

const UserForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formId } = useParams(); // For resume functionality
  const [formData, setFormData] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(formConfig.totalSteps);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [clientId, setClientId] = useState(null);
  const [isLoanOfficer, setIsLoanOfficer] = useState(false);

  // Check if user is loan officer
  useEffect(() => {
    if (user?.role === 'loan_officer') {
      setIsLoanOfficer(true);
    }
  }, [user]);

  const fetchFormData = useCallback(async () => {
    // Skip fetch if user is not authenticated
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      if (isLoanOfficer && formId) {
        // Loan officer: fetch existing form data by formId
        const response = await axios.get(`/api/loan-officer/forms/${formId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = response.data.form;
        setFormData(data.formData || {});
        setCurrentStep(data.currentStep || 1);
        setTotalSteps(formConfig.totalSteps);
        setClientId(data.client._id);
      } else if (!isLoanOfficer) {
        // Regular user: fetch from old form data route
        const response = await axios.get('/api/form/data/User-Form');
        const data = response.data.formData;
        setFormData(data.responses || {});
        setCurrentStep(data.currentStep || 1);
        setTotalSteps(formConfig.totalSteps);
      } else {
        // New form for loan officer - initialize empty
        setFormData({});
        setCurrentStep(1);
        setTotalSteps(formConfig.totalSteps);
      }
    } catch (error) {
      // Only log error if it's not a 404 (no existing form data)
      if (error.response?.status !== 404) {
        console.error('Error fetching form data:', error);
      }
      // Initialize empty form if no data exists (404 is expected for new forms)
      setFormData({});
      setCurrentStep(1);
      setTotalSteps(formConfig.totalSteps);
    } finally {
      setLoading(false);
    }
  }, [user, isLoanOfficer, formId]); // Close useCallback with dependency array

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveFormData = async () => {
    setSaving(true);
    setMessage('');

    try {
      await axios.post('/api/form/save', {
        formName: 'User-Form',
        responses: formData,
        currentStep,
        totalSteps: totalSteps,
        isCompleted: currentStep === totalSteps
      });

      setMessage('Form data saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving form data');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const validateCurrentStep = () => {
    const currentStepFields = formConfig.steps[currentStep - 1]?.fields || [];
    const requiredFields = currentStepFields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => {
      // Check if field should be shown based on conditional logic
      if (field.conditional && formData[field.conditional] !== field.conditionalValue) {
        return false; // Field is not required if conditional is not met
      }
      return !formData[field.name] || formData[field.name] === '';
    });

    return missingFields;
  };

  const saveForm = async () => {
    if (!formData.customerName && isLoanOfficer) {
      setMessage('Please enter customer name first');
      return;
    }

    setSaving(true);
    try {
      if (isLoanOfficer) {
        // Create client first if it doesn't exist
        if (!clientId && formData.customerName) {
          const clientResponse = await axios.post('/api/loan-officer/clients', {
            name: formData.customerName,
            email: formData.email || '',
            phone: formData.phone || ''
          }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const newClientId = clientResponse.data.client._id;
          setClientId(newClientId);
          
          // Create form for this client - use 'user_form' 
          const formResponse = await axios.post(`/api/loan-officer/clients/${newClientId}/forms`, {
            formType: 'user_form'
          }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          const newFormId = formResponse.data.form._id;
          
          // Save the form data using PUT method
          await axios.put(`/api/loan-officer/forms/${newFormId}/save`, {
            formData,
            currentStep,
            completionPercentage: Math.round((currentStep / totalSteps) * 100)
          }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          // Update URL to include formId for future saves
          window.history.replaceState(null, '', `/form/${newFormId}`);
          
        } else if (formId) {
          // Update existing form using PUT method
          await axios.put(`/api/loan-officer/forms/${formId}/save`, {
            formData,
            currentStep,
            completionPercentage: Math.round((currentStep / totalSteps) * 100)
          }, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
        }
        setMessage('Form saved successfully!');
      } else {
        // Regular user save
        await axios.post('/api/form/save', {
          formName: 'User-Form',
          responses: formData,
          currentStep,
          totalSteps: totalSteps,
          isCompleted: false
        });
        setMessage('Form saved successfully!');
      }
    } catch (error) {
      setMessage('Error saving form');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    const missingFields = validateCurrentStep();
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => field.label).join(', ');
      setMessage(`Please fill in the following required fields: ${fieldNames}`);
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      saveFormData();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitForm = async () => {
    // Validate all steps before submission
    let allMissingFields = [];
    
    for (let step = 1; step <= totalSteps; step++) {
      const stepFields = formConfig.steps[step - 1]?.fields || [];
      const requiredFields = stepFields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => {
        if (field.conditional && formData[field.conditional] !== field.conditionalValue) {
          return false;
        }
        return !formData[field.name] || formData[field.name] === '';
      });
      allMissingFields = [...allMissingFields, ...missingFields];
    }

    if (allMissingFields.length > 0) {
      const fieldNames = allMissingFields.map(field => field.label).join(', ');
      setMessage(`Please complete all required fields before submitting: ${fieldNames}`);
      return;
    }

    setSubmitting(true);
    try {
      if (isLoanOfficer && (clientId || formId)) {
        // Loan officer final submission
        const formIdToSubmit = formId || clientId; // Use formId if available
        await axios.post(`/api/loan-officer/forms/${formIdToSubmit}/submit`, {
          formData,
          currentStep: totalSteps + 1,
          completionPercentage: 100
        }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setMessage('Form submitted successfully!');
        setTimeout(() => navigate('/loan-officer/dashboard'), 2000);
      } else {
        // Regular user submission
        await axios.post('/api/form/save', {
          formName: 'User-Form',
          responses: formData,
          currentStep,
          totalSteps: totalSteps,
          isCompleted: true
        });
        setMessage('Form submitted successfully!');
      }
    } catch (error) {
      setMessage('Error submitting form');
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading form...</p>
      </div>
    );
  }

  return (
    <div className="user-form">
      <FormNavigation />
      <main className="form-main">
        <div className="form-container">
          {/* Compact Step Indicators - Single Row */}
          <div className="compact-step-indicators">
            {formConfig.steps.map((step, index) => (
              <div 
                key={index} 
                className={`compact-step ${currentStep === index + 1 ? 'active' : ''} ${currentStep > index + 1 ? 'completed' : ''}`}
              >
                <div className="step-circle">{index + 1}</div>
                <div className="step-label">{step.title}</div>
              </div>
            ))}
          </div>

          {/* Message */}
          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          {/* Form Content */}
          <div className="form-content">
            <div className="form-step">
              <h2>Step {currentStep}: {formConfig.steps[currentStep - 1]?.title}</h2>
              
              <div className="form-fields">
                {formConfig.steps[currentStep - 1]?.fields.map((field) => {
                  // Check if field should be shown based on conditional logic
                  if (field.conditional && formData[field.conditional] !== field.conditionalValue) {
                    return null;
                  }

                  return (
                    <div key={field.name} className="form-group">
                      <label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="required">*</span>}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select
                          id={field.name}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          required={field.required}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'radio' ? (
                        <div className="radio-group">
                          {field.options.map((option) => (
                            <label key={option} className="radio-option">
                              <input
                                type="radio"
                                name={field.name}
                                value={option}
                                checked={formData[field.name] === option}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                required={field.required}
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          id={field.name}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          required={field.required}
                          rows={4}
                        />
                      ) : (
                        <input
                          type={field.type}
                          id={field.name}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          required={field.required}
                          step={field.step}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="form-navigation">
            <button 
              onClick={prevStep} 
              disabled={currentStep === 1}
              className="nav-btn prev-btn"
            >
              ← Previous
            </button>

            <div className="nav-center">
              <button 
                onClick={isLoanOfficer ? saveForm : saveFormData}
                disabled={saving}
                className="save-btn"
              >
                {saving ? 'Saving...' : 'Save Progress'}
              </button>
              
              {isLoanOfficer && (
                <button 
                  onClick={submitForm}
                  disabled={submitting}
                  className="submit-btn final-submit"
                >
                  {submitting ? 'Submitting...' : 'Final Submit ✓'}
                </button>
              )}
            </div>

            {currentStep === totalSteps && !isLoanOfficer ? (
              <button 
                onClick={submitForm}
                disabled={submitting}
                className="nav-btn submit-btn"
              >
                {submitting ? 'Submitting...' : 'Submit Form ✓'}
              </button>
            ) : !isLoanOfficer ? (
              <button 
                onClick={nextStep}
                className="nav-btn next-btn"
              >
                Next →
              </button>
            ) : (
              <button 
                onClick={nextStep}
                className="nav-btn next-btn"
              >
                Next →
              </button>
            )}
          </div>

          {/* Step Summary */}
          <div className="step-summary">
            <h3>Form Progress</h3>
            <div className="step-list">
              {formConfig.steps.map((step, index) => (
                <div key={index} className={`step-item ${currentStep === index + 1 ? 'current' : ''} ${currentStep > index + 1 ? 'completed' : ''}`}>
                  <span className="step-number">{index + 1}</span>
                  <span className="step-name">{step.title}</span>
                  {currentStep > index + 1 && <span className="step-check">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserForm;
