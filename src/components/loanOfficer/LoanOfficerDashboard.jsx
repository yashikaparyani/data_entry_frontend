import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import './LoanOfficerDashboard.css';

const LoanOfficerDashboard = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for creating new client
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    occupation: '',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/loan-officer/clients');
      setClients(response.data.clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      alert('Error fetching clients');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    
    if (!newClient.name.trim()) {
      alert('Client name is required');
      return;
    }

    try {
      await axios.post('/api/loan-officer/clients', newClient);
      alert('Client created successfully!');
      setNewClient({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        occupation: '',
        notes: ''
      });
      setShowCreateClient(false);
      fetchClients(); // Refresh the list
    } catch (error) {
      console.error('Error creating client:', error);
      alert(error.response?.data?.message || 'Error creating client');
    }
  };

  const handleStartForm = async (clientId, formType) => {
    try {
      const response = await axios.post(`/api/loan-officer/clients/${clientId}/forms`, {
        formType
      });
      
      const formId = response.data.form._id;
      
      // Navigate to the appropriate form with the formId
      const formRoutes = {
        'mse_credit_assessment': `/mse-assessment/${formId}`,
        'financial_analysis': `/financial-analysis/${formId}`,
        'bank_analysis': `/bank-analysis/${formId}`,
        'expert_scorecard': `/expert-scorecard/${formId}`,
        'output_sheet': `/output-analysis/${formId}`
      };
      
      window.location.href = formRoutes[formType];
    } catch (error) {
      console.error('Error starting form:', error);
      alert(error.response?.data?.message || 'Error starting form');
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#28a745';
    if (percentage >= 50) return '#ffc107';
    return '#dc3545';
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="loan-officer-dashboard">
      <div className="dashboard-header">
        <h1>Loan Officer Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
        
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            onClick={() => setShowCreateClient(true)}
            className="btn btn-primary"
          >
            + Add New Client
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{clients.length}</h3>
          <p>Total Clients</p>
        </div>
        <div className="stat-card">
          <h3>{clients.filter(c => c.totalForms > 0).length}</h3>
          <p>Active Applications</p>
        </div>
        <div className="stat-card">
          <h3>{clients.reduce((sum, c) => sum + c.completedForms, 0)}</h3>
          <p>Completed Forms</p>
        </div>
      </div>

      {showCreateClient && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Client</h2>
              <button
                onClick={() => setShowCreateClient(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateClient} className="client-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Client Name *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    required
                    placeholder="Enter client full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={newClient.dateOfBirth}
                    onChange={(e) => setNewClient({...newClient, dateOfBirth: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                  placeholder="Enter full address"
                />
              </div>
              
              <div className="form-group">
                <label>Occupation</label>
                <input
                  type="text"
                  value={newClient.occupation}
                  onChange={(e) => setNewClient({...newClient, occupation: e.target.value})}
                  placeholder="Enter occupation"
                />
              </div>
              
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newClient.notes}
                  onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                  placeholder="Any additional notes about the client"
                  rows="3"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateClient(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="clients-section">
        <h2>Your Clients ({filteredClients.length})</h2>
        
        {filteredClients.length === 0 ? (
          <div className="no-clients">
            <p>No clients found. Start by adding your first client!</p>
          </div>
        ) : (
          <div className="clients-grid">
            {filteredClients.map(client => (
              <div key={client._id} className="client-card">
                <div className="client-header">
                  <h3>{client.name}</h3>
                  <span className={`status-badge ${client.status}`}>
                    {client.status}
                  </span>
                </div>
                
                <div className="client-info">
                  {client.email && <p><strong>Email:</strong> {client.email}</p>}
                  {client.phone && <p><strong>Phone:</strong> {client.phone}</p>}
                  {client.occupation && <p><strong>Occupation:</strong> {client.occupation}</p>}
                </div>
                
                <div className="form-progress">
                  <h4>Application Progress</h4>
                  {client.formProgress.length === 0 ? (
                    <p className="no-forms">No forms started</p>
                  ) : (
                    client.formProgress.map((form, index) => (
                      <div key={index} className="progress-item">
                        <span className="form-type">{form.formType.replace(/_/g, ' ').toUpperCase()}</span>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${form.completionPercentage}%`,
                              backgroundColor: getProgressColor(form.completionPercentage)
                            }}
                          />
                        </div>
                        <span className="progress-text">{form.completionPercentage}%</span>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="client-actions">
                  <div className="form-buttons">
                    <button
                      onClick={() => handleStartForm(client._id, 'mse_credit_assessment')}
                      className="btn btn-small btn-form"
                      disabled={client.formProgress.some(f => f.formType === 'mse_credit_assessment')}
                    >
                      MSE Assessment
                    </button>
                    <button
                      onClick={() => handleStartForm(client._id, 'financial_analysis')}
                      className="btn btn-small btn-form"
                      disabled={client.formProgress.some(f => f.formType === 'financial_analysis')}
                    >
                      Financial Analysis
                    </button>
                    <button
                      onClick={() => handleStartForm(client._id, 'output_sheet')}
                      className="btn btn-small btn-form"
                      disabled={client.formProgress.some(f => f.formType === 'output_sheet')}
                    >
                      Output Analysis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanOfficerDashboard;