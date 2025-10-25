import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './ClientFormsDetail.css';

const ClientFormsDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientData, setClientData] = useState(null);
  const [selectedFormType, setSelectedFormType] = useState('all');
  const [expandedForm, setExpandedForm] = useState(null);

  const fetchClientForms = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/clients/${clientId}/forms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setClientData(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching client forms:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else if (err.response?.status === 404) {
        setError('Client not found');
      } else {
        setError('Failed to load client forms');
      }
    } finally {
      setLoading(false);
    }
  }, [clientId, navigate]);

  useEffect(() => {
    fetchClientForms();
  }, [fetchClientForms]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFormTypeLabel = (formType) => {
    const labels = {
      'user_form': '👤 User Form',
      'mse_assessment': '🏢 MSE Credit Assessment',
      'financial_analysis': '📊 Financial Analysis',
      'bank_analysis': '🏦 Bank Analysis',
      'expert_scorecard': '🎯 Expert Scorecard',
      'credit_app_memo': '📋 Credit App Memo',
      'output_sheet': '📄 Output Sheet'
    };
    return labels[formType] || formType;
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return <span className="form-status-badge completed">✓ Completed</span>;
    } else if (status === 'in_progress') {
      return <span className="form-status-badge in-progress">⏳ In Progress</span>;
    } else {
      return <span className="form-status-badge not-started">○ Not Started</span>;
    }
  };

  const toggleFormExpansion = (formId) => {
    setExpandedForm(expandedForm === formId ? null : formId);
  };

  const renderFormData = (formData) => {
    if (!formData || typeof formData !== 'object') {
      return <p className="no-data">No data available</p>;
    }

    const entries = Object.entries(formData);
    if (entries.length === 0) {
      return <p className="no-data">No data submitted yet</p>;
    }

    return (
      <div className="form-data-grid">
        {entries.map(([key, value]) => (
          <div key={key} className="form-data-item">
            <span className="form-data-key">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
            <span className="form-data-value">
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const filteredForms = selectedFormType === 'all' 
    ? clientData?.forms || []
    : clientData?.forms?.filter(form => form.formType === selectedFormType) || [];

  if (loading) {
    return (
      <div className="client-forms-loading">
        <div className="loading-spinner"></div>
        <p>Loading client forms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-forms-error">
        <h2>Error Loading Client Forms</h2>
        <p>{error}</p>
        <button onClick={fetchClientForms} className="retry-btn">
          Retry
        </button>
        <button onClick={() => navigate(-1)} className="back-btn">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="client-forms-detail">
      {/* Header */}
      <header className="forms-header">
        <div className="header-content">
          <div className="header-top">
            <div className="header-left">
              <button onClick={() => navigate(-1)} className="back-btn">
                ← Back
              </button>
              <div className="header-info">
                <h1>📋 Client Forms</h1>
                <div className="client-info-header">
                  <p className="client-name">
                    <strong>{clientData?.client?.name}</strong>
                    <span className="client-id">({clientData?.client?.clientId})</span>
                  </p>
                  {clientData?.client?.loanOfficer && (
                    <p className="loan-officer-info">
                      Loan Officer: <strong>{clientData.client.loanOfficer.name || clientData.client.loanOfficer.username}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="header-stats">
              <div className="stat-card">
                <span className="stat-value">{clientData?.statistics?.totalForms || 0}</span>
                <span className="stat-label">Total Forms</span>
              </div>
              <div className="stat-card completed">
                <span className="stat-value">{clientData?.statistics?.completedForms || 0}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-card in-progress">
                <span className="stat-value">{clientData?.statistics?.inProgressForms || 0}</span>
                <span className="stat-label">In Progress</span>
              </div>
              <div className="stat-card not-started">
                <span className="stat-value">{clientData?.statistics?.notStartedForms || 0}</span>
                <span className="stat-label">Not Started</span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={fetchClientForms} className="refresh-btn">
              <span className="btn-icon">🔄</span>
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-container">
          <label htmlFor="formTypeFilter">Filter by Form Type:</label>
          <select
            id="formTypeFilter"
            value={selectedFormType}
            onChange={(e) => setSelectedFormType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Forms ({clientData?.forms?.length || 0})</option>
            {Object.keys(clientData?.formsByType || {}).map((formType) => (
              <option key={formType} value={formType}>
                {getFormTypeLabel(formType)} ({clientData.formsByType[formType].length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Forms List */}
      <div className="forms-container">
        {filteredForms.length === 0 ? (
          <div className="no-forms">
            <h3>No forms found</h3>
            <p>
              {selectedFormType === 'all' 
                ? 'This client has not submitted any forms yet.' 
                : `No ${getFormTypeLabel(selectedFormType)} submissions found.`}
            </p>
          </div>
        ) : (
          <div className="forms-list">
            {filteredForms.map((form) => (
              <div key={form._id} className="form-card">
                <div className="form-card-header" onClick={() => toggleFormExpansion(form._id)}>
                  <div className="form-type-info">
                    <h3>{getFormTypeLabel(form.formType)}</h3>
                    <span className="form-id">ID: {form._id}</span>
                  </div>
                  <div className="form-meta">
                    {getStatusBadge(form.status)}
                    <span className="form-date">
                      Updated: {formatDate(form.updatedAt)}
                    </span>
                    <button className="expand-btn">
                      {expandedForm === form._id ? '▼' : '▶'}
                    </button>
                  </div>
                </div>

                {expandedForm === form._id && (
                  <div className="form-card-body">
                    <div className="form-details-meta">
                      <div className="meta-item">
                        <strong>Created:</strong> {formatDate(form.createdAt)}
                      </div>
                      <div className="meta-item">
                        <strong>Last Updated:</strong> {formatDate(form.updatedAt)}
                      </div>
                      <div className="meta-item">
                        <strong>Current Step:</strong> {form.currentStep || 1} / {form.totalSteps || 1}
                      </div>
                      <div className="meta-item">
                        <strong>Status:</strong> {form.statusLabel}
                      </div>
                    </div>

                    <div className="form-data-section">
                      <h4>Form Data:</h4>
                      {renderFormData(form.formData)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="forms-summary">
        <p>
          Showing {filteredForms.length} form(s)
          {selectedFormType !== 'all' && ` of type "${getFormTypeLabel(selectedFormType)}"`}
        </p>
      </div>
    </div>
  );
};

export default ClientFormsDetail;
