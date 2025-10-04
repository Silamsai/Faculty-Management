import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { submitFacultyApplication } from '../services/facultyApplicationService';

const FacultyApplicationModal = ({ isOpen, onClose, departments }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    specialization: '',
    experience: '',
    education: '',
    publications: '',
    achievements: '',
    whyJoin: '',
    availableFrom: ''
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setMessage('');
      setResumeFile(null);
      // Reset form data but keep any pre-filled values
      setFormData(prev => ({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        specialization: '',
        experience: '',
        education: '',
        publications: '',
        achievements: '',
        whyJoin: '',
        availableFrom: ''
      }));
    }
  }, [isOpen]);

  const getDepartmentDisplayName = (deptKey) => {
    const departmentMap = {
      'computer-science': 'Computer Science',
      'cse': 'Computer Science & Engineering',
      'ece': 'Electronics & Communication Engineering',
      'eee': 'Electrical & Electronics Engineering',
      'bsc': 'Bachelor of Science',
      'anesthesia': 'Anesthesia',
      'radiology': 'Radiology',
      'mathematics': 'Mathematics',
      'physics': 'Physics',
      'chemistry': 'Chemistry',
      'biology': 'Biology',
      'english': 'English',
      'history': 'History',
      'economics': 'Economics'
    };
    return departmentMap[deptKey] || deptKey;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setMessage('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB');
        return;
      }
      setResumeFile(file);
      setMessage('');
    }
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setMessage('Please upload your resume');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add resume file
      formDataToSend.append('resume', resumeFile);

      const response = await submitFacultyApplication(formDataToSend);
      
      if (response.success) {
        setStep(2);
        setMessage('Application submitted successfully!');
      } else {
        setMessage(response.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Application submission error:', error);
      setMessage(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {step === 1 && 'Faculty Application Form'}
            {step === 2 && 'Application Submitted'}
          </h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        {message && (
          <div className={`message ${
            step === 2 ? 'success' : 
            message.includes('success') || message.includes('sent') || message.includes('verified') ? 'success' :
            'error'
          }`}>
            {message}
          </div>
        )}

        {/* Step 1: Application Form */}
        {step === 1 && (
          <form onSubmit={handleApplicationSubmit} className="auth-form faculty-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                  className="form-input"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({...prev, department: e.target.value}))}
                  className="form-select"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Years of Experience *</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({...prev, experience: e.target.value}))}
                  className="form-select"
                  required
                >
                  <option value="">Select Experience</option>
                  <option value="0-2">Fresher (0-2 years)</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="11-15">11-15 years</option>
                  <option value="15+">15+ years</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Area of Specialization *</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData(prev => ({...prev, specialization: e.target.value}))}
                className="form-input"
                placeholder="e.g., Machine Learning, Quantum Physics, etc."
                required
              />
            </div>

            <div className="form-group">
              <label>Highest Education *</label>
              <textarea
                value={formData.education}
                onChange={(e) => setFormData(prev => ({...prev, education: e.target.value}))}
                className="form-input"
                placeholder="e.g., Ph.D. in Computer Science from MIT (2018)"
                rows={2}
                required
              />
            </div>

            <div className="form-group">
              <label>Publications (Optional)</label>
              <textarea
                value={formData.publications}
                onChange={(e) => setFormData(prev => ({...prev, publications: e.target.value}))}
                className="form-input"
                placeholder="List your relevant publications"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Achievements (Optional)</label>
              <textarea
                value={formData.achievements}
                onChange={(e) => setFormData(prev => ({...prev, achievements: e.target.value}))}
                className="form-input"
                placeholder="Notable achievements, awards, certifications"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Why do you want to join Centurion University? *</label>
              <textarea
                value={formData.whyJoin}
                onChange={(e) => setFormData(prev => ({...prev, whyJoin: e.target.value}))}
                className="form-input"
                placeholder="Tell us about your motivation and how you can contribute"
                rows={3}
                required
              />
            </div>

            <div className="form-group">
              <label>Available From (Optional)</label>
              <input
                type="date"
                value={formData.availableFrom}
                onChange={(e) => setFormData(prev => ({...prev, availableFrom: e.target.value}))}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Resume/CV * (PDF only, max 5MB)</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="file-input"
                  id="resume-upload"
                  required
                  style={{display: 'none'}}
                />
                <button 
                  type="button"
                  className="btn btn-outline upload-btn"
                  onClick={() => document.getElementById('resume-upload').click()}
                >
                  <Upload size={16} />
                  {resumeFile ? 'Change Resume' : 'Upload Resume'}
                </button>
                {resumeFile && (
                  <div className="file-selected">
                    <CheckCircle size={16} color="#10B981" />
                    <span>{resumeFile.name}</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}

        {/* Step 2: Success Message */}
        {step === 2 && (
          <div className="success-content">
            <div className="success-icon">
              <CheckCircle size={48} color="#10B981" />
            </div>
            <p className="success-message">
              Thank you for your application! We have received your submission and will review it shortly.
            </p>
            <p className="success-details">
              A confirmation email has been sent to {formData.email}. Our team will contact you regarding the next steps.
            </p>
            <button 
              className="btn btn-primary btn-full"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyApplicationModal;