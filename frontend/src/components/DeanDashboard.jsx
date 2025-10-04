import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  LogOut,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  UserCheck,
  UserX,
  Download,
  Plus,
  AlertCircle,
  BookOpen,
  Calendar,
  TrendingUp,
  Upload
} from 'lucide-react';
import leaveService from '../services/leaveService';
import scheduleChangeService from '../services/scheduleChangeService';
import userService from '../services/userService';

const DeanDashboard = ({ user, onLogout, leaveApplications }) => {
  console.log('DeanDashboard rendered with props:', { user, leaveApplications });
  
  // Simple test to see if component renders at all
  if (!user) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Error: User data not available</h2>
        <p>Please log in again to access the dashboard.</p>
      </div>
    );
  }
  
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  // Profile state with image
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Dean',
    lastName: user?.lastName || 'User',
    email: user?.email || 'dean@university.edu',
    phone: '+1 555-0123',
    department: 'Computer Science',
    position: 'Dean',
    profileImage: user?.profileImage || null
  });
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImage || null);
  
  // Schedule change states
  const [scheduleChanges, setScheduleChanges] = useState([]);
  const [scheduleChangeLoading, setScheduleChangeLoading] = useState(false);
  
  // Faculty list states
  const [facultyList, setFacultyList] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  
  // Add effect to update profile data when user changes
  useEffect(() => {
    console.log('User data updated:', user);
    if (user) {
      setProfileData({
        firstName: user.firstName || 'Dean',
        lastName: user.lastName || 'User',
        email: user.email || 'dean@university.edu',
        phone: user.phone || '+1 555-0123',
        department: user.department || 'Computer Science',
        position: user.position || 'Dean',
        profileImage: user.profileImage || null
      });
      setProfileImagePreview(user.profileImage || null);
    }
  }, [user]);
  
  // Load schedule changes when schedule section is active
  useEffect(() => {
    if (activeSection === 'schedule') {
      loadScheduleChanges();
    }
  }, [activeSection]);
  
  // Load faculty list when faculty section is active
  useEffect(() => {
    if (activeSection === 'faculty') {
      loadFacultyList();
    }
  }, [activeSection]);
  
  const loadScheduleChanges = async () => {
    try {
      setScheduleChangeLoading(true);
      const response = await scheduleChangeService.getAllScheduleChanges();
      setScheduleChanges(response.scheduleChanges || []);
    } catch (error) {
      console.error('Error loading schedule changes:', error);
      alert('Failed to load schedule changes: ' + error.message);
    } finally {
      setScheduleChangeLoading(false);
    }
  };
  
  const loadFacultyList = async () => {
    try {
      setFacultyLoading(true);
      // Load all faculty members in the dean's department
      // Deans should be able to see all faculty in their department, not just pending ones
      const response = await userService.getAllUsers({
        userType: 'faculty',
        department: user.department // Filter by the dean's department
      });
      setFacultyList(response.users || []);
    } catch (error) {
      console.error('Error loading faculty list:', error);
      // Check if it's a permission error
      if (error.message && error.message.includes('Access denied')) {
        alert('You do not have permission to view the faculty list. Please contact administrator.');
      } else {
        alert('Failed to load faculty list: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setFacultyLoading(false);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
        setProfileData(prev => ({ ...prev, profileImage: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApproveLeave = async (applicationId) => {
    try {
      const reviewNotes = prompt('Add any notes for approval (optional):');
      await leaveService.reviewApplication(applicationId, 'approved', reviewNotes || '');
      alert('Leave application approved successfully!');
      // Instead of reloading the page, we should update the leave applications state
      // This would require passing a function from App.jsx to update the state
      // For now, we'll reload just the leave applications
      window.dispatchEvent(new Event('leaveApplicationsUpdated'));
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Failed to approve leave application: ' + error.message);
    }
  };

  const handleRejectLeave = async (applicationId) => {
    try {
      const reviewNotes = prompt('Please provide reason for rejection:');
      if (reviewNotes) {
        await leaveService.reviewApplication(applicationId, 'rejected', reviewNotes);
        alert('Leave application rejected successfully!');
        // Instead of reloading the page, we should update the leave applications state
        // This would require passing a function from App.jsx to update the state
        // For now, we'll reload just the leave applications
        window.dispatchEvent(new Event('leaveApplicationsUpdated'));
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert('Failed to reject leave application: ' + error.message);
    }
  };
  
  const handleApproveScheduleChange = async (changeId) => {
    try {
      const approvedSchedule = prompt('Enter the approved schedule (optional):');
      const reviewNotes = prompt('Add any notes for approval (optional):');
      
      await scheduleChangeService.reviewScheduleChange(changeId, {
        status: 'approved',
        reviewNotes: reviewNotes || '',
        approvedSchedule: approvedSchedule || ''
      });
      
      // Reload schedule changes
      await loadScheduleChanges();
    } catch (error) {
      console.error('Error approving schedule change:', error);
    }
  };
  
  const handleRejectScheduleChange = async (changeId) => {
    try {
      const reviewNotes = prompt('Please provide reason for rejection:');
      if (reviewNotes) {
        await scheduleChangeService.reviewScheduleChange(changeId, {
          status: 'rejected',
          reviewNotes
        });
        
        // Reload schedule changes
        await loadScheduleChanges();
      }
    } catch (error) {
      console.error('Error rejecting schedule change:', error);
    }
  };

  const renderSection = () => {
    console.log('Rendering section:', activeSection);
    switch (activeSection) {
      case 'profile':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Edit Profile</h2>
              <p>Update your personal and administrative information</p>
            </div>
            <div className="profile-form">
              {/* Profile Image Upload */}
              <div className="form-group profile-image-section">
                <label>Profile Picture</label>
                <div className="image-upload-container improved">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Profile preview" 
                      className="image-preview"
                    />
                  ) : (
                    <div className="image-placeholder">
                      <User size={48} className="placeholder-icon" />
                      <span>No image selected</span>
                    </div>
                  )}
                  <label className="image-upload-label">
                    <Upload size={20} />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="image-input"
                    />
                  </label>
                  <p className="image-help-text">JPEG, PNG up to 2MB</p>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text" 
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="form-input" 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="form-input" 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <input 
                    type="text" 
                    value={profileData.department}
                    onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                    className="form-input" 
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text" 
                    value={profileData.position}
                    onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                    className="form-input" 
                    disabled
                  />
                </div>
              </div>
              <button className="btn btn-primary">Update Profile</button>
            </div>
          </div>
        );

      case 'leave':
        // Function to export leave applications as CSV
        const handleExportLeaveApplications = () => {
          // Create CSV content
          let csvContent = 'Applicant Name,Department,Leave Type,Start Date,End Date,Duration,Status,Reason,Applied Date,Reviewed Date,Review Notes\n';
          
          if (leaveApplications && Array.isArray(leaveApplications) && leaveApplications.length > 0) {
            leaveApplications.forEach(application => {
              const applicantName = application.applicantName || 
                                  (application.applicantId?.firstName + ' ' + application.applicantId?.lastName) || 
                                  'Unknown Applicant';
              const department = application.department || application.applicantId?.department || 'Unknown Department';
              const leaveType = application.leaveType || 'Unknown';
              const startDate = application.startDate ? new Date(application.startDate).toLocaleDateString() : 'Unknown';
              const endDate = application.endDate ? new Date(application.endDate).toLocaleDateString() : 'Unknown';
              const duration = application.duration ? `${application.duration} days` : 'Unknown';
              const status = application.status || 'pending';
              const reason = application.reason || 'No reason provided';
              const appliedDate = application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'Unknown';
              const reviewedDate = application.reviewedDate ? new Date(application.reviewedDate).toLocaleDateString() : '';
              const reviewNotes = application.reviewNotes || '';
              
              csvContent += `"${applicantName}","${department}","${leaveType}","${startDate}","${endDate}","${duration}","${status}","${reason}","${appliedDate}","${reviewedDate}","${reviewNotes}"\n`;
            });
          }
          
          // Create download link
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `leave_applications_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        // Add error handling for leave applications
        try {
          console.log('Rendering leave applications:', leaveApplications);
          return (
            <div className="section-content">
              <div className="section-header">
                <h2>Leave Applications</h2>
                <p>Review and manage faculty leave requests</p>
              </div>
              
              <div className="leave-actions">
                <button className="btn btn-secondary" onClick={handleExportLeaveApplications}>
                  <Download size={16} />
                  Export List
                </button>
              </div>
              
              <div className="leave-requests">
                {leaveApplications && Array.isArray(leaveApplications) && leaveApplications.length > 0 ? (
                  leaveApplications.map(application => {
                    // Add error handling for each application
                    try {
                      // Check if application has required properties
                      if (!application.id && !application._id) {
                        console.error('Application missing id:', application);
                        return (
                          <div key={Math.random()} className="leave-request error">
                            <p>Error: Application data is missing required properties</p>
                          </div>
                        );
                      }
                      
                      // Use _id if id is not available
                      const applicationId = application.id || application._id;
                      
                      return (
                        <div key={applicationId} className={`leave-request ${application.status || 'pending'}`}> 
                          <div className="request-header">
                            <div className="faculty-info">
                              <h4>{application.applicantName || application.applicantId?.firstName + ' ' + application.applicantId?.lastName || 'Unknown Applicant'}</h4>
                              <p>{application.department || application.applicantId?.department || 'Unknown Department'} Faculty</p>
                            </div>
                            <span className={`status-badge ${application.status || 'pending'}`}>
                              {application.status === 'pending' && <Clock size={14} />}
                              {application.status === 'approved' && <CheckCircle size={14} />}
                              {application.status === 'rejected' && <XCircle size={14} />}
                              {application.status === 'pending' ? 'Pending Approval' : 
                               application.status === 'approved' ? 'Approved' : 
                               application.status === 'rejected' ? 'Rejected' : 'Unknown'}
                            </span>
                          </div>
                          <div className="request-details">
                            <div className="detail-row">
                              <span className="label">Leave Type:</span>
                              <span>{application.leaveType || 'Unknown'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Duration:</span>
                              <span>
                                {application.startDate ? new Date(application.startDate).toLocaleDateString() : 'Unknown'} to {application.endDate ? new Date(application.endDate).toLocaleDateString() : 'Unknown'} 
                                {application.duration ? ` (${application.duration} days)` : ''}
                              </span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Reason:</span>
                              <span>{application.reason || 'No reason provided'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">Applied on:</span>
                              <span>{application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'Unknown date'}</span>
                            </div>
                            {application.reviewedDate && (
                              <div className="detail-row">
                                <span className="label">{application.status === 'approved' ? 'Approved' : 'Rejected'} on:</span>
                                <span>{new Date(application.reviewedDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {application.reviewNotes && (
                              <div className="detail-row">
                                <span className="label">Review Notes:</span>
                                <span>{application.reviewNotes}</span>
                              </div>
                            )}
                          </div>
                          <div className="request-actions">
                            <button className="btn btn-outline">
                              <Eye size={16} />
                              View Details
                            </button>
                            {(!application.status || application.status === 'pending') && (
                              <>
                                <button 
                                  className="btn btn-primary"
                                  onClick={() => handleApproveLeave(applicationId)}
                                >
                                  <CheckCircle size={16} />
                                  Approve
                                </button>
                                <button 
                                  className="btn btn-danger"
                                  onClick={() => handleRejectLeave(applicationId)}
                                >
                                  <XCircle size={16} />
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error('Error rendering leave application:', error);
                      return (
                        <div key={application.id || application._id || Math.random()} className="leave-request error">
                          <p>Error rendering application: {error.message}</p>
                        </div>
                      );
                    }
                  })
                ) : (
                  <div className="no-applications">
                    <p>No leave applications to review at this time.</p>
                  </div>
                )}
              </div>
            </div>
          );
        } catch (error) {
          console.error('Error rendering leave section:', error);
          return (
            <div className="section-content">
              <div className="section-header">
                <h2>Leave Applications</h2>
                <p>Review and manage faculty leave requests</p>
              </div>
              <div className="error-message">
                <p>Error loading leave applications: {error.message}</p>
              </div>
            </div>
          );
        }
        
      case 'schedule':
        // Function to export schedule change requests as CSV
        const handleExportScheduleChanges = () => {
          // Create CSV content
          let csvContent = 'Faculty Name,Department,Current Schedule,Requested Schedule,Status,Reason,Applied Date,Reviewed Date,Review Notes,Approved Schedule\n';
          
          if (scheduleChanges && Array.isArray(scheduleChanges) && scheduleChanges.length > 0) {
            scheduleChanges.forEach(change => {
              const facultyName = change.facultyName || 'Unknown Faculty';
              const department = change.department || 'Unknown Department';
              const currentSchedule = change.currentSchedule || '';
              const requestedSchedule = change.requestedSchedule || '';
              const status = change.status || 'pending';
              const reason = change.reason || '';
              const appliedDate = change.appliedDate ? new Date(change.appliedDate).toLocaleDateString() : 'Unknown';
              const reviewedDate = change.reviewedDate ? new Date(change.reviewedDate).toLocaleDateString() : '';
              const reviewNotes = change.reviewNotes || '';
              const approvedSchedule = change.approvedSchedule || '';
              
              csvContent += `"${facultyName}","${department}","${currentSchedule}","${requestedSchedule}","${status}","${reason}","${appliedDate}","${reviewedDate}","${reviewNotes}","${approvedSchedule}"\n`;
            });
          }
          
          // Create download link
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `schedule_changes_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Schedule Change Requests</h2>
              <p>Review and manage faculty schedule change requests</p>
            </div>
            
            <div className="schedule-actions">
              <button className="btn btn-secondary" onClick={handleExportScheduleChanges}>
                <Download size={16} />
                Export List
              </button>
            </div>
            
            <div className="schedule-change-requests">
              {scheduleChangeLoading ? (
                <div className="loading">Loading schedule changes...</div>
              ) : scheduleChanges && scheduleChanges.length > 0 ? (
                scheduleChanges.map(change => (
                  <div key={change._id} className={`schedule-change-request ${change.status}`}>
                    <div className="request-header">
                      <div className="faculty-info">
                        <h4>{change.facultyName}</h4>
                        <p>{change.department} Faculty</p>
                      </div>
                      <span className={`status-badge ${change.status}`}>
                        {change.status === 'pending' && <Clock size={14} />}
                        {change.status === 'approved' && <CheckCircle size={14} />}
                        {change.status === 'rejected' && <XCircle size={14} />}
                        {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                      </span>
                    </div>
                    <div className="request-details">
                      <div className="detail-row">
                        <span className="label">Current Schedule:</span>
                        <span>{change.currentSchedule}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Requested Schedule:</span>
                        <span>{change.requestedSchedule}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Reason:</span>
                        <span>{change.reason}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Applied on:</span>
                        <span>{new Date(change.appliedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="request-actions">
                      {change.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleApproveScheduleChange(change._id)}
                          >
                            <CheckCircle size={16} />
                            Approve
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleRejectScheduleChange(change._id)}
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </>
                      )}
                      <button className="btn btn-outline">
                        <Eye size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-applications">
                  <p>No schedule change requests to review at this time.</p>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'faculty':
        // Function to export faculty list as CSV
        const handleExportFacultyList = () => {
          // Create CSV content
          let csvContent = 'Name,Email,Department,Attendance Rate,Publications,Performance Score\n';
          
          facultyList.forEach(faculty => {
            // Use actual faculty data or default values if not available
            const name = `${faculty.firstName} ${faculty.lastName}`;
            const email = faculty.email || 'N/A';
            const department = faculty.department || 'N/A';
            // For now, we'll still use mock data for metrics since we don't have real metrics in the database
            // In a full implementation, these would come from actual faculty performance data
            const attendanceRate = (85 + Math.random() * 15).toFixed(1) + '%'; // 85-100%
            const publications = Math.floor(Math.random() * 20); // 0-20 publications
            const performanceScore = (3.5 + Math.random() * 1.5).toFixed(1); // 3.5-5.0
            
            csvContent += `"${name}","${email}","${department}","${attendanceRate}","${publications}","${performanceScore}"\n`;
          });
          
          // Create download link
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `faculty_list_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        
        // Function to view faculty profile
        const handleViewProfile = (faculty) => {
          // For now, we'll show an alert with faculty details
          // In a full implementation, this would open a modal or navigate to a profile page
          alert(`Viewing profile for: ${faculty.firstName} ${faculty.lastName}\nEmail: ${faculty.email}\nDepartment: ${faculty.department}`);
        };
        
        // Function to manage faculty
        const handleManageFaculty = (faculty) => {
          // For now, we'll show an alert
          // In a full implementation, this would open a management modal
          alert(`Managing faculty: ${faculty.firstName} ${faculty.lastName}\nThis would open a management interface in a full implementation.`);
        };
        
        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Faculty List</h2>
              <p>View and manage faculty members in your department</p>
            </div>
            
            <div className="faculty-list-actions">
              <button className="btn btn-secondary" onClick={handleExportFacultyList}>
                <Download size={16} />
                Export List
              </button>
            </div>
            
            <div className="faculty-list">
              {facultyLoading ? (
                <div className="loading">Loading faculty list...</div>
              ) : facultyList && facultyList.length > 0 ? (
                <div className="faculty-grid">
                  {facultyList.map(faculty => {
                    // Generate mock metrics for this faculty member
                    // In a real implementation, this would come from actual faculty performance data
                    const attendanceRate = (85 + Math.random() * 15).toFixed(1) + '%'; // 85-100%
                    const publications = Math.floor(Math.random() * 20); // 0-20 publications
                    const performanceScore = (3.5 + Math.random() * 1.5).toFixed(1); // 3.5-5.0
                    
                    return (
                      <div key={faculty._id} className="faculty-card">
                        <div className="faculty-card-header">
                          <div className="faculty-avatar">
                            {faculty.profileImage ? (
                              <img src={faculty.profileImage} alt={faculty.firstName} />
                            ) : (
                              <User size={24} />
                            )}
                          </div>
                          <div className="faculty-basic-info">
                            <h3 className="faculty-name">{faculty.firstName} {faculty.lastName}</h3>
                            <p className="faculty-email">{faculty.email}</p>
                            <span className="faculty-department-badge">{faculty.department}</span>
                          </div>
                        </div>
                        
                        <div className="faculty-details">
                          <div className="faculty-stats">
                            <div className="stat-item">
                              <span className="stat-label">Attendance</span>
                              <span className="stat-value">{attendanceRate}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Publications</span>
                              <span className="stat-value">{publications}</span>
                            </div>
                            <div className="stat-item">
                              <span className="stat-label">Performance</span>
                              <span className="stat-value">{performanceScore}/5</span>
                            </div>
                          </div>
                          
                          <div className="faculty-contact-info">
                            <div className="contact-item">
                              <span className="contact-label">Phone</span>
                              <span className="contact-value">{faculty.phone || 'Not provided'}</span>
                            </div>
                            <div className="contact-item">
                              <span className="contact-label">Status</span>
                              <span className={`status-badge ${faculty.status || 'active'}`}>
                                {faculty.status || 'Active'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="faculty-actions">
                          <button 
                            className="btn btn-outline"
                            onClick={() => handleViewProfile(faculty)}
                          >
                            <Eye size={16} />
                            View Profile
                          </button>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleManageFaculty(faculty)}
                          >
                            <User size={16} />
                            Manage
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-faculty">
                  <p>No faculty members found in your department.</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div>Select a section</div>;
    }
  };

  // Check if user is actually a dean
  if (user.userType !== 'dean') {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to access the dean dashboard.</p>
        <p>User type: {user.userType}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Dean Dashboard</h2>
          <p>Welcome, {user?.firstName} {user?.lastName}</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <User size={20} />
            Edit Profile
          </button>
          <button 
            className={`nav-item ${activeSection === 'leave' ? 'active' : ''}`}
            onClick={() => setActiveSection('leave')}
          >
            <FileText size={20} />
            Leave Applications
          </button>
          <button 
            className={`nav-item ${activeSection === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveSection('schedule')}
          >
            <Calendar size={20} />
            Schedule Changes
          </button>
          <button 
            className={`nav-item ${activeSection === 'faculty' ? 'active' : ''}`}
            onClick={() => setActiveSection('faculty')}
          >
            <UserCheck size={20} />
            Faculty List
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
      
      <div className="dashboard-main">
        {renderSection()}
      </div>
    </div>
  );
};

export default DeanDashboard;