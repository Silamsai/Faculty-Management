import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import subjectService from '../services/subjectService';

const SignupOverlay = ({ isOpen, onClose, onSwitchToLogin, onSignup, loading, error }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    department: '',
    schoolSection: '',
    subjects: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Fetch subjects when department changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (formData.department) {
        try {
          const response = await subjectService.getSubjectsByDepartment(formData.department);
          setAvailableSubjects(response.subjects);
          setFilteredSubjects(response.subjects);
        } catch (error) {
          console.error('Error fetching subjects:', error);
          setAvailableSubjects([]);
          setFilteredSubjects([]);
        }
      } else {
        setAvailableSubjects([]);
        setFilteredSubjects([]);
      }
    };

    fetchSubjects();
  }, [formData.department]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubjectChange = (subjectId) => {
    setFormData(prev => {
      const newSubjects = prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId];
      
      return {
        ...prev,
        subjects: newSubjects
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    // Default to faculty userType for all new signups
    const signupData = {
      ...formData,
      userType: 'faculty'
    };
    
    await onSignup(signupData);
  };

  if (!isOpen) return null;

  return (
    <div className="overlay">
      <div className="overlay-backdrop" onClick={onClose}></div>
      <div className="auth-modal signup-modal">
        <div className="modal-header">
          <h2 className="modal-title">Create Your Account</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your first name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your phone"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select Department</option>
                <option value="Btech-CSE">Btech-CSE</option>
                <option value="Btech-ECE">Btech-ECE</option>
                <option value="Btech-EEE">Btech-EEE</option>
                <option value="Btech-Mech">Btech-Mech</option>
                <option value="biology">Biology</option>
                <option value="english">English</option>
                <option value="history">History</option>
                <option value="economics">Economics</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="schoolSection">School Section</label>
              <select
                id="schoolSection"
                name="schoolSection"
                value={formData.schoolSection}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select School Section</option>
                <option value="SOET">SOET</option>
                <option value="School of Forensics science">School of Forensics Science</option>
                <option value="radiology and Agriculture">Radiology and Agriculture</option>
                <option value="Anesthesia">Anesthesia</option>
                <option value="Optometry">Optometry</option>
                <option value="Pharmacy">Pharmacy</option>
              </select>
            </div>
          </div>
          
          {/* Subjects selection - only show when department is selected */}
          {formData.department && availableSubjects.length > 0 && (
            <div className="form-group">
              <label>Select Subjects</label>
              <div className="subjects-checkbox-group">
                {filteredSubjects.map(subject => (
                  <div key={subject._id} className="subject-checkbox-item">
                    <input
                      type="checkbox"
                      id={`subject-${subject._id}`}
                      checked={formData.subjects.includes(subject._id)}
                      onChange={() => handleSubjectChange(subject._id)}
                    />
                    <label htmlFor={`subject-${subject._id}`}>
                      {subject.name} ({subject.code})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="form-row">
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
                  placeholder="Create a password"
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
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="auth-switch">
            <p>
              Already have an account?{' '}
              <button 
                type="button" 
                className="auth-switch-link"
                onClick={onSwitchToLogin}
              >
                Login
              </button>
            </p>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .subjects-checkbox-group {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
        }
        
        .subject-checkbox-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .subject-checkbox-item input {
          margin: 0;
        }
        
        .subject-checkbox-item label {
          margin: 0;
          font-weight: normal;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default SignupOverlay;