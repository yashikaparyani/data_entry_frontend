import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './FormNavigation.css';

const FormNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Get current form name based on URL
  const getCurrentFormName = () => {
    const path = location.pathname;
    const formNames = {
      '/form': 'Standard Form',
      '/mse-assessment': 'MSE Credit Assessment Form v3.1',
      '/output-analysis': 'Cash Flow Analysis',
      '/expert-scorecard': 'Expert Scorecard',
      '/financial-analysis': 'Financial Analysis > $50K',
      '/bank-analysis': 'Bank Analysis > $50K',
      '/credit-app-memo': 'Credit App Memo',
      '/dashboard': 'User Dashboard'
    };
    return formNames[path] || 'Data Entry Portal';
  };

  return (
    <div className="form-navigation-bar">
      <div className="nav-content">
        {/* Current Form Name */}
        <div className="current-form-name">
          <h2>{getCurrentFormName()}</h2>
        </div>
        
        {/* User Info and Logout - Right Side */}
        <div className="nav-user-section">
          <span className="welcome-text">Welcome, {user?.name}</span>
          <button className="logout-btn" onClick={() => window.location.href = '/login'}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormNavigation;