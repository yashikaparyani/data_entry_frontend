import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoanOfficerDashboard.css';

const LoanOfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = useCallback(async () => {
    try {
      // Check if we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('🔍 Fetching clients with token:', token.substring(0, 20) + '...');
      
      const response = await axios.get('/api/loan-officer/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Clients fetched successfully:', response.data);
      setClients(response.data.clients);
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      
      if (error.response?.status === 401) {
        console.error('Authentication failed, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert('Error fetching clients: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Generate client ID from customer name + loan officer name
  const generateClientId = (customerName, loanOfficerName) => {
    const cleanCustomer = customerName.replace(/\s+/g, '').toLowerCase();
    const cleanOfficer = loanOfficerName.replace(/\s+/g, '').toLowerCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${cleanCustomer}_${cleanOfficer}_${timestamp}`;
  };

  const handleNewForm = () => {
    // Redirect to standard form for new client
    navigate('/form'); // This will be the standard form
  };

  const handleResumeForm = (clientId, form) => {
    // Store active client and form IDs in localStorage
    localStorage.setItem('activeClientId', clientId);
    localStorage.setItem(`activeFormId_${form.formType}`, form._id);
    
    // Navigate to appropriate form based on formType
    const formRoutes = {
      'user_form': `/form/${form._id}`,
      'bank_analysis': '/bank-analysis',
      'financial_analysis': '/financial-analysis',
      'expert_scorecard': '/expert-scorecard',
      'credit_app_memo': '/credit-app-memo',
      'output_sheet': '/output-analysis'
    };
    
    const route = formRoutes[form.formType] || `/form/${form._id}`;
    navigate(route);
  };

  const handleViewClient = () => {
    // Navigate to client detail view (you can implement a detail page later)
    alert('View client details - Feature coming soon!');
    // navigate(`/loan-officer/clients/${clientId}`);
  };

  const handleDeleteClient = async (clientId, clientName) => {
    if (window.confirm(`Are you sure you want to delete ${clientName}? This will delete all their forms too.`)) {
      try {
        await axios.delete(`/api/loan-officer/clients/${clientId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        alert('Client deleted successfully!');
        fetchClients(); // Refresh the list
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const getFormStatus = (client) => {
    // All 6 required forms
    const requiredForms = [
      'user_form',
      'bank_analysis',
      'financial_analysis',
      'expert_scorecard',
      'credit_app_memo',
      'output_sheet'
    ];
    
    if (!client.forms || client.forms.length === 0) {
      return { status: 'No Forms', color: '#6c757d', completedCount: 0, totalCount: 6 };
    }
    
    // Count completed and total forms
    const completedForms = client.forms.filter(f => f.status === 'completed');
    const completedCount = completedForms.length;
    
    // Check if all 6 forms are completed
    const allFormsCompleted = requiredForms.every(formType => 
      client.forms.some(f => f.formType === formType && f.status === 'completed')
    );
    
    if (allFormsCompleted) {
      return { status: 'Complete', color: '#28a745', completedCount: 6, totalCount: 6 };
    } else if (completedCount > 0) {
      return { status: 'Partial Complete', color: '#ffc107', completedCount, totalCount: 6 };
    } else {
      return { status: 'Incomplete', color: '#dc3545', completedCount: 0, totalCount: 6 };
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.clientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="loan-officer-dashboard">
      <div className="dashboard-header">
        <h1>📊 Loan Officer Dashboard</h1>
        <p className="welcome-text">Welcome back, <strong>{user?.name}!</strong></p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card stat-total">
          <div className="stat-number">{clients.length}</div>
          <div className="stat-label">Total Clients</div>
        </div>
        <div className="stat-card stat-incomplete">
          <div className="stat-number">{clients.filter(c => getFormStatus(c).status === 'Incomplete').length}</div>
          <div className="stat-label">Incomplete Forms</div>
        </div>
        <div className="stat-card stat-complete">
          <div className="stat-number">{clients.filter(c => getFormStatus(c).status === 'Complete').length}</div>
          <div className="stat-label">Complete Forms</div>
        </div>
      </div>

      <div className="clients-section">
        <div className="section-header">
          <h2>📋 Client List</h2>
          <div className="header-controls">
            <input
              type="text"
              placeholder="🔍 Search clients by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button
              onClick={handleNewForm}
              className="btn-new-client"
            >
              + New Client Form
            </button>
          </div>
        </div>
        
        {filteredClients.length === 0 ? (
          <div className="no-clients">
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No clients found. Click "New Client Form" to get started.</p>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Client Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Form Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const formStatus = getFormStatus(client);
                  return (
                    <tr key={client._id}>
                      <td className="client-id">
                        <span className="id-badge">{client.clientId || generateClientId(client.name, user?.name || 'LO')}</span>
                      </td>
                      <td className="client-name">
                        <strong>{client.name}</strong>
                      </td>
                      <td>{client.email || '-'}</td>
                      <td>{client.phone || '-'}</td>
                      <td>
                        <span 
                          className={`status-badge status-${formStatus.status.toLowerCase().replace(' ', '-')}`}
                        >
                          {formStatus.status} ({formStatus.completedCount}/{formStatus.totalCount})
                        </span>
                      </td>
                      <td className="date-cell">
                        {client.lastUpdated 
                          ? new Date(client.lastUpdated).toLocaleDateString('en-GB')
                          : new Date(client.createdAt).toLocaleDateString('en-GB')
                        }
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button
                            onClick={() => handleViewClient()}
                            className="btn-action btn-view"
                            title="View Details"
                          >
                            👁️ View
                          </button>
                          
                          {(formStatus.status === 'Incomplete' || formStatus.status === 'Partial Complete') && (
                            <button
                              onClick={() => {
                                const incompleteForm = client.forms?.find(f => f.status === 'in_progress' || f.status === 'draft');
                                if (incompleteForm) {
                                  handleResumeForm(client._id, incompleteForm);
                                }
                              }}
                              className="btn-action btn-resume"
                              title="Resume Form"
                            >
                              ▶️ Resume
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteClient(client._id, client.name)}
                            className="btn-action btn-delete"
                            title="Delete User"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanOfficerDashboard;