import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalUsers: 0,
      totalSubmissions: 0,
      completedForms: 0,
      pendingForms: 0
    },
    forms: {
      standardForm: { submitted: 0, pending: 0, lastModified: null, submissions: [] },
      mseAssessment: { submitted: 0, pending: 0, lastModified: null, submissions: [] },
      cashFlowAnalysis: { submitted: 0, pending: 0, lastModified: null, submissions: [] },
      expertScorecard: { submitted: 0, pending: 0, lastModified: null, submissions: [] },
      financialAnalysis: { submitted: 0, pending: 0, lastModified: null, submissions: [] },
      bankAnalysis: { submitted: 0, pending: 0, lastModified: null, submissions: [] },
      creditAppMemo: { submitted: 0, pending: 0, lastModified: null, submissions: [] }
    }
  });
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const formConfigs = {
    standardForm: {
      title: 'Standard Form',
      icon: '📋',
      color: '#3498db',
      description: 'Basic data entry forms'
    },
    mseAssessment: {
      title: 'MSE Credit Assessment',
      icon: '💼',
      color: '#9b59b6',
      description: 'Micro, Small & Enterprise credit evaluation'
    },
    cashFlowAnalysis: {
      title: 'Cash Flow Analysis',
      icon: '📊',
      color: '#e67e22',
      description: 'Output sheet analysis and cash flow tracking'
    },
    expertScorecard: {
      title: 'Expert Scorecard',
      icon: '🎯',
      color: '#e74c3c',
      description: 'Expert assessment and scoring system'
    },
    financialAnalysis: {
      title: 'Financial Analysis >$50K',
      icon: '💼',
      color: '#2ecc71',
      description: 'Comprehensive financial analysis for loans above $50K'
    },
    bankAnalysis: {
      title: 'Bank Analysis >$50K',
      icon: '🏦',
      color: '#34495e',
      description: 'Banking analysis and credit assessment'
    },
    creditAppMemo: {
      title: 'Credit App Memo',
      icon: '📋',
      color: '#f39c12',
      description: 'Credit application memorandum and approval workflow'
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock data - Replace with actual API calls
      const mockData = {
        overview: {
          totalUsers: 125,
          totalSubmissions: 347,
          completedForms: 298,
          pendingForms: 49
        },
        forms: {
          standardForm: {
            submitted: 45,
            pending: 12,
            lastModified: new Date('2024-10-04T14:30:00'),
            submissions: generateMockSubmissions('Standard Form', 45)
          },
          mseAssessment: {
            submitted: 38,
            pending: 8,
            lastModified: new Date('2024-10-04T16:45:00'),
            submissions: generateMockSubmissions('MSE Assessment', 38)
          },
          cashFlowAnalysis: {
            submitted: 52,
            pending: 6,
            lastModified: new Date('2024-10-05T09:15:00'),
            submissions: generateMockSubmissions('Cash Flow Analysis', 52)
          },
          expertScorecard: {
            submitted: 29,
            pending: 9,
            lastModified: new Date('2024-10-03T11:20:00'),
            submissions: generateMockSubmissions('Expert Scorecard', 29)
          },
          financialAnalysis: {
            submitted: 67,
            pending: 7,
            lastModified: new Date('2024-10-04T13:50:00'),
            submissions: generateMockSubmissions('Financial Analysis', 67)
          },
          bankAnalysis: {
            submitted: 43,
            pending: 4,
            lastModified: new Date('2024-10-05T08:30:00'),
            submissions: generateMockSubmissions('Bank Analysis', 43)
          },
          creditAppMemo: {
            submitted: 24,
            pending: 3,
            lastModified: new Date('2024-10-04T17:10:00'),
            submissions: generateMockSubmissions('Credit App Memo', 24)
          }
        }
      };

      setDashboardData(mockData);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate mock submission data
  function generateMockSubmissions(formType, count) {
    const submissions = [];
    const statuses = ['completed', 'in-progress', 'draft'];
    
    for (let i = 1; i <= count; i++) {
      submissions.push({
        id: `${formType.toLowerCase().replace(/\s+/g, '')}_${i}`,
        userId: `user_${Math.floor(Math.random() * 100) + 1}`,
        userName: `User ${Math.floor(Math.random() * 100) + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        completionPercentage: Math.floor(Math.random() * 100) + 1,
        formData: generateMockFormData(formType)
      });
    }
    
    return submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  function generateMockFormData(formType) {
    // Generate relevant mock data based on form type
    const baseData = {
      'Standard Form': { name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
      'MSE Assessment': { businessName: 'ABC Corp', loanAmount: 50000, businessType: 'Retail' },
      'Cash Flow Analysis': { revenue: 120000, expenses: 85000, netCashFlow: 35000 },
      'Expert Scorecard': { creditScore: 750, riskCategory: 'Low', recommendation: 'Approved' },
      'Financial Analysis': { totalAssets: 500000, totalLiabilities: 300000, netWorth: 200000 },
      'Bank Analysis': { bankName: 'First National', accountType: 'Business', averageBalance: 75000 },
      'Credit App Memo': { applicantName: 'Jane Smith', requestedAmount: 100000, approvalStatus: 'Pending' }
    };
    
    return baseData[formType] || {};
  }

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Set axios default header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    fetchData();
  }, [navigate, fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="admin-actions">
            <button onClick={fetchData} className="refresh-btn">
              Refresh Data
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-content">
          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{stats.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>{stats.totalSubmissions}</h3>
                <p>Total Submissions</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>{stats.completedSubmissions}</h3>
                <p>Completed</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-content">
                <h3>{stats.inProgressSubmissions}</h3>
                <p>In Progress</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>{stats.completionRate}%</h3>
                <p>Completion Rate</p>
              </div>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="submissions-section">
            <h2>Recent Submissions</h2>
            <div className="submissions-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Form Name</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Last Saved</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">
                        No submissions yet
                      </td>
                    </tr>
                  ) : (
                    submissions.map((submission) => (
                      <tr key={submission._id}>
                        <td>
                          <div className="user-info">
                            <strong>{submission.userId?.name || 'Unknown User'}</strong>
                            <small>{submission.userId?.email || 'No email'}</small>
                          </div>
                        </td>
                        <td>{submission.formName}</td>
                        <td>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${submission.progress}%` }}
                            ></div>
                            <span>{submission.progress}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status ${submission.isCompleted ? 'completed' : 'in-progress'}`}>
                            {submission.isCompleted ? 'Completed' : 'In Progress'}
                          </span>
                        </td>
                        <td>
                          {new Date(submission.lastSaved).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
