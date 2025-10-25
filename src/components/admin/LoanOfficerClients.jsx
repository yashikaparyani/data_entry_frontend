import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './LoanOfficerClients.css';

const LoanOfficerClients = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientsData, setClientsData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLoanOfficerClients = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/users/${userId}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setClientsData(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching loan officer clients:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else if (err.response?.status === 404) {
        setError('Loan officer not found');
      } else {
        setError('Failed to load clients');
      }
    } finally {
      setLoading(false);
    }
  }, [userId, navigate]);

  useEffect(() => {
    fetchLoanOfficerClients();
  }, [fetchLoanOfficerClients]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (client) => {
    if (client.totalForms === 0) {
      return <span className="status-badge no-forms">No Forms</span>;
    } else if (client.completedForms === client.totalForms) {
      return <span className="status-badge all-completed">All Completed</span>;
    } else if (client.completedForms > 0) {
      return <span className="status-badge partial-completed">Partially Completed</span>;
    } else {
      return <span className="status-badge in-progress">In Progress</span>;
    }
  };

  const filteredClients = clientsData?.clients?.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.clientId?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="loan-officer-clients-loading">
        <div className="loading-spinner"></div>
        <p>Loading clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loan-officer-clients-error">
        <h2>Error Loading Clients</h2>
        <p>{error}</p>
        <button onClick={fetchLoanOfficerClients} className="retry-btn">
          Retry
        </button>
        <button onClick={() => navigate('/admin/users')} className="back-btn">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="loan-officer-clients">
      {/* Header */}
      <header className="clients-header">
        <div className="header-content">
          <div className="header-top">
            <div className="header-left">
              <button onClick={() => navigate('/admin/users')} className="back-btn">
                ← Back to Users
              </button>
              <div className="header-info">
                <h1>👥 Loan Officer's Clients</h1>
                <p className="officer-name">
                  <strong>{clientsData?.loanOfficer?.name}</strong>
                  <span className="officer-email">({clientsData?.loanOfficer?.email})</span>
                </p>
              </div>
            </div>
            <div className="header-stats">
              <div className="stat-card">
                <span className="stat-value">{clientsData?.statistics?.totalClients || 0}</span>
                <span className="stat-label">Total Clients</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{clientsData?.statistics?.activeClients || 0}</span>
                <span className="stat-label">Active Clients</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{clientsData?.statistics?.totalForms || 0}</span>
                <span className="stat-label">Total Forms</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{clientsData?.statistics?.completedForms || 0}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={fetchLoanOfficerClients} className="refresh-btn">
              <span className="btn-icon">🔄</span>
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search clients by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Clients Table */}
      <div className="clients-container">
        {filteredClients.length === 0 ? (
          <div className="no-clients">
            <h3>No clients found</h3>
            <p>
              {searchTerm 
                ? 'No clients match your search criteria.' 
                : 'This loan officer has not created any clients yet.'}
            </p>
          </div>
        ) : (
          <div className="clients-table-container">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Client Info</th>
                  <th>Client ID</th>
                  <th>Contact</th>
                  <th>Created Date</th>
                  <th>Forms Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client._id} className="client-row">
                    <td className="client-info">
                      <div className="client-avatar">
                        {client.name?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div className="client-details">
                        <span className="client-name">{client.name || 'N/A'}</span>
                        <span className="client-status-text">{client.status}</span>
                      </div>
                    </td>
                    <td className="client-id">
                      <code>{client.clientId}</code>
                    </td>
                    <td className="contact-info">
                      {client.email && <div className="email">{client.email}</div>}
                      {client.phone && <div className="phone">{client.phone}</div>}
                      {!client.email && !client.phone && <span className="no-contact">No contact info</span>}
                    </td>
                    <td className="created-date">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="forms-stats">
                      <div className="forms-numbers">
                        <span className="total-forms">
                          Total: {client.totalForms}
                        </span>
                        <span className="completed-forms">
                          Completed: {client.completedForms}
                        </span>
                        {client.inProgressForms > 0 && (
                          <span className="in-progress-forms">
                            In Progress: {client.inProgressForms}
                          </span>
                        )}
                      </div>
                      {client.totalForms > 0 && (
                        <div className="progress-bar-small">
                          <div 
                            className="progress-fill-small" 
                            style={{ width: `${client.completionPercentage}%` }}
                          ></div>
                        </div>
                      )}
                    </td>
                    <td className="client-status">
                      {getStatusBadge(client)}
                    </td>
                    <td className="actions">
                      {client.totalForms > 0 ? (
                        <button 
                          className="view-forms-btn"
                          onClick={() => navigate(`/admin/clients/${client._id}/forms`)}
                          title="View client's forms"
                        >
                          📋 View Forms
                        </button>
                      ) : (
                        <span className="no-forms-text">No forms yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="clients-summary">
        <p>
          Showing {filteredClients.length} of {clientsData?.clients?.length || 0} clients
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </p>
      </div>
    </div>
  );
};

export default LoanOfficerClients;
