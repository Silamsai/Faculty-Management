import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Calendar, User } from 'lucide-react';
import leaveService from '../services/leaveService';

const LeaveManagement = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Load leave applications
  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getAllApplications();
      console.log('Leave applications response:', response);
      setApplications(response.applications || []);
      
      // Calculate stats
      const applicationsData = response.applications || [];
      const statsData = {
        total: applicationsData.length,
        pending: applicationsData.filter(app => app.status === 'pending').length,
        approved: applicationsData.filter(app => app.status === 'approved').length,
        rejected: applicationsData.filter(app => app.status === 'rejected').length
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error loading leave applications:', error);
      alert('Failed to load leave applications: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // Filter applications
  useEffect(() => {
    let filtered = applications;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        (app.applicantName && app.applicantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.applicantEmail && app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.reason && app.reason.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }
    
    // Apply department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(app => app.department === filterDepartment);
    }
    
    setFilteredApplications(filtered);
  }, [applications, searchTerm, filterStatus, filterDepartment]);

  // Review leave application
  const handleReview = async (applicationId, status, reviewNotes = '') => {
    try {
      if (status === 'rejected' && !reviewNotes) {
        reviewNotes = prompt('Please provide a reason for rejection:');
        if (!reviewNotes) return;
      }
      
      await leaveService.reviewApplication(applicationId, status, reviewNotes);
      alert(`Leave application ${status} successfully`);
      loadApplications(); // Reload applications
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error reviewing leave application:', error);
      alert('Failed to review leave application: ' + (error.response?.data?.message || error.message));
    }
  };

  // View application details
  const viewApplication = async (applicationId) => {
    try {
      const response = await leaveService.getApplication(applicationId);
      setSelectedApplication(response.application);
    } catch (error) {
      console.error('Error loading application details:', error);
      alert('Failed to load application details: ' + (error.response?.data?.message || error.message));
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
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
    <div className="section-content">
      <div className="section-header">
        <h2>Leave Management</h2>
        <p>Review and manage faculty leave applications</p>
      </div>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon applications">
            <Calendar size={24} />
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
          <div className="stat-icon approved">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rejected">
            <XCircle size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="user-management-actions">
        <div className="search-filter-container">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-box">
            <Filter size={20} />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-box">
            <Filter size={20} />
            <select 
              value={filterDepartment} 
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Departments</option>
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
        </div>
      </div>

      {/* Applications List */}
      <div className="users-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading leave applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="no-applications">
            <Calendar size={48} />
            <h3>No Leave Applications Found</h3>
            <p>There are currently no leave applications matching your filters.</p>
          </div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div className="table-cell">Applicant</div>
              <div className="table-cell">Department</div>
              <div className="table-cell">Leave Type</div>
              <div className="table-cell">Dates</div>
              <div className="table-cell">Duration</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Actions</div>
            </div>
            
            {filteredApplications.map(application => (
              <div key={application._id} className="table-row">
                <div className="table-cell user-info">
                  <div className="user-avatar">
                    {application.applicantName ? application.applicantName.charAt(0) : <User size={16} />}
                  </div>
                  <div>
                    <div className="user-name">{application.applicantName || 'Unknown Applicant'}</div>
                    <div className="user-email">{application.applicantEmail || 'No email provided'}</div>
                  </div>
                </div>
                <div className="table-cell">
                  {getDepartmentDisplayName(application.department)}
                </div>
                <div className="table-cell">
                  {application.leaveType?.charAt(0).toUpperCase() + application.leaveType?.slice(1) || 'N/A'}
                </div>
                <div className="table-cell">
                  {new Date(application.startDate).toLocaleDateString()} - {new Date(application.endDate).toLocaleDateString()}
                </div>
                <div className="table-cell">
                  {application.duration} days
                </div>
                <div className="table-cell">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(application.status) }}
                  >
                    {application.status === 'pending' && <Clock size={14} />}
                    {application.status === 'approved' && <CheckCircle size={14} />}
                    {application.status === 'rejected' && <XCircle size={14} />}
                    {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
                  </span>
                </div>
                <div className="table-cell">
                  <div className="action-buttons-inline">
                    <button 
                      className="btn-icon" 
                      title="View Details"
                      onClick={() => viewApplication(application._id)}
                    >
                      <Eye size={16} />
                    </button>
                    {application.status === 'pending' && (
                      <>
                        <button 
                          className="btn-icon success" 
                          title="Approve"
                          onClick={() => handleReview(application._id, 'approved')}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          className="btn-icon danger" 
                          title="Reject"
                          onClick={() => handleReview(application._id, 'rejected')}
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Leave Application Details</h3>
              <button 
                className="close-modal" 
                onClick={() => setSelectedApplication(null)}
              >
                ×
              </button>
            </div>
            
            <div className="user-details-content">
              <div className="detail-row">
                <span className="label">Applicant:</span>
                <span>{selectedApplication.applicantName || 'Unknown Applicant'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span>{selectedApplication.applicantEmail || 'No email provided'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Department:</span>
                <span>{getDepartmentDisplayName(selectedApplication.department)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Leave Type:</span>
                <span>{selectedApplication.leaveType?.charAt(0).toUpperCase() + selectedApplication.leaveType?.slice(1) || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Start Date:</span>
                <span>{new Date(selectedApplication.startDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">End Date:</span>
                <span>{new Date(selectedApplication.endDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Duration:</span>
                <span>{selectedApplication.duration} days</span>
              </div>
              <div className="detail-row">
                <span className="label">Reason:</span>
                <span>{selectedApplication.reason || 'No reason provided'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedApplication.status) }}
                  >
                    {selectedApplication.status === 'pending' && <Clock size={14} />}
                    {selectedApplication.status === 'approved' && <CheckCircle size={14} />}
                    {selectedApplication.status === 'rejected' && <XCircle size={14} />}
                    {selectedApplication.status?.charAt(0).toUpperCase() + selectedApplication.status?.slice(1)}
                  </span>
                </span>
              </div>
              {selectedApplication.reviewNotes && (
                <div className="detail-row">
                  <span className="label">Review Notes:</span>
                  <span>{selectedApplication.reviewNotes}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="label">Applied Date:</span>
                <span>{new Date(selectedApplication.appliedDate).toLocaleString()}</span>
              </div>
              {selectedApplication.reviewedDate && (
                <div className="detail-row">
                  <span className="label">Reviewed Date:</span>
                  <span>{new Date(selectedApplication.reviewedDate).toLocaleString()}</span>
                </div>
              )}
            </div>
            
            {selectedApplication.status === 'pending' && (
              <div className="modal-actions">
                <button 
                  className="btn btn-success" 
                  onClick={() => handleReview(selectedApplication._id, 'approved')}
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleReview(selectedApplication._id, 'rejected')}
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;