import axios from 'axios';
import { getNextForm } from '../config/formSequence';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Helper function to complete current form and navigate to next form
 * @param {string} currentFormType - Current form type (user_form, bank_analysis, etc.)
 * @param {string} formId - Current form ID from backend
 * @param {object} formData - Form data to save
 * @param {function} onSuccess - Callback on successful completion
 * @param {function} onError - Callback on error
 */
export const completeFormAndNavigate = async (
  currentFormType,
  formId,
  formData,
  onSuccess = null,
  onError = null
) => {
  try {
    const token = localStorage.getItem('token');
    const clientId = localStorage.getItem('activeClientId');

    if (!clientId) {
      throw new Error('No active client found');
    }

    // 1. Save the form data with completion status
    await axios.put(
      `${API_URL}/api/loan-officer/forms/${formId}/save`,
      { 
        formData,
        status: 'completed',
        isCompleted: true,
        completionPercentage: 100
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    console.log('✅ Form marked as completed:', currentFormType);

    // 2. Get next form in sequence
    const nextForm = getNextForm(currentFormType);

    if (onSuccess) {
      onSuccess(nextForm);
    }

    // 3. Navigate to next form or dashboard
    if (nextForm) {
      // Small delay for better UX
      setTimeout(() => {
        window.location.href = nextForm.route;
      }, 500);
      return { success: true, nextForm };
    } else {
      // All forms completed - go to dashboard
      setTimeout(() => {
        window.location.href = '/loan-officer/dashboard';
      }, 500);
      return { success: true, allCompleted: true };
    }
  } catch (error) {
    console.error('Error completing form:', error);
    
    if (onError) {
      onError(error);
    }
    
    throw error;
  }
};

/**
 * Save form progress without completing
 * @param {string} formId - Form ID
 * @param {object} formData - Form data to save
 */
export const saveFormProgress = async (formId, formData) => {
  try {
    const token = localStorage.getItem('token');

    const response = await axios.put(
      `${API_URL}/api/loan-officer/forms/${formId}/save`,
      { 
        formData,
        status: 'in_progress' 
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error saving form progress:', error);
    throw error;
  }
};

/**
 * Initialize form - create or load existing
 * @param {string} formType - Form type
 * @returns {object} Form data and ID
 */
export const initializeForm = async (formType) => {
  try {
    const token = localStorage.getItem('token');
    const clientId = localStorage.getItem('activeClientId');

    if (!clientId) {
      throw new Error('No active client found');
    }

    // Check if form already exists
    const existingFormId = localStorage.getItem(`activeFormId_${formType}`);
    
    if (existingFormId) {
      // Load existing form
      const response = await axios.get(
        `${API_URL}/api/loan-officer/forms/${existingFormId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      return {
        formId: existingFormId,
        formData: response.data.form.formData || {},
        status: response.data.form.status
      };
    } else {
      // Create new form
      const response = await axios.post(
        `${API_URL}/api/loan-officer/clients/${clientId}/forms`,
        { formType },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      const newFormId = response.data.form._id;
      localStorage.setItem(`activeFormId_${formType}`, newFormId);
      
      return {
        formId: newFormId,
        formData: response.data.form.formData || {},
        status: response.data.form.status || 'in_progress'
      };
    }
  } catch (error) {
    console.error('Error initializing form:', error);
    throw error;
  }
};
