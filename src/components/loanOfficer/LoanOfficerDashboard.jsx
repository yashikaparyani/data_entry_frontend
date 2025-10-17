import React, { useState, useEffect } from 'react';
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

  const handleResumeForm = (clientId, formId) => {
    // Navigate to specific form with formId for resume
    navigate(`/form/${formId}`);
  };

  const getFormStatus = (client) => {
    if (!client.forms || client.forms.length === 0) {
      return { status: 'No Forms', color: '#6c757d' };
    }
    
    const hasIncomplete = client.forms.some(form => form.status === 'in_progress' || form.status === 'draft');
    const hasComplete = client.forms.some(form => form.status === 'completed');
    
    if (hasIncomplete && hasComplete) {
      return { status: 'Partial Complete', color: '#ffc107' };
    } else if (hasIncomplete) {
      return { status: 'Incomplete', color: '#dc3545' };
    } else if (hasComplete) {
      return { status: 'Complete', color: '#28a745' };
    } else {
      return { status: 'No Forms', color: '#6c757d' };
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
        <h1>Loan Officer Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
        
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search clients by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            onClick={handleNewForm}
            className="btn btn-primary"
          >
            + New Client Form
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{clients.length}</h3>
          <p>Total Clients</p>
        </div>
        <div className="stat-card">
          <h3>{clients.filter(c => getFormStatus(c).status === 'Incomplete').length}</h3>
          <p>Incomplete Forms</p>
        </div>
        <div className="stat-card">
          <h3>{clients.filter(c => getFormStatus(c).status === 'Complete').length}</h3>
          <p>Complete Forms</p>
        </div>
      </div>

      <div className="clients-section">
        <h2>Client List</h2>
        
        {filteredClients.length === 0 ? (
          <div className="no-clients">
            <p>No clients found. Click "New Client Form" to get started.</p>
          </div>
        ) : (
          <div className="clients-table">
            <table>
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
                        {client.clientId || generateClientId(client.name, user?.name || 'LO')}
                      </td>
                      <td className="client-name">{client.name}</td>
                      <td>{client.email || '-'}</td>
                      <td>{client.phone || '-'}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: formStatus.color }}
                        >
                          {formStatus.status}
                        </span>
                      </td>
                      <td>
                        {client.lastUpdated 
                          ? new Date(client.lastUpdated).toLocaleDateString()
                          : new Date(client.createdAt).toLocaleDateString()
                        }
                      </td>
                      <td className="actions">
                        {formStatus.status === 'Incomplete' || formStatus.status === 'Partial Complete' ? (
                          <button
                            onClick={() => {
                              const incompleteForm = client.forms?.find(f => f.status === 'in_progress' || f.status === 'draft');
                              if (incompleteForm) {
                                handleResumeForm(client._id, incompleteForm._id);
                              }
                            }}
                            className="btn btn-warning btn-sm"
                          >
                            Resume
                          </button>
                        ) : (
                          <button
                            onClick={handleNewForm}
                            className="btn btn-primary btn-sm"
                          >
                            New Form
                          </button>
                        )}
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