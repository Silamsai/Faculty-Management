import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  FileText, 
  Clock, 
  BookOpen,
  LogOut,
  Edit,
  Plus,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Save,
  Upload
} from 'lucide-react';
import publicationService from '../services/publicationService';
import scheduleChangeService from '../services/scheduleChangeService';

const FacultyDashboard = ({ user, onLogout, leaveApplications, onAddLeaveApplication, loading }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [leaveForm, setLeaveForm] = useState({
    reason: '',
    type: '',
    startDate: '',
    endDate: ''
  });
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Faculty',
    lastName: user?.lastName || 'User',
    email: user?.email || 'faculty@university.edu',
    phone: '+1 555-0123',
    department: user?.department || 'computer-science',
    employeeId: user?.employeeId || 'FAC001',
    profileImage: user?.profileImage || null
  });
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImage || null);
  
  // Publication states
  const [publications, setPublications] = useState([]);
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [publicationForm, setPublicationForm] = useState({
    title: '',
    type: 'journal',
    authors: [''],
    journal: '',
    publisher: '',
    conference: '',
    year: new Date().getFullYear(),
    volume: '',
    issue: '',
    pages: { from: '', to: '' },
    doi: '',
    isbn: '',
    impactFactor: '',
    abstract: '',
    keywords: [''],
    status: 'draft',
    url: ''
  });
  const [publicationLoading, setPublicationLoading] = useState(false);

  // Schedule change states
  const [scheduleChanges, setScheduleChanges] = useState([]);
  const [showScheduleChangeForm, setShowScheduleChangeForm] = useState(false);
  const [scheduleChangeForm, setScheduleChangeForm] = useState({
    department: '',
    subject: '',
    currentPeriod: '',
    requestedPeriod: '',
    currentSchedule: '',
    requestedSchedule: '',
    reason: ''
  });
  const [scheduleChangeLoading, setScheduleChangeLoading] = useState(false);

  // Load publications when research section is active
  useEffect(() => {
    if (activeSection === 'research') {
      loadPublications();
    }
  }, [activeSection]);

  const loadPublications = async () => {
    try {
      setPublicationLoading(true);
      const response = await publicationService.getMyPublications();
      setPublications(response.publications || []);
    } catch (error) {
      console.error('Error loading publications:', error);
      alert('Failed to load publications: ' + error.message);
    } finally {
      setPublicationLoading(false);
    }
  };

  // Load schedule changes when scheduling section is active
  useEffect(() => {
    if (activeSection === 'scheduling') {
      loadScheduleChanges();
    }
  }, [activeSection]);

  const loadScheduleChanges = async () => {
    try {
      setScheduleChangeLoading(true);
      const response = await scheduleChangeService.getMyScheduleChanges();
      
      // Check for any newly approved or rejected schedule changes
      const previousScheduleChanges = scheduleChanges || [];
      const currentScheduleChanges = response.scheduleChanges || [];
      
      // Compare with previous state to show notifications
      currentScheduleChanges.forEach(change => {
        const previousChange = previousScheduleChanges.find(c => c._id === change._id);
        if (previousChange && previousChange.status === 'pending' && change.status !== 'pending') {
          // Status has changed from pending to approved/rejected
          if (change.status === 'approved') {
            alert(`Your schedule change request has been approved! ${change.approvedSchedule ? `Approved schedule: ${change.approvedSchedule}` : ''}`);
          } else if (change.status === 'rejected') {
            alert(`Your schedule change request has been rejected. Reason: ${change.reviewNotes || 'No reason provided'}`);
          }
        }
      });
      
      setScheduleChanges(currentScheduleChanges);
    } catch (error) {
      console.error('Error loading schedule changes:', error);
      alert('Failed to load schedule changes: ' + error.message);
    } finally {
      setScheduleChangeLoading(false);
    }
  };

  const handleAddPublication = () => {
    setShowPublicationForm(true);
  };

  const handleExportPublications = async () => {
    try {
      setPublicationLoading(true);
      await publicationService.exportPublications();
      alert('Publications exported successfully!');
    } catch (error) {
      console.error('Error exporting publications:', error);
      alert('Failed to export publications: ' + error.message);
    } finally {
      setPublicationLoading(false);
    }
  };

  const handlePublicationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setPublicationLoading(true);
      
      // Clean up form data
      const cleanedData = {
        ...publicationForm,
        authors: publicationForm.authors.filter(author => author.trim()),
        keywords: publicationForm.keywords.filter(keyword => keyword.trim()),
        pages: {
          from: publicationForm.pages.from ? parseInt(publicationForm.pages.from) : undefined,
          to: publicationForm.pages.to ? parseInt(publicationForm.pages.to) : undefined
        },
        impactFactor: publicationForm.impactFactor ? parseFloat(publicationForm.impactFactor) : undefined
      };
      
      // Remove empty fields
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === '' || cleanedData[key] === null || cleanedData[key] === undefined) {
          delete cleanedData[key];
        }
      });
      
      await publicationService.createPublication(cleanedData);
      alert('Publication added successfully!');
      
      // Reset form and close modal
      setPublicationForm({
        title: '',
        type: 'journal',
        authors: [''],
        journal: '',
        publisher: '',
        conference: '',
        year: new Date().getFullYear(),
        volume: '',
        issue: '',
        pages: { from: '', to: '' },
        doi: '',
        isbn: '',
        impactFactor: '',
        abstract: '',
        keywords: [''],
        status: 'draft',
        url: ''
      });
      setShowPublicationForm(false);
      
      // Reload publications
      await loadPublications();
    } catch (error) {
      console.error('Error adding publication:', error);
      alert('Failed to add publication: ' + error.message);
    } finally {
      setPublicationLoading(false);
    }
  };

  const handleScheduleChangeSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setScheduleChangeLoading(true);
      
      await scheduleChangeService.submitScheduleChange(scheduleChangeForm);
      alert('Schedule change request submitted successfully!');
      
      // Reset form and close modal
      setScheduleChangeForm({
        currentSchedule: '',
        requestedSchedule: '',
        reason: ''
      });
      setShowScheduleChangeForm(false);
      
      // Reload schedule changes
      await loadScheduleChanges();
    } catch (error) {
      console.error('Error submitting schedule change request:', error);
      alert('Failed to submit schedule change request: ' + error.message);
    } finally {
      setScheduleChangeLoading(false);
    }
  };

  // Department options for scheduling form
  const departmentOptions = [
    { value: 'computer-science', label: 'Computer Science' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'english', label: 'English' },
    { value: 'history', label: 'History' },
    { value: 'economics', label: 'Economics' }
  ];

  // Period options for scheduling form
  const periodOptions = [
    { value: '1', label: 'Period 1 (9:00 AM - 10:30 AM)'},
    { value: '2', label: 'Period 2 (11:00 AM - 12:30 PM)'},
    { value: '3', label: 'Period 3 (2:00 PM - 3:30 PM)'},
    { value: '4', label: 'Period 4 (4:00 PM - 5:30 PM)'}
  ];

  // Subject options for scheduling form
  const subjectOptions = [
    { value: 'CS101', label: 'CS101 - Introduction to Programming' },
    { value: 'CS201', label: 'CS201 - Data Structures' },
    { value: 'CS301', label: 'CS301 - Algorithms' },
    { value: 'CS401', label: 'CS401 - Database Systems' },
    { value: 'MATH101', label: 'MATH101 - Calculus I' },
    { value: 'MATH201', label: 'MATH201 - Linear Algebra' },
    { value: 'PHYS101', label: 'PHYS101 - General Physics' }
  ];

  const handlePublicationInputChange = (field, value, index = null) => {
    setPublicationForm(prev => {
      if (field === 'authors' || field === 'keywords') {
        const newArray = [...prev[field]];
        if (index !== null) {
          newArray[index] = value;
        }
        return { ...prev, [field]: newArray };
      } else if (field.startsWith('pages.')) {
        const pageField = field.split('.')[1];
        return {
          ...prev,
          pages: { ...prev.pages, [pageField]: value }
        };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const addArrayField = (field) => {
    setPublicationForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setPublicationForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    
    if (!leaveForm.type || !leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      alert('Please fill in all fields!');
      return;
    }
    
    try {
      // Calculate duration in days
      const start = new Date(leaveForm.startDate);
      const end = new Date(leaveForm.endDate);
      // Calculate duration correctly (inclusive of both start and end dates)
      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      // Validate that duration is positive
      if (duration <= 0) {
        alert('End date must be after or equal to start date!');
        return;
      }
      
      const leaveData = {
        leaveType: leaveForm.type,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        duration: duration,
        reason: leaveForm.reason
      };
      
      const response = await onAddLeaveApplication(leaveData);
      console.log('Leave application response:', response);
      
      alert('Leave application submitted successfully!');
      
      // Reset form after successful submission
      setLeaveForm({ reason: '', type: '', startDate: '', endDate: '' });
      
      // Optionally, you could switch to the leave status tab to show the new application
      // setActiveSection('leave');
      
    } catch (error) {
      console.error('Error submitting leave application:', error);
      // Provide more detailed error message
      const errorMessage = error.message || error.response?.data?.message || 'Unknown error occurred';
      alert('Error submitting leave application: ' + errorMessage);
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    console.log('Profile updated:', profileData);
    alert('Profile updated successfully!');
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'leave') {
      setLeaveForm(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'profile') {
      setProfileData(prev => ({ ...prev, [name]: value }));
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

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Edit Profile</h2>
              <p>Update your personal and professional information</p>
            </div>
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="profile-image-section">
                <div className="profile-image-container">
                  {profileImagePreview ? (
                    <img 
                      src={profileImagePreview} 
                      alt="Profile" 
                      className="profile-image-preview"
                    />
                  ) : (
                    <div className="profile-image-placeholder">
                      <User size={48} />
                      <span>No Image</span>
                    </div>
                  )}
                  <div className="profile-image-overlay">
                    <label htmlFor="profileImage" className="upload-button">
                      <Upload size={20} />
                      Upload Photo
                    </label>
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input 
                    type="text" 
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange(e, 'profile')}
                    className="form-input" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange(e, 'profile')}
                    className="form-input" 
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange(e, 'profile')}
                    className="form-input" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange(e, 'profile')}
                    className="form-input" 
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
                    value={profileData.department}
                    onChange={(e) => handleInputChange(e, 'profile')}
                    className="form-select"
                    required
                  >
                    <option value="computer-science">Computer Science</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="biology">Biology</option>
                    <option value="english">English</option>
                    <option value="history">History</option>
                    <option value="economics">Economics</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="employeeId">Employee ID</label>
                  <input 
                    type="text" 
                    id="employeeId"
                    name="employeeId"
                    value={profileData.employeeId}
                    className="form-input" 
                    disabled 
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <Edit size={16} />
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        );

      case 'attendance':
        // For newly approved faculty, show empty attendance records
        const isEmptyAttendance = !user || user.status === 'pending' || !user.joinedDate;
        
        if (isEmptyAttendance) {
          return (
            <div className="section-content">
              <div className="section-header">
                <h2>Attendance Records</h2>
                <p>Your attendance records will appear here once you start teaching</p>
              </div>
              
              <div className="empty-attendance">
                <div className="empty-icon">
                  <Calendar size={48} />
                </div>
                <h3>No Attendance Records Yet</h3>
                <p>As a newly approved faculty member, your attendance records will be available after your first day of teaching.</p>
              </div>
            </div>
          );
        }
        
        // Mock attendance data - in a real implementation, this would come from an API
        const mockAttendanceData = [
          { date: '2024-12-22', status: 'Present', timeIn: '09:00 AM', timeOut: '05:00 PM', hours: 8 },
          { date: '2024-12-21', status: 'Present', timeIn: '09:15 AM', timeOut: '05:30 PM', hours: 8.25 },
          { date: '2024-12-20', status: 'Absent', reason: 'Sick Leave', approved: true },
          { date: '2024-12-19', status: 'Present', timeIn: '08:45 AM', timeOut: '04:45 PM', hours: 8 },
          { date: '2024-12-18', status: 'Present', timeIn: '09:00 AM', timeOut: '05:00 PM', hours: 8 },
          { date: '2024-12-17', status: 'Absent', reason: 'Personal Leave', approved: true },
          { date: '2024-12-16', status: 'Present', timeIn: '09:30 AM', timeOut: '05:30 PM', hours: 8 },
          { date: '2024-12-15', status: 'Present', timeIn: '09:00 AM', timeOut: '05:00 PM', hours: 8 },
          { date: '2024-12-14', status: 'Absent', reason: 'Weekend' },
          { date: '2024-12-13', status: 'Present', timeIn: '08:30 AM', timeOut: '04:30 PM', hours: 8 }
        ];

        const handleExportAttendance = () => {
          // Create CSV content
          let csvContent = 'Date,Status,Time In,Time Out,Hours,Reason\n';
          
          mockAttendanceData.forEach(record => {
            const date = record.date;
            const status = record.status;
            const timeIn = record.timeIn || '';
            const timeOut = record.timeOut || '';
            const hours = record.hours || '';
            const reason = record.reason || '';
            
            csvContent += `"${date}","${status}","${timeIn}","${timeOut}","${hours}","${reason}"\n`;
          });
          
          // Create download link
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `attendance_report_${user?.firstName}_${user?.lastName}_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Attendance Records</h2>
              <p>Track your attendance and working hours</p>
            </div>
            
            <div className="attendance-overview">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon present">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-number">22</div>
                    <div className="stat-label">Days Present</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon absent">
                    <XCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-number">2</div>
                    <div className="stat-label">Days Absent</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon percentage">
                    <Calendar size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-number">92%</div>
                    <div className="stat-label">Attendance Rate</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="attendance-details">
              <div className="card-header">
                <h3>Recent Attendance</h3>
                <button className="btn btn-secondary" onClick={handleExportAttendance}>
                  <Download size={16} />
                  Export Report
                </button>
              </div>
              
              <div className="attendance-list">
                <div className="attendance-row present">
                  <div className="attendance-date">
                    <div className="date">Dec 22</div>
                    <div className="year">2024</div>
                  </div>
                  <div className="attendance-status">
                    <CheckCircle size={16} />
                    <span>Present</span>
                  </div>
                  <div className="attendance-time">
                    <span>9:00 AM - 5:00 PM</span>
                    <small>8 hours</small>
                  </div>
                </div>
                
                <div className="attendance-row present">
                  <div className="attendance-date">
                    <div className="date">Dec 21</div>
                    <div className="year">2024</div>
                  </div>
                  <div className="attendance-status">
                    <CheckCircle size={16} />
                    <span>Present</span>
                  </div>
                  <div className="attendance-time">
                    <span>9:15 AM - 5:30 PM</span>
                    <small>8.25 hours</small>
                  </div>
                </div>
                
                <div className="attendance-row absent">
                  <div className="attendance-date">
                    <div className="date">Dec 20</div>
                    <div className="year">2024</div>
                  </div>
                  <div className="attendance-status">
                    <XCircle size={16} />
                    <span>Absent</span>
                  </div>
                  <div className="attendance-time">
                    <span>Sick Leave</span>
                    <small>Approved</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'leave':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Leave Management</h2>
              <p>Apply for leave and track your applications</p>
            </div>
            
            <div className="leave-container">
              <div className="leave-form-section">
                <div className="card-header">
                  <h3>Apply for Leave</h3>
                </div>
                
                <form onSubmit={handleLeaveSubmit} className="leave-form">
                  <div className="form-group">
                    <label htmlFor="leaveType">Leave Type</label>
                    <select 
                      id="leaveType"
                      name="type"
                      value={leaveForm.type}
                      onChange={(e) => handleInputChange(e, 'leave')}
                      className="form-select" 
                      required
                    >
                      <option value="">Select Leave Type</option>
                      <option value="sick">Sick Leave</option>
                      <option value="personal">Personal Leave</option>
                      <option value="vacation">Vacation Leave</option>
                      <option value="emergency">Emergency Leave</option>
                      <option value="maternity">Maternity Leave</option>
                      <option value="paternity">Paternity Leave</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="startDate">Start Date</label>
                      <input 
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={leaveForm.startDate}
                        onChange={(e) => handleInputChange(e, 'leave')}
                        className="form-input" 
                        min={new Date().toISOString().split('T')[0]}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="endDate">End Date</label>
                      <input 
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={leaveForm.endDate}
                        onChange={(e) => handleInputChange(e, 'leave')}
                        className="form-input" 
                        min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="reason">Reason for Leave</label>
                    <textarea 
                      id="reason"
                      name="reason"
                      value={leaveForm.reason}
                      onChange={(e) => handleInputChange(e, 'leave')}
                      className="form-textarea" 
                      rows={4} 
                      placeholder="Please provide a detailed reason for your leave request"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      <FileText size={16} />
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
              
              <div className="leave-status-section">
                <div className="card-header">
                  <h3>Leave Applications Status</h3>
                </div>
                
                <div className="leave-applications">
                  {leaveApplications && leaveApplications.length > 0 ? (
                    leaveApplications.map(application => (
                      <div key={application._id || application.id} className={`leave-application ${application.status}`}>
                        <div className="application-header">
                          <div className="application-type">
                            <FileText size={16} />
                            <span>{(application.leaveType || application.type || 'leave').charAt(0).toUpperCase() + (application.leaveType || application.type || 'leave').slice(1)} Leave</span>
                          </div>
                          <span className={`status-badge ${application.status}`}>
                            {application.status === 'pending' && <AlertCircle size={14} />}
                            {application.status === 'approved' && <CheckCircle size={14} />}
                            {application.status === 'rejected' && <XCircle size={14} />}
                            {application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'Pending'}
                          </span>
                        </div>
                        <div className="application-details">
                          <div className="detail-row">
                            <span className="label">Duration:</span>
                            <span>
                              {application.startDate ? new Date(application.startDate).toLocaleDateString() : 'Unknown'} to 
                              {application.endDate ? new Date(application.endDate).toLocaleDateString() : 'Unknown'}
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
                          {application.reviewNotes && (
                            <div className="detail-row">
                              <span className="label">Review Notes:</span>
                              <span>{application.reviewNotes}</span>
                            </div>
                          )}
                        </div>
                        <div className="application-actions">
                          <button className="btn-icon" title="View Details">
                            <Eye size={16} />
                          </button>
                          {application.status === 'approved' && (
                            <button className="btn-icon" title="Download">
                              <Download size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-applications">
                      <p>No leave applications submitted yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'scheduling':
        // Mock schedule data - in a real implementation, this would come from an API
        const mockScheduleData = [
          { day: 'Monday', time: '09:00 AM - 10:30 AM', course: 'CS101', room: 'Room A1', type: 'Lecture' },
          { day: 'Monday', time: '11:00 AM - 12:30 PM', course: 'CS201', room: 'Room B2', type: 'Tutorial' },
          { day: 'Monday', time: '02:00 PM - 03:30 PM', course: 'Office Hours', room: 'Office 201', type: 'Meeting' },
          { day: 'Tuesday', time: '10:00 AM - 11:30 AM', course: 'CS301', room: 'Room C3', type: 'Lecture' },
          { day: 'Tuesday', time: '01:00 PM - 02:30 PM', course: 'Research', room: 'Lab R1', type: 'Research' },
          { day: 'Wednesday', time: '09:00 AM - 10:30 AM', course: 'CS401', room: 'Room D3', type: 'Lecture' },
          { day: 'Wednesday', time: '11:00 AM - 12:00 PM', course: 'Faculty Meeting', room: 'Conference Room', type: 'Meeting' },
          { day: 'Thursday', time: '10:00 AM - 11:30 AM', course: 'CS101', room: 'Room A1', type: 'Lecture' },
          { day: 'Thursday', time: '02:00 PM - 03:30 PM', course: 'CS201', room: 'Room B2', type: 'Tutorial' },
          { day: 'Friday', time: '09:00 AM - 10:30 AM', course: 'CS301', room: 'Room C3', type: 'Lecture' }
        ];

        const handleExportSchedule = () => {
          // Create CSV content
          let csvContent = 'Day,Time,Course/Activity,Room,Type\n';
          
          mockScheduleData.forEach(record => {
            const day = record.day;
            const time = record.time;
            const course = record.course;
            const room = record.room;
            const type = record.type;
            
            csvContent += `"${day}","${time}","${course}","${room}","${type}"\n`;
          });
          
          // Create download link
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `schedule_${user?.firstName}_${user?.lastName}_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Class Schedule</h2>
              <p>Your weekly teaching and meeting schedule</p>
            </div>
            
            <div className="schedule-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setShowScheduleChangeForm(true)}
              >
                <Edit size={16} />
                Request Schedule Change
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleExportSchedule}
              >
                <Download size={16} />
                Export Schedule
              </button>
            </div>

            <div className="schedule-grid">
              <div className="schedule-day">
                <div className="day-header">Monday</div>
                <div className="class-slot filled">
                  <div className="class-info">
                    <div className="class-title">CS101</div>
                    <div className="class-time">09:00 AM - 10:30 AM</div>
                    <div className="class-room">Room A1</div>
                  </div>
                </div>
                <div className="class-slot filled">
                  <div className="class-info">
                    <div className="class-title">CS201</div>
                    <div className="class-time">11:00 AM - 12:30 PM</div>
                    <div className="class-room">Room B2</div>
                  </div>
                </div>
                <div className="class-slot meeting">
                  <div className="class-info">
                    <div className="class-title">Office Hours</div>
                    <div className="class-time">02:00 PM - 03:30 PM</div>
                    <div className="class-room">Office 201</div>
                  </div>
                </div>
              </div>
              
              <div className="schedule-day">
                <div className="day-header">Tuesday</div>
                <div className="class-slot filled">
                  <div className="class-info">
                    <div className="class-title">CS301</div>
                    <div className="class-time">10:00 AM - 11:30 AM</div>
                    <div className="class-room">Room C3</div>
                  </div>
                </div>
                <div className="class-slot research">
                  <div className="class-info">
                    <div className="class-title">Research</div>
                    <div className="class-time">01:00 PM - 02:30 PM</div>
                    <div className="class-room">Lab R1</div>
                  </div>
                </div>
              </div>
              
              <div className="schedule-day">
                <div className="day-header">Wednesday</div>
                <div className="class-slot filled">
                  <div className="class-info">
                    <div className="class-title">CS401</div>
                    <div className="class-time">09:00 AM - 10:30 AM</div>
                    <div className="class-room">Room D3</div>
                  </div>
                </div>
                <div className="class-slot meeting">
                  <div className="class-info">
                    <div className="class-title">Faculty Meeting</div>
                    <div className="class-time">11:00 AM - 12:00 PM</div>
                    <div className="class-room">Conference Room</div>
                  </div>
                </div>
              </div>
              
              <div className="schedule-day">
                <div className="day-header">Thursday</div>
                <div className="class-slot filled">
                  <div className="class-info">
                    <div className="class-title">CS101</div>
                    <div className="class-time">10:00 AM - 11:30 AM</div>
                    <div className="class-room">Room A1</div>
                  </div>
                </div>
                <div className="class-slot filled">
                  <div className="class-info">
                    <div className="class-title">CS201</div>
                    <div className="class-time">02:00 PM - 03:30 PM</div>
                    <div className="class-room">Room B2</div>
                  </div>
                </div>
              </div>
              
              <div className="schedule-day">
                <div className="day-header">Friday</div>
                <div className="class-slot filled">
                  <div className="class-info">
                    <div className="class-title">CS301</div>
                    <div className="class-time">09:00 AM - 10:30 AM</div>
                    <div className="class-room">Room C3</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Approved Schedule Changes Section */}
            <div className="approved-schedule-changes">
              <div className="card-header">
                <h3>Approved Schedule Changes</h3>
              </div>
              
              {scheduleChanges && scheduleChanges.filter(change => change.status === 'approved').length > 0 ? (
                <div className="schedule-change-list">
                  {scheduleChanges
                    .filter(change => change.status === 'approved')
                    .map(change => (
                      <div key={change._id} className="schedule-change-item approved">
                        <div className="change-header">
                          <div className="change-type">
                            <CheckCircle size={16} />
                            <span>Approved Schedule Change</span>
                          </div>
                          <span className="status-badge approved">
                            <CheckCircle size={14} />
                            Approved
                          </span>
                        </div>
                        <div className="change-details">
                          <div className="detail-row">
                            <span className="label">Subject:</span>
                            <span>{change.subject || 'Not specified'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Department:</span>
                            <span>{change.department || 'Not specified'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Current Period:</span>
                            <span>{change.currentPeriod ? periodOptions.find(p => p.value === change.currentPeriod)?.label : 'Not specified'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Approved Period:</span>
                            <span>{change.requestedPeriod ? periodOptions.find(p => p.value === change.requestedPeriod)?.label : 'Not specified'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Approved Schedule:</span>
                            <span>{change.approvedSchedule || 'Not specified'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Approved on:</span>
                            <span>{change.reviewedDate ? new Date(change.reviewedDate).toLocaleDateString() : 'Not specified'}</span>
                          </div>
                          {change.reviewNotes && (
                            <div className="detail-row">
                              <span className="label">Review Notes:</span>
                              <span>{change.reviewNotes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="no-approved-changes">
                  <p>No approved schedule changes at this time.</p>
                </div>
              )}
            </div>

            {/* Schedule Change Requests Section */}
            <div className="schedule-change-section">
              <div className="card-header">
                <h3>My Schedule Change Requests</h3>
              </div>
              
              <div className="schedule-change-list">
                {scheduleChanges && scheduleChanges.filter(change => change.status !== 'approved').length > 0 ? (
                  scheduleChanges
                    .filter(change => change.status !== 'approved')
                    .map(change => (
                      <div key={change._id} className={`schedule-change-item ${change.status}`}>
                        <div className="change-header">
                          <div className="change-type">
                            <Clock size={16} />
                            <span>Schedule Change Request</span>
                          </div>
                          <span className={`status-badge ${change.status}`}>
                            {change.status === 'pending' && <AlertCircle size={14} />}
                            {change.status === 'approved' && <CheckCircle size={14} />}
                            {change.status === 'rejected' && <XCircle size={14} />}
                            {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                          </span>
                        </div>
                        <div className="change-details">
                          <div className="detail-row">
                            <span className="label">Subject:</span>
                            <span>{change.subject || 'Not specified'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Department:</span>
                            <span>{change.department || 'Not specified'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Current Period:</span>
                            <span>{change.currentPeriod ? periodOptions.find(p => p.value === change.currentPeriod)?.label : 'Not specified'}</span>
                          </div>
                          <div className="detail-row">
                            <span className="label">Requested Period:</span>
                            <span>{change.requestedPeriod ? periodOptions.find(p => p.value === change.requestedPeriod)?.label : 'Not specified'}</span>
                          </div>
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
                          {change.reviewNotes && (
                            <div className="detail-row">
                              <span className="label">Review Notes:</span>
                              <span>{change.reviewNotes}</span>
                            </div>
                          )}
                          {change.approvedSchedule && (
                            <div className="detail-row">
                              <span className="label">Approved Schedule:</span>
                              <span>{change.approvedSchedule}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="no-changes">
                    <p>No schedule change requests submitted yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule Change Form Modal */}
            {showScheduleChangeForm && (
              <div className="modal-overlay" onClick={() => setShowScheduleChangeForm(false)}>
                <div className="modal-content schedule-change-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Request Schedule Change</h3>
                    <button className="close-modal" onClick={() => setShowScheduleChangeForm(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleScheduleChangeSubmit} className="schedule-change-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="department">Department</label>
                        <select 
                          id="department"
                          value={scheduleChangeForm.department || ''}
                          onChange={(e) => setScheduleChangeForm({...scheduleChangeForm, department: e.target.value})}
                          className="form-select"
                          required
                        >
                          <option value="">Select Department</option>
                          {departmentOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="subject">Subject</label>
                        <select 
                          id="subject"
                          value={scheduleChangeForm.subject || ''}
                          onChange={(e) => setScheduleChangeForm({...scheduleChangeForm, subject: e.target.value})}
                          className="form-select"
                          required
                        >
                          <option value="">Select Subject</option>
                          {subjectOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="currentPeriod">Current Period</label>
                        <select 
                          id="currentPeriod"
                          value={scheduleChangeForm.currentPeriod || ''}
                          onChange={(e) => setScheduleChangeForm({...scheduleChangeForm, currentPeriod: e.target.value})}
                          className="form-select"
                          required
                        >
                          <option value="">Select Current Period</option>
                          {periodOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="requestedPeriod">Requested Period</label>
                        <select 
                          id="requestedPeriod"
                          value={scheduleChangeForm.requestedPeriod || ''}
                          onChange={(e) => setScheduleChangeForm({...scheduleChangeForm, requestedPeriod: e.target.value})}
                          className="form-select"
                          required
                        >
                          <option value="">Select Requested Period</option>
                          {periodOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="currentSchedule">Current Schedule</label>
                      <textarea 
                        id="currentSchedule"
                        value={scheduleChangeForm.currentSchedule}
                        onChange={(e) => setScheduleChangeForm({...scheduleChangeForm, currentSchedule: e.target.value})}
                        className="form-textarea" 
                        rows={3} 
                        placeholder="Describe your current schedule"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="requestedSchedule">Requested Schedule</label>
                      <textarea 
                        id="requestedSchedule"
                        value={scheduleChangeForm.requestedSchedule}
                        onChange={(e) => setScheduleChangeForm({...scheduleChangeForm, requestedSchedule: e.target.value})}
                        className="form-textarea" 
                        rows={3} 
                        placeholder="Describe your requested schedule"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="reason">Reason for Change</label>
                      <textarea 
                        id="reason"
                        value={scheduleChangeForm.reason}
                        onChange={(e) => setScheduleChangeForm({...scheduleChangeForm, reason: e.target.value})}
                        className="form-textarea" 
                        rows={3} 
                        placeholder="Explain why you need this schedule change"
                        required
                      ></textarea>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowScheduleChangeForm(false)}
                        disabled={scheduleChangeLoading}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={scheduleChangeLoading}
                      >
                        {scheduleChangeLoading ? 'Submitting...' : 'Submit Request'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case 'research':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Books & Research Papers</h2>
              <p>Manage your publications and research work</p>
            </div>
            
            <div className="research-actions">
              <button 
                className="btn btn-primary"
                onClick={handleAddPublication}
                disabled={publicationLoading}
              >
                <Plus size={16} />
                Add New Publication
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleExportPublications}
                disabled={publicationLoading || publications.length === 0}
              >
                <Download size={16} />
                Export List
              </button>
            </div>
            
            {/* Publication Form Modal */}
            {showPublicationForm && (
              <div className="modal-overlay" onClick={() => setShowPublicationForm(false)}>
                <div className="modal-content publication-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Add New Publication</h3>
                    <button className="close-modal" onClick={() => setShowPublicationForm(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  
                  <form onSubmit={handlePublicationSubmit} className="publication-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input 
                          type="text" 
                          id="title"
                          value={publicationForm.title}
                          onChange={(e) => handlePublicationInputChange('title', e.target.value)}
                          className="form-input" 
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="type">Type</label>
                        <select 
                          id="type"
                          value={publicationForm.type}
                          onChange={(e) => handlePublicationInputChange('type', e.target.value)}
                          className="form-select"
                          required
                        >
                          <option value="journal">Journal Article</option>
                          <option value="conference">Conference Paper</option>
                          <option value="book">Book</option>
                          <option value="book-chapter">Book Chapter</option>
                          <option value="thesis">Thesis/Dissertation</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Authors</label>
                      {publicationForm.authors.map((author, index) => (
                        <div key={index} className="array-field">
                          <input 
                            type="text" 
                            value={author}
                            onChange={(e) => handlePublicationInputChange('authors', e.target.value, index)}
                            className="form-input" 
                            placeholder={`Author ${index + 1}`}
                          />
                          {publicationForm.authors.length > 1 && (
                            <button 
                              type="button" 
                              className="btn-icon remove-field"
                              onClick={() => removeArrayField('authors', index)}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        type="button" 
                        className="btn btn-secondary add-field"
                        onClick={() => addArrayField('authors')}
                      >
                        <Plus size={16} />
                        Add Author
                      </button>
                    </div>
                    
                    {publicationForm.type === 'journal' && (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="journal">Journal Name</label>
                            <input 
                              type="text" 
                              id="journal"
                              value={publicationForm.journal}
                              onChange={(e) => handlePublicationInputChange('journal', e.target.value)}
                              className="form-input" 
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label htmlFor="volume">Volume</label>
                              <input 
                                type="text" 
                                id="volume"
                                value={publicationForm.volume}
                                onChange={(e) => handlePublicationInputChange('volume', e.target.value)}
                                className="form-input" 
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="issue">Issue</label>
                              <input 
                                type="text" 
                                id="issue"
                                value={publicationForm.issue}
                                onChange={(e) => handlePublicationInputChange('issue', e.target.value)}
                                className="form-input" 
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Pages</label>
                            <div className="form-row">
                              <input 
                                type="number" 
                                value={publicationForm.pages.from}
                                onChange={(e) => handlePublicationInputChange('pages.from', e.target.value)}
                                className="form-input" 
                                placeholder="From"
                              />
                              <input 
                                type="number" 
                                value={publicationForm.pages.to}
                                onChange={(e) => handlePublicationInputChange('pages.to', e.target.value)}
                                className="form-input" 
                                placeholder="To"
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="doi">DOI</label>
                            <input 
                              type="text" 
                              id="doi"
                              value={publicationForm.doi}
                              onChange={(e) => handlePublicationInputChange('doi', e.target.value)}
                              className="form-input" 
                            />
                          </div>
                        </div>
                      </>
                    )}
                    
                    {publicationForm.type === 'conference' && (
                      <>
                        <div className="form-group">
                          <label htmlFor="conference">Conference Name</label>
                          <input 
                            type="text" 
                            id="conference"
                            value={publicationForm.conference}
                            onChange={(e) => handlePublicationInputChange('conference', e.target.value)}
                            className="form-input" 
                          />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="publisher">Publisher</label>
                            <input 
                              type="text" 
                              id="publisher"
                              value={publicationForm.publisher}
                              onChange={(e) => handlePublicationInputChange('publisher', e.target.value)}
                              className="form-input" 
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="isbn">ISBN</label>
                            <input 
                              type="text" 
                              id="isbn"
                              value={publicationForm.isbn}
                              onChange={(e) => handlePublicationInputChange('isbn', e.target.value)}
                              className="form-input" 
                            />
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="year">Year</label>
                        <input 
                          type="number" 
                          id="year"
                          value={publicationForm.year}
                          onChange={(e) => handlePublicationInputChange('year', parseInt(e.target.value))}
                          className="form-input" 
                          min="1900" 
                          max={new Date().getFullYear() + 1}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="impactFactor">Impact Factor</label>
                        <input 
                          type="number" 
                          id="impactFactor"
                          value={publicationForm.impactFactor}
                          onChange={(e) => handlePublicationInputChange('impactFactor', e.target.value)}
                          className="form-input" 
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="abstract">Abstract</label>
                      <textarea 
                        id="abstract"
                        value={publicationForm.abstract}
                        onChange={(e) => handlePublicationInputChange('abstract', e.target.value)}
                        className="form-textarea" 
                        rows={4}
                      ></textarea>
                    </div>
                    
                    <div className="form-group">
                      <label>Keywords</label>
                      {publicationForm.keywords.map((keyword, index) => (
                        <div key={index} className="array-field">
                          <input 
                            type="text" 
                            value={keyword}
                            onChange={(e) => handlePublicationInputChange('keywords', e.target.value, index)}
                            className="form-input" 
                            placeholder={`Keyword ${index + 1}`}
                          />
                          {publicationForm.keywords.length > 1 && (
                            <button 
                              type="button" 
                              className="btn-icon remove-field"
                              onClick={() => removeArrayField('keywords', index)}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        type="button" 
                        className="btn btn-secondary add-field"
                        onClick={() => addArrayField('keywords')}
                      >
                        <Plus size={16} />
                        Add Keyword
                      </button>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select 
                          id="status"
                          value={publicationForm.status}
                          onChange={(e) => handlePublicationInputChange('status', e.target.value)}
                          className="form-select"
                        >
                          <option value="draft">Draft</option>
                          <option value="submitted">Submitted</option>
                          <option value="accepted">Accepted</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="url">URL</label>
                        <input 
                          type="url" 
                          id="url"
                          value={publicationForm.url}
                          onChange={(e) => handlePublicationInputChange('url', e.target.value)}
                          className="form-input" 
                        />
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => setShowPublicationForm(false)}
                        disabled={publicationLoading}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={publicationLoading}
                      >
                        {publicationLoading ? 'Saving...' : 'Save Publication'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Publications List */}
            <div className="publications-list">
              <div className="card-header">
                <h3>My Publications</h3>
              </div>
              
              {publicationLoading ? (
                <div className="loading">Loading publications...</div>
              ) : publications && publications.length > 0 ? (
                <div className="publications-grid">
                  {publications.map(publication => (
                    <div key={publication._id} className="publication-card">
                      <div className="publication-header">
                        <h4>{publication.title}</h4>
                        <span className={`status-badge ${publication.status}`}>
                          {publication.status}
                        </span>
                      </div>
                      <div className="publication-details">
                        <p className="authors">
                          {publication.authors && publication.authors.join(', ')}
                        </p>
                        <p className="publication-meta">
                          {publication.type === 'journal' && publication.journal && (
                            <span>{publication.journal}</span>
                          )}
                          {publication.type === 'conference' && publication.conference && (
                            <span>{publication.conference}</span>
                          )}
                          {publication.year && <span>{publication.year}</span>}
                          {publication.doi && (
                            <span>
                              DOI: <a href={`https://doi.org/${publication.doi}`} target="_blank" rel="noopener noreferrer">
                                {publication.doi}
                              </a>
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="publication-actions">
                        <button className="btn-icon" title="View Details">
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-publications">
                  <p>No publications added yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={handleAddPublication}
                  >
                    <Plus size={16} />
                    Add Your First Publication
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Faculty Dashboard</h2>
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
            className={`nav-item ${activeSection === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveSection('attendance')}
          >
            <Calendar size={20} />
            Attendance
          </button>
          <button 
            className={`nav-item ${activeSection === 'leave' ? 'active' : ''}`}
            onClick={() => setActiveSection('leave')}
          >
            <FileText size={20} />
            Leave Forms
          </button>
          <button 
            className={`nav-item ${activeSection === 'scheduling' ? 'active' : ''}`}
            onClick={() => setActiveSection('scheduling')}
          >
            <Clock size={20} />
            Scheduling
          </button>
          <button 
            className={`nav-item ${activeSection === 'research' ? 'active' : ''}`}
            onClick={() => setActiveSection('research')}
          >
            <BookOpen size={20} />
            Books & Research
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

export default FacultyDashboard;