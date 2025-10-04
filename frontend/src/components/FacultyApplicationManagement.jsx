import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, Users, X } from 'lucide-react';
import { getFacultyApplications, getFacultyApplication, reviewFacultyApplication, downloadResume } from '../services/facultyApplicationService';
import authService from '../services/authService';

const FacultyApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    page: 1,
    limit: 10,
    sortBy: 'submittedDate',
    order: 'desc'
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    hired: 0
  });
  const [error, setError] = useState(null);

  // Load applications
  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getFacultyApplications(filters);
      
      if (result.success) {
        setApplications(result.data || []);
        setPagination(result.pagination || {});
        
        // Calculate stats
        const statsData = {
          total: result.pagination?.total || 0,
          pending: result.data?.filter(app => app.status === 'pending').length || 0,
          shortlisted: result.data?.filter(app => app.status === 'shortlisted').length || 0,
          hired: result.data?.filter(app => app.status === 'hired').length || 0
        };
        setStats(statsData);
      } else {
        setError(result.message || 'Failed to load applications');
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [filters]);

  // View application details
  const viewApplication = async (applicationId) => {
    try {
      const result = await getFacultyApplication(applicationId);
      if (result.success) {
        setSelectedApplication(result.data);
      } else {
        alert('Failed to load application details: ' + result.message);
      }
    } catch (err) {
      console.error('Error loading application details:', err);
      alert('Failed to load application details: ' + err.message);
    }
  };

  // Review application
  const handleReview = async (applicationId, status, reviewNotes) => {
    try {
      const result = await reviewFacultyApplication(applicationId, { status, reviewNotes });
      if (result.success) {
        loadApplications();
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication(result.data);
        }
        alert(`Application ${status} successfully`);
      } else {
        alert('Failed to review application: ' + result.message);
      }
    } catch (err) {
      console.error('Error reviewing application:', err);
      alert('Failed to review application: ' + err.message);
    }
  };

  // Download resume
  const handleDownloadResume = async (applicationId) => {
    try {
      const result = await downloadResume(applicationId);
      if (result.success) {
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(result.url);
      } else {
        alert('Failed to download resume: ' + result.message);
      }
    } catch (err) {
      console.error('Error downloading resume:', err);
      alert('Failed to download resume: ' + err.message);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'under-review': return '#3b82f6';
      case 'shortlisted': return '#10b981';
      case 'hired': return '#16a34a';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'under-review': return <Eye size={16} />;
      case 'shortlisted': return <CheckCircle size={16} />;
      case 'hired': return <CheckCircle size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  // Get department display name
  const getDepartmentDisplayName = (department) => {
    const departmentMap = {
      'computer-science': 'Computer Science',
      'cse': 'CSE',
      'ece': 'ECE', 
      'eee': 'EEE',
      'bsc': 'BSC',
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
    return departmentMap[department] || department;
  };

  return (
    <div className="faculty-applications-management">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon applications">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon shortlisted">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.shortlisted}</div>
            <div className="stat-label">Shortlisted</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon hired">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.hired}</div>
            <div className="stat-label">Hired</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="applications-filters">
        <div className="filter-group">
          <label htmlFor="statusFilter">Status</label>
          <select
            id="statusFilter"
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under-review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="departmentFilter">Department</label>
          <select
            id="departmentFilter"
            className="form-select"
            value={filters.department}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value, page: 1 }))}
          >
            <option value="">All Departments</option>
            <option value="computer-science">Computer Science</option>
            <option value="cse">CSE</option>
            <option value="ece">ECE</option>
            <option value="eee">EEE</option>
            <option value="bsc">BSC</option>
            <option value="anesthesia">Anesthesia</option>
            <option value="radiology">Radiology</option>
            <option value="mathematics">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="chemistry">Chemistry</option>
            <option value="biology">Biology</option>
            <option value="english">English</option>
            <option value="history">History</option>
            <option value="economics">Economics</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="sortBy">Sort By</label>
          <select
            id="sortBy"
            className="form-select"
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value, page: 1 }))}
          >
            <option value="submittedDate">Submission Date</option>
            <option value="firstName">First Name</option>
            <option value="lastName">Last Name</option>
            <option value="department">Department</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="applications-list">
        {loading ? (
          <div className="loading">Loading applications...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={loadApplications}
            >
              Retry
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>No Applications Found</h3>
            <p>There are no faculty applications matching your current filters.</p>
          </div>
        ) : (
          <div className="applications-grid">
            {applications.map(application => (
              <div key={application._id} className="application-card">
                <div className="application-header">
                  <div className="applicant-info">
                    <h3>{application.firstName} {application.lastName}</h3>
                    <p className="applicant-email">{application.email}</p>
                    <p className="application-id">ID: {application.applicationId}</p>
                  </div>
                  <div className="application-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(application.status) }}
                    >
                      {getStatusIcon(application.status)}
                      {application.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="application-details">
                  <div className="detail-item">
                    <span className="label">Department:</span>
                    <span className="value">{getDepartmentDisplayName(application.department)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Specialization:</span>
                    <span className="value">{application.specialization}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Experience:</span>
                    <span className="value">{application.experience} years</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Applied:</span>
                    <span className="value">{new Date(application.submittedDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="application-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={() => viewApplication(application._id)}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => handleDownloadResume(application._id)}
                  >
                    <Download size={16} />
                    Download Resume
                  </button>
                  
                  {/* Quick Approval Actions */}
                  {application.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to approve and hire this candidate?')) {
                            handleReview(application._id, 'hired', 'Application approved and candidate hired.');
                          }
                        }}
                        title="Approve & Hire"
                      >
                        <CheckCircle size={16} />
                        Approve & Hire
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to reject this application?')) {
                            handleReview(application._id, 'rejected', 'Application rejected after review.');
                          }
                        }}
                        title="Reject Application"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  
                  {application.status === 'shortlisted' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to hire this candidate?')) {
                          handleReview(application._id, 'hired', 'Candidate hired after interview.');
                        }
                      }}
                      title="Hire Candidate"
                    >
                      <CheckCircle size={16} />
                      Hire Candidate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button 
              disabled={pagination.page === 1}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              className="btn btn-outline"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button 
              disabled={pagination.page === pagination.pages}
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content application-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Application Details</h3>
              <button 
                className="close-modal"
                onClick={() => setSelectedApplication(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="application-details-content">
              <div className="details-section">
                <h4>Personal Information</h4>
                <div className="details-grid">
                  <div className="detail-row">
                    <span className="label">Name:</span>
                    <span className="value">{selectedApplication.firstName} {selectedApplication.lastName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{selectedApplication.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Phone:</span>
                    <span className="value">{selectedApplication.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Application ID:</span>
                    <span className="value">{selectedApplication.applicationId}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4>Academic Information</h4>
                <div className="details-grid">
                  <div className="detail-row">
                    <span className="label">Department:</span>
                    <span className="value">{getDepartmentDisplayName(selectedApplication.department)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Specialization:</span>
                    <span className="value">{selectedApplication.specialization}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Experience:</span>
                    <span className="value">{selectedApplication.experience} years</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Education:</span>
                    <span className="value">{selectedApplication.education}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4>Additional Information</h4>
                <div className="details-grid">
                  <div className="detail-row">
                    <span className="label">Publications:</span>
                    <span className="value">{selectedApplication.publications || 'None provided'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Achievements:</span>
                    <span className="value">{selectedApplication.achievements || 'None provided'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Why Join:</span>
                    <span className="value">{selectedApplication.whyJoin}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Available From:</span>
                    <span className="value">
                      {selectedApplication.availableFrom 
                        ? new Date(selectedApplication.availableFrom).toLocaleDateString()
                        : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4>Application Status</h4>
                <div className="details-grid">
                  <div className="detail-row">
                    <span className="label">Current Status:</span>
                    <span className="value">
                      <span 
                        className="status-badge-inline"
                        style={{ backgroundColor: getStatusColor(selectedApplication.status) }}
                      >
                        {selectedApplication.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Submitted Date:</span>
                    <span className="value">
                      {new Date(selectedApplication.submittedDate).toLocaleString()}
                    </span>
                  </div>
                  {selectedApplication.reviewedBy && (
                    <div className="detail-row">
                      <span className="label">Reviewed By:</span>
                      <span className="value">
                        {selectedApplication.reviewedBy.firstName} {selectedApplication.reviewedBy.lastName}
                      </span>
                    </div>
                  )}
                  {selectedApplication.reviewedDate && (
                    <div className="detail-row">
                      <span className="label">Reviewed Date:</span>
                      <span className="value">
                        {new Date(selectedApplication.reviewedDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedApplication.reviewNotes && (
                    <div className="detail-row">
                      <span className="label">Review Notes:</span>
                      <span className="value">{selectedApplication.reviewNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => handleDownloadResume(selectedApplication._id)}
                >
                  <Download size={16} />
                  Download Resume
                </button>
                
                {selectedApplication.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to approve and hire this candidate?')) {
                          handleReview(selectedApplication._id, 'hired', 'Application approved and candidate hired.');
                          setSelectedApplication(null);
                        }
                      }}
                    >
                      <CheckCircle size={16} />
                      Approve & Hire
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to reject this application?')) {
                          handleReview(selectedApplication._id, 'rejected', 'Application rejected after review.');
                          setSelectedApplication(null);
                        }
                      }}
                    >
                      <XCircle size={16} />
                      Reject Application
                    </button>
                  </>
                )}
                
                {selectedApplication.status === 'shortlisted' && (
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to hire this candidate?')) {
                        handleReview(selectedApplication._id, 'hired', 'Candidate hired after interview.');
                        setSelectedApplication(null);
                      }
                    }}
                  >
                    <CheckCircle size={16} />
                    Hire Candidate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyApplicationManagement;