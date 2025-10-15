import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import authService from '../services/authService';

const LoginOverlay = ({ isOpen, onClose, onSwitchToSignup, onLogin, loading, error, clearError }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  // Reset all forms when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      resetAllForms();
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (error && clearError) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    
    // Clear any previous errors before attempting login
    if (clearError) {
      clearError();
    }
    
    try {
      await onLogin(formData);
    } catch (error) {
      console.error('Login submission error:', error);
      // Handle network errors specifically
      if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
        setError('Connection timeout. Please check your internet connection and try again.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');
    
    // Clear any previous errors
    if (clearError) {
      clearError();
    }
    
    try {
      const response = await authService.forgotPassword(resetEmail);
      setResetMessage('✅ ' + response.message);
      // Hide the form after success but don't automatically move to reset form
      // The user will receive an email with a link
      setTimeout(() => {
        setShowForgotPassword(false);
      }, 3000);
    } catch (error) {
      console.error('Forgot password error:', error);
      setResetMessage('❌ ' + (error.message || 'Failed to send reset link'));
    } finally {
      setResetLoading(false);
    }
  };

  const resetAllForms = () => {
    // Reset login form
    setFormData({
      email: '',
      password: ''
    });
    setShowPassword(false);
    
    // Reset forgot password form
    setShowForgotPassword(false);
    setResetEmail('');
    
    // Reset messages
    setResetMessage('');
    setResetLoading(false);
    
    // Clear any errors
    if (clearError) {
      clearError();
    }
  };

  const handleClose = () => {
    resetAllForms();
    if (clearError) {
      clearError();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="overlay-backdrop" onClick={handleClose}></div>
      <div className="auth-modal">
        <div className="modal-header">
          <h2 className="modal-title">Login to Your Account</h2>
          <button className="close-button" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>
        
        {!showForgotPassword ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message" style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email Address or Username</label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email or username"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  // Clear any login errors when switching to forgot password
                  if (clearError) {
                    clearError();
                  }
                  setShowForgotPassword(true);
                }}
              >
                Forgot Password?
              </button>
            </div>
            
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
            
            <div className="auth-switch">
              <span>Don't have an account? </span>
              <button
                type="button"
                className="switch-link"
                onClick={onSwitchToSignup}
              >
                Sign up here
              </button>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleForgotPasswordSubmit}>
            {resetMessage && (
              <div className={`message ${resetMessage.includes('✅') ? 'success' : 'error'}`}>
                {resetMessage}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="resetEmail">Email Address</label>
              <input
                type="email"
                id="resetEmail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email address"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-full" 
              disabled={resetLoading}
            >
              {resetLoading ? 'SENDING RESET LINK...' : 'SEND RESET LINK'}
            </button>
            
            <div className="form-footer">
              <button
                type="button"
                className="link-button"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
      
      <style jsx>{`
        .link-button {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
          padding: 8px 0;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
          margin: 10px auto 0;
        }

        .link-button:hover {
          color: #2563eb;
          text-decoration: none;
        }
        
        .link-button:before {
          content: '←';
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
};

export default LoginOverlay;