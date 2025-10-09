import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './UserSubmissions.css';

const UserSubmissions = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSubmissions, setUserSubmissions] = useState(null);
  const [selectedView, setSelectedView] = useState('all');

  useEffect(() => {
    fetchUserSubmissions();
  }, [userId]);

  const fetchUserSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/users/${userId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUserSubmissions(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching user submissions:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load user submissions');
      }
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusBadge = (submission) => {
    if (submission.isCompleted) {
      return <span className="status-badge completed">✅ Completed</span>;
    } else {
      return <span className="status-badge in-progress">⏳ In Progress ({submission.completionPercentage}%)</span>;
    }
  };

  const getFormTypeColor = (formName) => {
    const colors = {
      'MSE Credit Assessment': '#9b59b6',
      'Financial Analysis': '#2ecc71',
      'Bank Analysis': '#e67e22',
      'Expert Scorecard': '#e74c3c',
      'Credit Application Memo': '#3498db',
      'Output Sheet': '#f39c12'
    };
    return colors[formName] || '#95a5a6';
  };

  const filteredSubmissions = userSubmissions?.submissions.filter(submission => {
    if (selectedView === 'completed') return submission.isCompleted;
    if (selectedView === 'in-progress') return !submission.isCompleted;
    return true; // 'all'
  }) || [];

  if (loading) {
    return (
      <div className="user-submissions-loading">
        <div className="loading-spinner"></div>
        <p>Loading user submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-submissions-error">
        <div className="error-icon">❌</div>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/admin/users')} className="back-btn">
          Back to User Management
        </button>
      </div>
    );
  }

  return (
    <div className="user-submissions">
      <div className="user-submissions-header">
        <div className="header-content">
          <div className="header-top">
            <div className="header-left">
              <button onClick={() => navigate('/admin/users')} className="back-btn">
                ← Back to Users
              </button>
              <div className="user-info">
                <h1>📋 {userSubmissions?.user.name}'s Submissions</h1>
                <p className="user-email">{userSubmissions?.user.email}</p>
              </div>
            </div>
            <div className="header-actions">
              <button onClick={fetchUserSubmissions} className="refresh-btn">
                <span className="btn-icon">🔄</span>
                Refresh
              </button>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="stats-cards">
            <div className="stat-card">
              <span className="stat-value">{userSubmissions?.statistics.totalSubmissions || 0}</span>
              <span className="stat-label">Total Submissions</span>
            </div>
            <div className="stat-card completed">
              <span className="stat-value">{userSubmissions?.statistics.completedSubmissions || 0}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-card in-progress">
              <span className="stat-value">{userSubmissions?.statistics.inProgressSubmissions || 0}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-card form-types">
              <span className="stat-value">{userSubmissions?.statistics.formTypes || 0}</span>
              <span className="stat-label">Form Types</span>
            </div>
          </div>

          {/* Filter Options */}
          <div className="filter-section">
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${selectedView === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedView('all')}
              >
                All Submissions ({userSubmissions?.statistics.totalSubmissions || 0})
              </button>
              <button 
                className={`filter-btn ${selectedView === 'completed' ? 'active' : ''}`}
                onClick={() => setSelectedView('completed')}
              >
                Completed ({userSubmissions?.statistics.completedSubmissions || 0})
              </button>
              <button 
                className={`filter-btn ${selectedView === 'in-progress' ? 'active' : ''}`}
                onClick={() => setSelectedView('in-progress')}
              >
                In Progress ({userSubmissions?.statistics.inProgressSubmissions || 0})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="submissions-content">
        {filteredSubmissions.length === 0 ? (
          <div className="no-submissions">
            <div className="no-submissions-icon">📝</div>
            <h3>No submissions found</h3>
            <p>
              {selectedView === 'all' ? 'This user has not submitted any forms yet.' : 
               selectedView === 'completed' ? 'No completed submissions found.' : 
               'No in-progress submissions found.'}
            </p>
          </div>
        ) : (
          <div className="submissions-table-container">
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Form Type</th>
                  <th>Status & Progress</th>
                  <th>Created</th>
                  <th>Last Updated</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission._id} className="submission-row">
                    <td className="form-type">
                      <div className="form-info">
                        <div 
                          className="form-indicator"
                          style={{ backgroundColor: getFormTypeColor(submission.formName) }}
                        ></div>
                        <div className="form-details">
                          <span className="form-name">{submission.formName}</span>
                          <span className="form-step">
                            Step {submission.currentStep || 1} of {submission.totalSteps || 1}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="status-progress">
                      {getStatusBadge(submission)}
                      {!submission.isCompleted && (
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${submission.completionPercentage}%` }}
                          ></div>
                        </div>
                      )}
                    </td>
                    <td className="created-date">
                      {formatDate(submission.createdAt)}
                    </td>
                    <td className="updated-date">
                      {formatDate(submission.lastSaved)}
                    </td>
                    <td className="submitted-date">
                      {submission.isCompleted ? formatDate(submission.submittedAt) : '-'}
                    </td>
                    <td className="actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => navigate(`/admin/submissions/${submission.formName.toLowerCase().replace(/ /g, '-')}/${submission._id}`)}
                        title="View submission details"
                      >
                        👁️ View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSubmissions;