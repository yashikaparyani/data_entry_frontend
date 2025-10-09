import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './UserManagement.css';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, user: null });
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUsers(response.data.users || []);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        setError('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getUserStatusBadge = (user) => {
    if (user.submissionCount === 0) {
      return <span className="status-badge no-submissions">No Submissions</span>;
    } else if (user.completedSubmissions === user.submissionCount) {
      return <span className="status-badge all-completed">All Completed</span>;
    } else if (user.completedSubmissions > 0) {
      return <span className="status-badge partial-completed">Partially Completed</span>;
    } else {
      return <span className="status-badge in-progress">In Progress</span>;
    }
  };

  const handleDeleteUser = (user) => {
    setDeleteConfirm({ show: true, user });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.user) return;
    
    try {
      setDeleting(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/admin/users/${deleteConfirm.user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Remove user from local state
      setUsers(users.filter(u => u._id !== deleteConfirm.user._id));
      setDeleteConfirm({ show: false, user: null });
      setError('');
      
      // Show success message (optional - you can add a success state if needed)
      alert(`User "${deleteConfirm.user.name || deleteConfirm.user.username}" deleted successfully`);
      
    } catch (err) {
      console.error('Error deleting user:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      } else {
        const errorMessage = err.response?.data?.message || 'Failed to delete user';
        setError(errorMessage);
      }
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, user: null });
  };

  if (loading) {
    return (
      <div className="user-management-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management-error">
        <h2>Error Loading Users</h2>
        <p>{error}</p>
        <button onClick={fetchUsers} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Header */}
      <header className="user-management-header">
        <div className="header-content">
          <div className="header-top">
            <div className="header-left">
              <button onClick={() => navigate('/admin')} className="back-btn">
                ← Back to Dashboard
              </button>
              <div className="header-info">
                <h1>👥 User Management</h1>
                <p>Manage and monitor all registered users</p>
              </div>
            </div>
            <div className="header-stats">
              <div className="stat-card">
                <span className="stat-value">{users.length}</span>
                <span className="stat-label">Total Users</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{users.filter(u => u.submissionCount > 0).length}</span>
                <span className="stat-label">Active Users</span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/admin/users/create')} 
              className="create-user-btn"
            >
              <span className="btn-icon">➕</span>
              Create New User
            </button>
            <button onClick={fetchUsers} className="refresh-btn">
              <span className="btn-icon">🔄</span>
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-container">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <h3>No users found</h3>
            <p>No users match your search criteria.</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User Info</th>
                  <th>Registration Date</th>
                  <th>Submissions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="user-row">
                    <td className="user-info">
                      <div className="user-avatar">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{user.name || 'N/A'}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </td>
                    <td className="registration-date">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="submissions-stats">
                      <div className="submission-numbers">
                        <span className="total-submissions">
                          Total: {user.submissionCount}
                        </span>
                        <span className="completed-submissions">
                          Completed: {user.completedSubmissions}
                        </span>
                        {user.inProgressSubmissions > 0 && (
                          <span className="in-progress-submissions">
                            In Progress: {user.inProgressSubmissions}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="user-status">
                      {getUserStatusBadge(user)}
                    </td>
                    <td className="actions">
                      <button 
                        className="view-btn"
                        onClick={() => navigate(`/admin/users/${user._id}`)}
                        title="View user details"
                      >
                        👁️ View
                      </button>
                      {user.submissionCount > 0 && (
                        <button 
                          className="submissions-btn"
                          onClick={() => navigate(`/admin/users/${user._id}/submissions`)}
                          title="View user submissions"
                        >
                          📋 Submissions
                        </button>
                      )}
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user)}
                        title="Delete user"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="users-summary">
        <p>
          Showing {filteredUsers.length} of {users.length} users
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="modal-header">
              <h3>⚠️ Confirm User Deletion</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the following user?</p>
              <div className="user-info-delete">
                <strong>{deleteConfirm.user?.name || deleteConfirm.user?.username}</strong>
                <span className="email">({deleteConfirm.user?.email})</span>
              </div>
              {deleteConfirm.user?.submissionCount > 0 && (
                <div className="warning-message">
                  <p>⚠️ This user has {deleteConfirm.user.submissionCount} form submissions.</p>
                  <p>The submissions will be preserved for data integrity, but the user account will be permanently removed.</p>
                </div>
              )}
              <p className="confirm-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn" 
                onClick={cancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn" 
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;