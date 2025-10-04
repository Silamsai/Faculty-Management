import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Save, X } from 'lucide-react';
import subjectService from '../services/subjectService';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    department: 'computer-science',
    schoolSection: 'SOET',
    credits: 3,
    semester: 1,
    isActive: true
  });

  // Load subjects on component mount
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await subjectService.getAllSubjects();
      console.log('Subjects loaded:', response); // Debug log
      setSubjects(response.subjects || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      const errorMessage = error.message || 'Failed to load subjects. Please try again later.';
      setError(errorMessage);
      setSubjects([]); // Ensure subjects is an empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSubjectForm({
      ...subjectForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      if (editingSubject) {
        // Update existing subject
        const response = await subjectService.updateSubject(editingSubject._id, subjectForm);
        setSubjects(subjects.map(s => s._id === editingSubject._id ? response.subject : s));
        setEditingSubject(null);
        setShowAddForm(false); // Close the form after update
      } else {
        // Create new subject
        const response = await subjectService.createSubject(subjectForm);
        setSubjects([...subjects, response.subject]);
        // Keep the form open but show success message
        alert('Subject created successfully!');
        // Reset form but keep it open
        setSubjectForm({
          name: '',
          code: '',
          department: 'computer-science',
          schoolSection: 'SOET',
          credits: 3,
          semester: 1,
          isActive: true
        });
      }
      
    } catch (error) {
      console.error('Error saving subject:', error);
      setError('Failed to save subject: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      name: subject.name,
      code: subject.code,
      department: subject.department,
      schoolSection: subject.schoolSection,
      credits: subject.credits,
      semester: subject.semester,
      isActive: subject.isActive
    });
  };

  const handleDelete = async (subjectId, subjectName) => {
    if (!window.confirm(`Are you sure you want to delete the subject "${subjectName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await subjectService.deleteSubject(subjectId);
      setSubjects(subjects.filter(s => s._id !== subjectId));
      alert('Subject deleted successfully!');
    } catch (error) {
      console.error('Error deleting subject:', error);
      setError('Failed to delete subject: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingSubject(null);
    setShowAddForm(false);
    setSubjectForm({
      name: '',
      code: '',
      department: 'computer-science',
      schoolSection: 'SOET',
      credits: 3,
      semester: 1,
      isActive: true
    });
  };

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Department options - Updated to match backend enum values
  const departmentOptions = [
    { value: 'Btech-CSE', label: 'Computer Science & Engineering' },
    { value: 'Btech-MECH', label: 'Mechanical Engineering' },
    { value: 'Btech-CIVIL', label: 'Civil Engineering' },
    { value: 'Btech-ECE', label: 'Electronics & Communication Engineering' },
    { value: 'Btech-EEE', label: 'Electrical & Electronics Engineering' },
    { value: 'bsc', label: 'BSc' },
    { value: 'anesthesia', label: 'Anesthesia' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'english', label: 'English' },
    { value: 'history', label: 'History' },
    { value: 'economics', label: 'Economics' }
  ];

  // School section options
  const schoolSectionOptions = [
    { value: 'SOET', label: 'SOET' },
    { value: 'School of Forensics science', label: 'School of Forensics Science' },
    { value: 'radiology and Agriculture', label: 'Radiology and Agriculture' },
    { value: 'Anesthesia', label: 'Anesthesia' },
    { value: 'Optometry', label: 'Optometry' },
    { value: 'Pharmacy', label: 'Pharmacy' }
  ];

  // Add a success message display
  const handleSubmitWithSuccess = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      if (editingSubject) {
        // Update existing subject
        const response = await subjectService.updateSubject(editingSubject._id, subjectForm);
        setSubjects(subjects.map(s => s._id === editingSubject._id ? response.subject : s));
        setEditingSubject(null);
        setShowAddForm(false); // Close the form after update
        setSuccessMessage('Subject updated successfully!');
      } else {
        // Create new subject
        const response = await subjectService.createSubject(subjectForm);
        setSubjects([...subjects, response.subject]);
        setSuccessMessage('Subject created successfully!');
        // Reset form but keep it open
        setSubjectForm({
          name: '',
          code: '',
          department: 'computer-science',
          schoolSection: 'SOET',
          credits: 3,
          semester: 1,
          isActive: true
        });
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error saving subject:', error);
      setError('Failed to save subject: ' + error.message);
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Subject Management</h2>
        <div className="section-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowAddForm(true);
              setEditingSubject(null);
            }}
            disabled={loading}
          >
            <Plus size={16} />
            Add Subject
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '0.375rem', border: '1px solid #10b981' }}>
          {successMessage}
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            The new subject has been added to the list below. You can continue adding more subjects or close the form.
          </p>
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingSubject) && (
        <div className="form-card">
          <h3>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
          <form onSubmit={handleSubmitWithSuccess}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Subject Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={subjectForm.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter subject name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="code">Subject Code *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={subjectForm.code}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter subject code"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select
                  id="department"
                  name="department"
                  value={subjectForm.department}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  {departmentOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="schoolSection">School Section *</label>
                <select
                  id="schoolSection"
                  name="schoolSection"
                  value={subjectForm.schoolSection}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  {schoolSectionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="credits">Credits *</label>
                <input
                  type="number"
                  id="credits"
                  name="credits"
                  value={subjectForm.credits}
                  onChange={handleInputChange}
                  className="form-input"
                  min="1"
                  max="10"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="semester">Semester *</label>
                <input
                  type="number"
                  id="semester"
                  name="semester"
                  value={subjectForm.semester}
                  onChange={handleInputChange}
                  className="form-input"
                  min="1"
                  max="8"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={subjectForm.isActive}
                  onChange={handleInputChange}
                />
                <span>Active</span>
              </label>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={cancelEdit}
                disabled={loading}
              >
                <X size={16} />
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                <Save size={16} />
                {loading ? 'Saving...' : (editingSubject ? 'Update Subject' : 'Add Subject')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subjects List */}
      <div className="card">
        <div className="card-header">
          <h3>Subjects ({filteredSubjects.length})</h3>
        </div>
        <div className="card-body">
          {loading && !subjects.length ? (
            <div className="loading">Loading subjects...</div>
          ) : filteredSubjects.length === 0 ? (
            <div className="empty-state">
              <p>No subjects found.</p>
              {searchTerm && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th>Code</th>
                    <th>Department</th>
                    <th>School Section</th>
                    <th>Credits</th>
                    <th>Semester</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map(subject => (
                    <tr key={subject._id}>
                      <td>{subject.name}</td>
                      <td>{subject.code}</td>
                      <td>
                        {departmentOptions.find(d => d.value === subject.department)?.label || subject.department}
                      </td>
                      <td>
                        {schoolSectionOptions.find(s => s.value === subject.schoolSection)?.label || subject.schoolSection}
                      </td>
                      <td>{subject.credits}</td>
                      <td>{subject.semester}</td>
                      <td>
                        <span className={`status-badge ${subject.isActive ? 'status-active' : 'status-inactive'}`}>
                          {subject.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => handleEdit(subject)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleDelete(subject._id, subject.name)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .section-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-input {
          padding-left: 2rem;
          padding-right: 1rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          width: 200px;
        }
        
        .search-box svg {
          position: absolute;
          left: 0.75rem;
          color: #6b7280;
        }
        
        .form-card {
          background: var(--card-bg, white);
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-input, .form-select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border-color, #d1d5db);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background-color: var(--input-bg, white);
          color: var(--text-color, #374151);
        }
        
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: var(--text-color, #374151);
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
        
        .table-responsive {
          overflow-x: auto;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-table th,
        .data-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color, #e5e7eb);
        }
        
        .data-table th {
          background-color: var(--table-header-bg, #f9fafb);
          font-weight: 600;
          color: var(--text-color, #374151);
        }
        
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
        
        .btn-icon {
          padding: 0.25rem;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 0.25rem;
          color: var(--text-color, #4b5563);
        }
        
        .btn-icon:hover {
          background-color: var(--button-hover-bg, #f3f4f6);
        }
        
        .btn-danger:hover {
          background-color: var(--danger-hover-bg, #fee2e2) !important;
          color: var(--danger-color, #dc2626) !important;
        }
        
        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-active {
          background-color: var(--success-bg, #dcfce7);
          color: var(--success-color, #166534);
        }
        
        .status-inactive {
          background-color: var(--danger-bg, #fee2e2);
          color: var(--danger-color, #991b1b);
        }
        
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--text-color, #6b7280);
        }
        
        .loading {
          text-align: center;
          padding: 2rem;
          color: var(--text-color, #6b7280);
        }
        
        /* Dark theme variables */
        [data-theme="dark"] .form-card {
          background: var(--card-bg, #1f2937);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        
        [data-theme="dark"] .form-input, 
        [data-theme="dark"] .form-select {
          border: 1px solid var(--border-color, #4b5563);
          background-color: var(--input-bg, #1f2937);
          color: var(--text-color, #d1d5db);
        }
        
        [data-theme="dark"] .checkbox-label {
          color: var(--text-color, #d1d5db);
        }
        
        [data-theme="dark"] .data-table th {
          background-color: var(--table-header-bg, #374151);
          color: var(--text-color, #d1d5db);
        }
        
        [data-theme="dark"] .data-table th,
        [data-theme="dark"] .data-table td {
          border-bottom: 1px solid var(--border-color, #4b5563);
        }
        
        [data-theme="dark"] .btn-icon {
          color: var(--text-color, #9ca3af);
        }
        
        [data-theme="dark"] .btn-icon:hover {
          background-color: var(--button-hover-bg, #374151);
        }
        
        [data-theme="dark"] .empty-state,
        [data-theme="dark"] .loading {
          color: var(--text-color, #9ca3af);
        }
      `}</style>
    </div>
  );
};

export default SubjectManagement;