import React from 'react';
import FormTabs from '../FormTabs';
import './FormContainer.css';

/**
 * Universal form container with tabs
 * Wraps all forms with consistent layout and tab navigation
 */
const FormContainer = ({ 
  formType,
  title,
  description,
  loading = false,
  error = null,
  children 
}) => {
  if (loading) {
    return (
      <div className="form-container">
        <FormTabs currentFormType={formType} />
        <div className="form-content">
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading {title}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="form-container">
        <FormTabs currentFormType={formType} />
        <div className="form-content">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Form</h3>
            <p>{error}</p>
            <button 
              className="btn-back"
              onClick={() => window.location.href = '/loan-officer/dashboard'}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      {/* Universal tabs for all forms */}
      <FormTabs currentFormType={formType} />
      
      {/* Form header */}
      <div className="form-header-section">
        <h1 className="form-title">{title}</h1>
        {description && <p className="form-description">{description}</p>}
      </div>
      
      {/* Form content */}
      <div className="form-content">
        {children}
      </div>
    </div>
  );
};

export default FormContainer;
