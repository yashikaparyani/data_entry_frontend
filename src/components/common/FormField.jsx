import React from 'react';
import './FormField.css';

/**
 * Reusable form field component
 * Handles different input types with consistent styling
 */
const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  error = null,
  options = [],
  placeholder = '',
  disabled = false,
  calculated = false,
  helpText = '',
  min,
  max,
  step
}) => {
  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled || calculated}
            className={`form-input ${error ? 'error' : ''} ${calculated ? 'calculated' : ''}`}
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled || calculated}
            placeholder={placeholder}
            className={`form-input ${error ? 'error' : ''} ${calculated ? 'calculated' : ''}`}
            rows={4}
          />
        );

      case 'radio':
        return (
          <div className="radio-group">
            {options.map((option, index) => (
              <label key={index} className="radio-label">
                <input
                  type="radio"
                  name={name}
                  value={option.value || option}
                  checked={value === (option.value || option)}
                  onChange={onChange}
                  required={required}
                  disabled={disabled || calculated}
                />
                <span className="radio-text">{option.label || option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="checkbox-label">
            <input
              type="checkbox"
              name={name}
              checked={!!value}
              onChange={(e) => onChange({ ...e, target: { ...e.target, name, value: e.target.checked } })}
              disabled={disabled || calculated}
            />
            <span className="checkbox-text">{label}</span>
          </label>
        );

      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled || calculated}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={`form-input ${error ? 'error' : ''} ${calculated ? 'calculated' : ''}`}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className={`form-field ${error ? 'has-error' : ''}`}>
        {renderInput()}
        {error && <span className="error-message">{error}</span>}
        {helpText && <span className="help-text">{helpText}</span>}
      </div>
    );
  }

  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="required-indicator">*</span>}
        {calculated && <span className="calculated-badge">Auto-calculated</span>}
      </label>
      {renderInput()}
      {error && <span className="error-message">{error}</span>}
      {helpText && <span className="help-text">{helpText}</span>}
      {calculated && (
        <span className="calculation-note">
          This field is automatically calculated
        </span>
      )}
    </div>
  );
};

export default FormField;
