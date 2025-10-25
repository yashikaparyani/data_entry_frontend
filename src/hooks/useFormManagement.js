import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Custom hook for initializing and managing forms
 * @param {string} formType - Type of form (user_form, bank_analysis, etc.)
 * @param {object} initialFormData - Initial/default form data
 * @returns {object} Form state and handlers
 */
export const useFormInitialization = (formType, initialFormData = {}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [clientId, setClientId] = useState(null);
  const [activeFormId, setActiveFormId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeForm = async () => {
      const storedClientId = localStorage.getItem('activeClientId');
      
      if (!storedClientId) {
        setError('No active client found. Please start from the Standard Form.');
        setLoading(false);
        return;
      }
      
      setClientId(storedClientId);
      
      try {
        // Check if form already exists
        const existingFormId = localStorage.getItem(`activeFormId_${formType}`);
        
        if (existingFormId) {
          // Load existing form
          console.log(`📋 Loading existing ${formType} form:`, existingFormId);
          const response = await axios.get(`${API_URL}/api/loan-officer/forms/${existingFormId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          const savedData = response.data.form.formData || initialFormData;
          setFormData(savedData);
          setActiveFormId(existingFormId);
        } else {
          // Create new form
          console.log(`🆕 Creating new ${formType} form for client:`, storedClientId);
          const formResponse = await axios.post(
            `${API_URL}/api/loan-officer/clients/${storedClientId}/forms`,
            { formType },
            { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
          );
          
          const newFormId = formResponse.data.form._id;
          const existingData = formResponse.data.form.formData || initialFormData;
          
          setActiveFormId(newFormId);
          setFormData(existingData);
          localStorage.setItem(`activeFormId_${formType}`, newFormId);
          
          console.log(`✅ ${formType} form created:`, newFormId);
        }
      } catch (err) {
        console.error(`❌ Error initializing ${formType} form:`, err);
        const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
        setError(`Error loading form: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };
    
    initializeForm();
  }, [formType, initialFormData]);

  return {
    formData,
    setFormData,
    clientId,
    activeFormId,
    loading,
    error
  };
};

/**
 * Custom hook for saving form data
 * @param {string} activeFormId - Current form ID
 * @returns {object} Save handlers and state
 */
export const useFormSave = (activeFormId) => {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const saveForm = async (formData, options = {}) => {
    if (!activeFormId) {
      setSaveError('No active form ID');
      return false;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await axios.put(
        `${API_URL}/api/loan-officer/forms/${activeFormId}`,
        { 
          formData,
          status: options.status || 'in_progress',
          ...options
        },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );

      setSaveSuccess(true);
      return true;
    } catch (err) {
      console.error('Error saving form:', err);
      setSaveError(err.response?.data?.message || err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    saveForm,
    saving,
    saveError,
    saveSuccess
  };
};
