import React from 'react';
import { Moon, Sun } from 'lucide-react';

const Navbar = ({ isDarkMode, toggleTheme, onLoginClick, onSignupClick }) => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="logo">
            <div className="logo-icon">🎓</div>
            <span>Faculty Management System</span>
          </div>
        </div>
        
        <div className="navbar-links">
          <button onClick={() => scrollToSection('home')} className="nav-link">
            Home
          </button>
          <button onClick={() => scrollToSection('features')} className="nav-link">
            Features
          </button>
          <button onClick={() => scrollToSection('about')} className="nav-link">
            About Us
          </button>
          <button onClick={() => scrollToSection('contact')} className="nav-link">
            Contact
          </button>
        </div>

        <div className="navbar-actions">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={onLoginClick} className="login-btn">
            LOGIN
          </button>
          <button onClick={onSignupClick} className="signup-btn">
            SIGN UP
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;