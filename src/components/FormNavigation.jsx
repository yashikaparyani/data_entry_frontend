import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import './FormNavigation.css';

const FormNavigation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!user) return null;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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
    <>
      {/* Navigation with hamburger menu and form name */}
      <div className="form-navigation-bar">
        <div className="nav-content">
          {/* Hamburger Menu Button */}
          <button 
            className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`} 
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          
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

      {/* Sidebar Menu */}
      <div className={`sidebar-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h3>Forms & Analysis</h3>
            <button className="close-menu" onClick={closeMenu}>✕</button>
          </div>
          
          <div className="sidebar-links">
            <Link 
              to="/form" 
              className={`sidebar-link ${location.pathname === '/form' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">📋</span>
              <span className="link-text">Standard Form</span>
            </Link>
            <Link 
              to="/mse-assessment" 
              className={`sidebar-link ${location.pathname === '/mse-assessment' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">💼</span>
              <span className="link-text">MSE Credit Assessment</span>
            </Link>
            <Link 
              to="/output-analysis" 
              className={`sidebar-link ${location.pathname === '/output-analysis' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">📊</span>
              <span className="link-text">Cash Flow Analysis</span>
            </Link>
            <Link 
              to="/expert-scorecard" 
              className={`sidebar-link ${location.pathname === '/expert-scorecard' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">🎯</span>
              <span className="link-text">Expert Scorecard</span>
            </Link>
            <Link 
              to="/financial-analysis" 
              className={`sidebar-link ${location.pathname === '/financial-analysis' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">💼</span>
              <span className="link-text">Financial Analysis &gt; $50K</span>
            </Link>
            <Link 
              to="/bank-analysis" 
              className={`sidebar-link ${location.pathname === '/bank-analysis' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">🏦</span>
              <span className="link-text">Bank Analysis &gt; $50K</span>
            </Link>
            <Link 
              to="/credit-app-memo" 
              className={`sidebar-link ${location.pathname === '/credit-app-memo' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="nav-icon">📋</span>
              <span className="link-text">Credit App Memo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && <div className="sidebar-overlay" onClick={closeMenu}></div>}
    </>
  );
};

export default FormNavigation;