import React from 'react';
import './Header.css';
import samvitLogo from '../assets/LOGO.jpg';

const Header = () => {
  return (
    <header className="samvit-header">
      <div className="header-container">
        <div className="header-brand">
          <img src={samvitLogo} alt="Samvit Insights - 16 Years Transforming Insights into Results" className="company-logo" />
          <div className="brand-text">
            <h1 className="company-name">Samvit Insights</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;