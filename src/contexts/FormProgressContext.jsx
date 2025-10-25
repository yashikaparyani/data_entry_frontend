import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const FormProgressContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useFormProgress = () => {
  const context = useContext(FormProgressContext);
  if (!context) {
    throw new Error('useFormProgress must be used within FormProgressProvider');
  }
  return context;
};

export const FormProgressProvider = ({ children }) => {
  const [completedForms, setCompletedForms] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch completed forms from backend
  const fetchCompletedForms = async (forceClientId = null) => {
    const activeClientId = forceClientId || localStorage.getItem('activeClientId');
    
    if (!activeClientId) {
      setCompletedForms([]);
      return;
    }

    setClientId(activeClientId);
    setLoading(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/loan-officer/clients/${activeClientId}/completed-forms`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data && response.data.completedForms) {
        setCompletedForms(response.data.completedForms);
      }
    } catch (error) {
      console.error('Error fetching completed forms:', error);
      setCompletedForms([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark form as completed
  const markFormCompleted = (formType) => {
    if (!completedForms.includes(formType)) {
      setCompletedForms(prev => [...prev, formType]);
    }
  };

  // Reset progress (for new client)
  const resetProgress = () => {
    setCompletedForms([]);
    setClientId(null);
  };

  // Initial load
  useEffect(() => {
    fetchCompletedForms();
  }, []);

  const value = {
    completedForms,
    clientId,
    loading,
    fetchCompletedForms,
    markFormCompleted,
    resetProgress
  };

  return (
    <FormProgressContext.Provider value={value}>
      {children}
    </FormProgressContext.Provider>
  );
};
