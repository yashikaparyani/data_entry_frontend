import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './FormNavigation.css';

const FormNavigation = ({ isMenuOpen, setIsMenuOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
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