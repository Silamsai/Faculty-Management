import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  UserPlus,
  Settings,
  LogOut,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Key,
  AlertTriangle,
  FileText,
  Image
} from 'lucide-react';
import userService from '../services/userService';
import { getFacultyApplications } from '../services/facultyApplicationService';

import GalleryManagement from './GalleryManagement';
import SubjectManagement from './SubjectManagement';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [users, setUsers] = useState([]);
  const [facultyApplications, setFacultyApplications] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDetailsData, setUserDetailsData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userType: '',
    department: '',
    schoolSection: '',
    password: ''
  });
  
  // Add new user form state
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    userType: 'faculty',
    department: 'computer-science',
    schoolSection: 'SOET' // Add this field
  });

  // Load users and stats on component mount
  useEffect(() => {
    if (activeSection === 'users') {
      loadUsers();
      loadUserStats();
    } else if (activeSection === 'faculty-applications') {
      loadPendingFaculty();
    }
  }, [activeSection]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Failed to load users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingFaculty = async () => {
    try {
      setLoading(true);
      const response = await userService.getPendingFaculty();
      if (response && response.users) {
        setFacultyApplications(response.users || []);
      } else {
        alert('Failed to load pending faculty: ' + (response?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error loading pending faculty:', error);
      alert('Failed to load pending faculty: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await userService.getUserStats();
      setUserStats(response.stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleViewUserDetails = async (userId) => {
    try {
      setLoading(true);
      const response = await userService.getUserDetails(userId);
      setUserDetailsData(response.user);
      setShowUserDetails(true);
      setShowPassword(false);
    } catch (error) {
      console.error('Error loading user details:', error);
      alert('Failed to load user details: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      setLoading(true);
      console.log('Attempting to update user status:', userId, newStatus);
      // Ensure we're using the correct ID format
      const id = typeof userId === 'object' ? userId._id || userId.id : userId;
      
      console.log('User ID being sent:', id);
      console.log('New status being sent:', newStatus);
      
      // If approving a faculty user, set status to active
      const response = await userService.updateUserStatus(id, newStatus);
      console.log('Update user status response:', response);
      
      // Show appropriate success message based on the action
      if (response && response.message) {
        alert(response.message);
      } else if (response && !response.error) {
        if (newStatus === 'active') {
          alert('Faculty member has been approved successfully! They can now log in to the system.');
        } else if (newStatus === 'suspended') {
          alert('User status has been updated to suspended.');
        } else {
          alert('User status has been updated successfully.');
        }
      }
      
      // Reload the appropriate data based on current section
      if (activeSection === 'users') {
        await loadUsers();
      } else if (activeSection === 'faculty-applications') {
        await loadPendingFaculty();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status: ' + (error.message || error.toString()));
      // Don't redirect to home page, stay on current page
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await userService.deleteUser(userId);
      // Reload the appropriate data based on current section
      if (activeSection === 'users') {
        await loadUsers();
      } else if (activeSection === 'faculty-applications') {
        await loadPendingFaculty();
      }
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle exporting users to CSV
  const handleExportUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users for export
      const response = await userService.getAllUsers();
      const usersToExport = response.users || [];
      
      // Create CSV content
      const csvHeaders = ['First Name', 'Last Name', 'Email', 'Phone', 'Role', 'Department', 'School Section', 'Status', 'Join Date'];
      const csvRows = usersToExport.map(user => [
        user.firstName || '',
        user.lastName || '',
        user.email || '',
        user.phone || '',
        user.userType || '',
        user.department || '',
        user.schoolSection || '',
        user.status || '',
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
      ]);
      
      // Combine headers and rows
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Users exported successfully!');
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Failed to export users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newUserForm.firstName || !newUserForm.lastName || !newUserForm.email || 
        !newUserForm.password || !newUserForm.phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Validate password length
    if (newUserForm.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    // Validate school section for faculty and dean
    if ((newUserForm.userType === 'faculty' || newUserForm.userType === 'dean') && !newUserForm.schoolSection) {
      alert('Please select a school section');
      return;
    }
    
    try {
      setLoading(true);
      const response = await userService.createUser(newUserForm);
      alert(response.message || 'User created successfully');
      
      // Reset form and close modal
      setNewUserForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        userType: 'faculty',
        department: 'computer-science',
        schoolSection: 'SOET' // Reset this field too
      });
      setShowAddUserForm(false);
      
      // Reload users
      await loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleNewUserFormChange = (field, value) => {
    setNewUserForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditUser = (user) => {
    setEditUserForm({
      id: user._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      userType: user.userType || '',
      department: user.department || '',
      schoolSection: user.schoolSection || '',
      password: ''
    });
    setShowEditUserForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare update data (excluding empty password)
      const updateData = {
        firstName: editUserForm.firstName,
        lastName: editUserForm.lastName,
        email: editUserForm.email,
        phone: editUserForm.phone,
        userType: editUserForm.userType,
        department: editUserForm.department,
        schoolSection: editUserForm.schoolSection
      };
      
      // Only include password if it's not empty
      if (editUserForm.password) {
        updateData.password = editUserForm.password;
      }
      
      const response = await userService.updateUser(editUserForm.id, updateData);
      alert(response.message || 'User updated successfully');
      
      // Reset form and close modal
      setEditUserForm({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        userType: '',
        department: '',
        schoolSection: '',
        password: ''
      });
      setShowEditUserForm(false);
      
      // Reload users
      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditUserFormChange = (field, value) => {
    setEditUserForm(prev => ({ ...prev, [field]: value }));
  };

  const mockUsers = [
    { id: 1, name: 'Dr. John Doe', email: 'john.doe@university.edu', role: 'faculty', department: 'Computer Science', status: 'active', joinDate: '2022-01-15' },
    { id: 2, name: 'Dr. Jane Smith', email: 'jane.smith@university.edu', role: 'dean', department: 'Computer Science', status: 'active', joinDate: '2020-03-10' },
    { id: 3, name: 'Dr. Alice Brown', email: 'alice.brown@university.edu', role: 'faculty', department: 'Physics', status: 'active', joinDate: '2023-05-20' },
    { id: 4, name: 'Dr. Robert Wilson', email: 'robert.wilson@university.edu', role: 'researcher', department: 'Chemistry', status: 'pending', joinDate: '2024-12-01' },
    { id: 5, name: 'Dr. Emily Davis', email: 'emily.davis@university.edu', role: 'dean', department: 'Mathematics', status: 'active', joinDate: '2019-08-12' }
  ];

  const filteredUsers = (users.length > 0 ? users : mockUsers).filter(user => {
    const matchesSearch = (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || user.userType === filterRole;
    return matchesSearch && matchesFilter;
  });

  const filteredApplications = facultyApplications.filter(application => {
    const displayName = `${application.firstName} ${application.lastName}`;
    const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       application.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || application.department === filterRole;
    return matchesSearch && matchesFilter;
  });

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Edit Profile</h2>
              <p>Update your administrative profile information</p>
            </div>
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" defaultValue={user?.firstName || 'Admin'} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" defaultValue={user?.lastName || 'User'} className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" defaultValue={user?.email || 'admin@university.edu'} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" defaultValue="+1 555-0789" className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" defaultValue="System Administrator" className="form-input" disabled />
                </div>
                <div className="form-group">
                  <label>Access Level</label>
                  <input type="text" defaultValue="Full Access" className="form-input" disabled />
                </div>
              </div>
              <button className="btn btn-primary">Update Profile</button>
            </div>
          </div>
        );

      case 'faculty-applications':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Faculty Applications</h2>
              <p>Review and manage faculty membership applications</p>
            </div>
            
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
                    value={filterRole} 
                    onChange={(e) => setFilterRole(e.target.value)}
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

            <div className="applications-list">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading applications...</p>
                </div>
              ) : filteredApplications.length > 0 ? (
                filteredApplications.map(application => {
                  const displayName = application.firstName && application.lastName ? 
                    `${application.firstName} ${application.lastName}` : 
                    'Unknown Applicant';
                  
                  return (
                    <div key={application._id} className="application-card">
                      <div className="application-header">
                        <div className="applicant-info">
                          <h4>{displayName}</h4>
                          <p>{application.department || 'Unknown Department'} Faculty</p>
                        </div>
                        <span className="status-badge pending">
                          <AlertTriangle size={14} />
                          Pending Review
                        </span>
                      </div>
                      
                      <div className="application-details">
                        <div className="detail-row">
                          <span className="label">Email:</span>
                          <span>{application.email}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Applied on:</span>
                          <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Phone:</span>
                          <span>{application.phone || 'Not provided'}</span>
                        </div>
                      </div>
                      
                      <div className="application-actions">
                        <button 
                          className="btn btn-outline"
                          onClick={() => handleViewUserDetails(application._id)}
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleUpdateUserStatus(application._id, 'active')}
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleUpdateUserStatus(application._id, 'suspended')}
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-applications">
                  <FileText size={48} />
                  <h3>No Pending Applications</h3>
                  <p>There are currently no faculty applications pending review.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2>User Management</h2>
              <p>Manage all system users and their access permissions</p>
            </div>
            
            <div className="user-management-actions">
              <div className="search-filter-container">
                <div className="search-box">
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="filter-box">
                  <Filter size={20} />
                  <select 
                    value={filterRole} 
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Roles</option>
                    <option value="faculty">Faculty</option>
                    <option value="dean">Dean</option>
                    <option value="researcher">Researcher</option>
                    <option value="admin">Admin</option>
                    <option value="vc">VC</option>
                  </select>
                </div>
              </div>
              <div className="action-buttons">
                <button 
                  className="btn btn-secondary"
                  onClick={handleExportUsers}
                  disabled={loading}
                >
                  <Download size={16} />
                  Export Users
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddUserForm(true)}
                  disabled={loading}
                >
                  <UserPlus size={16} />
                  Add New User
                </button>
              </div>
            </div>

            <div className="users-stats">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon faculty">
                    <Users size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-number">
                      {userStats?.byType?.find(s => s._id === 'faculty')?.count || 0}
                    </div>
                    <div className="stat-label">Total Faculty</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon dean">
                    <Shield size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-number">
                      {userStats?.byType?.find(s => s._id === 'dean')?.count || 0}
                    </div>
                    <div className="stat-label">Deans</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon researcher">
                    <User size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-number">
                      {userStats?.byType?.find(s => s._id === 'researcher')?.count || 0}
                    </div>
                    <div className="stat-label">Researchers</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon pending">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-number">
                      {userStats?.byType?.find(s => s._id === 'faculty' && s.status === 'pending')?.count || 0}
                    </div>
                    <div className="stat-label">Pending Approval</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="users-table-container">
              <div className="users-table">
                <div className="table-header">
                  <div className="table-cell">User</div>
                  <div className="table-cell">Role</div>
                  <div className="table-cell">Department</div>
                  <div className="table-cell">Status</div>
                  <div className="table-cell">Join Date</div>
                  <div className="table-cell">Actions</div>
                </div>
                
                {filteredUsers.map(userData => {
                  const displayName = userData.firstName && userData.lastName ? 
                    `${userData.firstName} ${userData.lastName}` : 
                    (userData.name || 'Unknown User');
                  
                  return (
                    <div key={userData._id || userData.id} className="table-row">
                      <div className="table-cell user-info">
                        <div className="user-avatar">
                          {displayName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="user-name">{displayName}</div>
                          <div className="user-email">{userData.email}</div>
                        </div>
                      </div>
                      <div className="table-cell">
                        <span className={`role-badge ${userData.userType || userData.role}`}>
                          {(userData.userType || userData.role).charAt(0).toUpperCase() + (userData.userType || userData.role).slice(1)}
                        </span>
                      </div>
                      <div className="table-cell">{userData.department}</div>
                      <div className="table-cell">
                        <span className={`status-badge ${userData.status}`}>
                          {userData.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
                        </span>
                      </div>
                      <div className="table-cell">
                        {new Date(userData.createdAt || userData.joinDate).toLocaleDateString()}
                      </div>
                      <div className="table-cell">
                        <div className="action-buttons-inline">
                          <button 
                            className="btn-icon" 
                            title="View Details & Password"
                            onClick={() => handleViewUserDetails(userData._id || userData.id)}
                            disabled={loading}
                          >
                            <Key size={16} />
                          </button>
                          <button 
                            className="btn-icon" 
                            title="Edit User"
                            onClick={() => handleEditUser(userData)}
                            disabled={loading}
                          >
                            <Edit size={16} />
                          </button>
                          {userData.status === 'pending' && (
                            <button 
                              className="btn-icon success" 
                              title="Approve User"
                              onClick={() => handleUpdateUserStatus(userData._id || userData.id, 'active')}
                              disabled={loading}
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button 
                            className="btn-icon danger" 
                            title="Delete User"
                            onClick={() => handleDeleteUser(userData._id || userData.id, displayName)}
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'subjects':
        return <SubjectManagement />;
      
      case 'gallery':
        return <GalleryManagement />;

      case 'settings':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2>System Settings</h2>
              <p>Configure system-wide settings and permissions</p>
            </div>
            
            <div className="settings-grid">
              <div className="settings-card">
                <div className="settings-header">
                  <h3>User Permissions</h3>
                  <p>Configure default permissions for different user roles</p>
                </div>
                <div className="permission-settings">
                  <div className="permission-item">
                    <label>Faculty Default Permissions</label>
                    <div className="permission-checkboxes">
                      <label><input type="checkbox" defaultChecked /> Profile Management</label>
                      <label><input type="checkbox" defaultChecked /> Leave Applications</label>
                      <label><input type="checkbox" defaultChecked /> Schedule Viewing</label>
                      <label><input type="checkbox" /> Research Management</label>
                    </div>
                  </div>
                  <div className="permission-item">
                    <label>Dean Default Permissions</label>
                    <div className="permission-checkboxes">
                      <label><input type="checkbox" defaultChecked /> Faculty Management</label>
                      <label><input type="checkbox" defaultChecked /> Leave Approval</label>
                      <label><input type="checkbox" defaultChecked /> Department Reports</label>
                      <label><input type="checkbox" /> System Configuration</label>
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary">Save Permissions</button>
              </div>

              <div className="settings-card">
                <div className="settings-header">
                  <h3>System Configuration</h3>
                  <p>Configure general system settings</p>
                </div>
                <div className="config-settings">
                  <div className="form-group">
                    <label>University Name</label>
                    <input type="text" defaultValue="Centrum University" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Academic Year</label>
                    <select className="form-select" defaultValue="2024-2025">
                      <option value="2024-2025">2024-2025</option>
                      <option value="2025-2026">2025-2026</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Maximum Leave Days per Year</label>
                    <input type="number" defaultValue="30" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Auto-approve Leave Under (days)</label>
                    <input type="number" defaultValue="3" className="form-input" />
                  </div>
                </div>
                <button className="btn btn-primary">Save Configuration</button>
              </div>

              <div className="settings-card">
                <div className="settings-header">
                  <h3>Backup & Security</h3>
                  <p>Manage system backups and security settings</p>
                </div>
                <div className="security-settings">
                  <div className="setting-item">
                    <label>Auto Backup</label>
                    <div className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  <div className="setting-item">
                    <label>Two-Factor Authentication</label>
                    <div className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </div>
                  </div>
                  <div className="setting-item">
                    <label>Password Complexity</label>
                    <select className="form-select" defaultValue="medium">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="backup-actions">
                    <button className="btn btn-secondary">Create Backup</button>
                    <button className="btn btn-outline">Download Logs</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a section</div>;
    }
  };

  // Update the sidebar navigation to include Subjects
  const sidebarItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'faculty-applications', label: 'Faculty Applications', icon: UserPlus },
    { id: 'subjects', label: 'Subject Management', icon: FileText },
    { id: 'gallery', label: 'Gallery Management', icon: Image },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Admin Dashboard</h2>
          <p>Welcome, {user?.firstName} {user?.lastName}</p>
        </div>
        
        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <button 
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
      
      <div className="dashboard-main">
        {renderContent()}
      </div>

      {/* Add New User Modal */}
      {showAddUserForm && (
        <div className="modal-overlay" onClick={() => setShowAddUserForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New User</h3>
              <button 
                className="close-modal" 
                onClick={() => setShowAddUserForm(false)}
                disabled={loading}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="add-user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={newUserForm.firstName}
                    onChange={(e) => handleNewUserFormChange('firstName', e.target.value)}
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={newUserForm.lastName}
                    onChange={(e) => handleNewUserFormChange('lastName', e.target.value)}
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => handleNewUserFormChange('email', e.target.value)}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Password * (min 8 characters)</label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => handleNewUserFormChange('password', e.target.value)}
                  className="form-input"
                  required
                  minLength="8"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={(e) => handleNewUserFormChange('phone', e.target.value)}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>User Role *</label>
                  <select
                    value={newUserForm.userType}
                    onChange={(e) => handleNewUserFormChange('userType', e.target.value)}
                    className="form-select"
                    required
                    disabled={loading}
                  >
                    <option value="faculty">Faculty</option>
                    <option value="dean">Dean</option>
                    <option value="researcher">Researcher</option>
                    <option value="admin">Admin</option>
                    <option value="vc">Vice Chancellor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={newUserForm.department}
                    onChange={(e) => handleNewUserFormChange('department', e.target.value)}
                    className="form-select"
                    required
                    disabled={loading}
                  >
                    <option value="computer-science">Computer Science</option>
                    <option value="cse">CSE</option>
                    <option value="ece">ECE</option>
                    <option value="eee">EEE</option>
                    <option value="bsc">BSc</option>
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
              
              {/* Show school section field for faculty and dean users */}
              {(newUserForm.userType === 'faculty' || newUserForm.userType === 'dean') && (
                <div className="form-group">
                  <label>School Section *</label>
                  <select
                    value={newUserForm.schoolSection}
                    onChange={(e) => handleNewUserFormChange('schoolSection', e.target.value)}
                    className="form-select"
                    required
                    disabled={loading}
                  >
                    <option value="SOET">SOET</option>
                    <option value="School of Forensics science">School of Forensics Science</option>
                    <option value="radiology and Agriculture">Radiology and Agriculture</option>
                    <option value="Anesthesia">Anesthesia</option>
                    <option value="Optometry">Optometry</option>
                    <option value="Pharmacy">Pharmacy</option>
                  </select>
                </div>
              )}
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddUserForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && userDetailsData && (
        <div className="modal-overlay" onClick={() => setShowUserDetails(false)}>
          <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>User Details</h3>
              <button 
                className="close-modal" 
                onClick={() => setShowUserDetails(false)}
                disabled={loading}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="user-details-content">
              <div className="detail-row">
                <span className="label">Name:</span>
                <span>{userDetailsData.firstName} {userDetailsData.lastName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span>{userDetailsData.email}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span>{userDetailsData.phone || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Role:</span>
                <span className="role-badge">{userDetailsData.userType}</span>
              </div>
              <div className="detail-row">
                <span className="label">Department:</span>
                <span>{userDetailsData.department || 'Not assigned'}</span>
              </div>
              <div className="detail-row">
                <span className="label">School Section:</span>
                <span>{userDetailsData.schoolSection || 'Not assigned'}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status-badge ${userDetailsData.status}`}>
                  {userDetailsData.status}
                </span>
              </div>
              <div className="detail-row password-row">
                <span className="label">Password Hash:</span>
                <div className="password-display">
                  <span>{showPassword ? userDetailsData.password : '••••••••'}</span>
                  <button 
                    className="toggle-password" 
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="detail-row">
                <span className="label">Join Date:</span>
                <span>{new Date(userDetailsData.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowUserDetails(false)}
                disabled={loading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserForm && (
        <div className="modal-overlay" onClick={() => setShowEditUserForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button 
                className="close-modal" 
                onClick={() => setShowEditUserForm(false)}
                disabled={loading}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="edit-user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={editUserForm.firstName}
                    onChange={(e) => handleEditUserFormChange('firstName', e.target.value)}
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={editUserForm.lastName}
                    onChange={(e) => handleEditUserFormChange('lastName', e.target.value)}
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => handleEditUserFormChange('email', e.target.value)}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  value={editUserForm.phone}
                  onChange={(e) => handleEditUserFormChange('phone', e.target.value)}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>User Role *</label>
                  <select
                    value={editUserForm.userType}
                    onChange={(e) => handleEditUserFormChange('userType', e.target.value)}
                    className="form-select"
                    required
                    disabled={loading}
                  >
                    <option value="faculty">Faculty</option>
                    <option value="dean">Dean</option>
                    <option value="researcher">Researcher</option>
                    <option value="admin">Admin</option>
                    <option value="vc">Vice Chancellor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={editUserForm.department}
                    onChange={(e) => handleEditUserFormChange('department', e.target.value)}
                    className="form-select"
                    required
                    disabled={loading}
                  >
                    <option value="computer-science">Computer Science</option>
                    <option value="cse">CSE</option>
                    <option value="ece">ECE</option>
                    <option value="eee">EEE</option>
                    <option value="bsc">BSc</option>
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
              
              {/* Show school section field for faculty and dean users */}
              {(editUserForm.userType === 'faculty' || editUserForm.userType === 'dean') && (
                <div className="form-group">
                  <label>School Section *</label>
                  <select
                    value={editUserForm.schoolSection}
                    onChange={(e) => handleEditUserFormChange('schoolSection', e.target.value)}
                    className="form-select"
                    required
                    disabled={loading}
                  >
                    <option value="SOET">SOET</option>
                    <option value="School of Forensics science">School of Forensics Science</option>
                    <option value="radiology and Agriculture">Radiology and Agriculture</option>
                    <option value="Anesthesia">Anesthesia</option>
                    <option value="Optometry">Optometry</option>
                    <option value="Pharmacy">Pharmacy</option>
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editUserForm.password}
                  onChange={(e) => handleEditUserFormChange('password', e.target.value)}
                  className="form-input"
                  minLength="8"
                  disabled={loading}
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditUserForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;