import React from 'react';
import './Header.css';
import samvitLogo from '../assets/samvit-logo.svg';

const Header = () => {
  return (
    <header className="samvit-header">
      <div className="header-container">
        <div className="header-brand">
          <img src={samvitLogo} alt="Samvit Insights Logo" className="company-logo" />
          <div className="brand-text">
            <h1 className="company-name">Samvit Insights</h1>
            <p className="company-tagline">Transforming Insights into Results</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;