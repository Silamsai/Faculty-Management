import React, { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  Building, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Calendar, 
  LogOut,
  Search,
  Filter,
  Eye
} from 'lucide-react';

const VCDashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [deans, setDeans] = useState([]);
  const [hods, setHods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  // Mock data for deans and HODs
  useEffect(() => {
    // In a real application, this would come from an API
    const mockDeans = [
      {
        id: 1,
        name: 'Dr. Sarah Johnson',
        department: 'School of Engineering & Technology',
        email: 's.johnson@university.edu',
        phone: '+1 555-0101',
        status: 'active',
        joinedDate: '2020-03-15',
        schoolSection: 'SOET'
      },
      {
        id: 2,
        name: 'Prof. Michael Chen',
        department: 'School of Forensics Science',
        email: 'm.chen@university.edu',
        phone: '+1 555-0102',
        status: 'active',
        joinedDate: '2019-08-22',
        schoolSection: 'School of Forensics science'
      },
      {
        id: 3,
        name: 'Dr. Emily Rodriguez',
        department: 'School of Agriculture & Radiology',
        email: 'e.rodriguez@university.edu',
        phone: '+1 555-0103',
        status: 'active',
        joinedDate: '2021-01-10',
        schoolSection: 'radiology and Agriculture'
      }
    ];

    const mockHods = [
      {
        id: 1,
        name: 'Dr. James Wilson',
        department: 'Computer Science',
        email: 'j.wilson@university.edu',
        phone: '+1 555-0111',
        status: 'active',
        joinedDate: '2018-09-01',
        schoolSection: 'SOET',
        reportsTo: 'Dr. Sarah Johnson'
      },
      {
        id: 2,
        name: 'Prof. Lisa Anderson',
        department: 'Mathematics',
        email: 'l.anderson@university.edu',
        phone: '+1 555-0112',
        status: 'active',
        joinedDate: '2017-02-15',
        schoolSection: 'SOET',
        reportsTo: 'Dr. Sarah Johnson'
      },
      {
        id: 3,
        name: 'Dr. Robert Taylor',
        department: 'Forensics',
        email: 'r.taylor@university.edu',
        phone: '+1 555-0113',
        status: 'active',
        joinedDate: '2020-11-30',
        schoolSection: 'School of Forensics science',
        reportsTo: 'Prof. Michael Chen'
      }
    ];

    setDeans(mockDeans);
    setHods(mockHods);
  }, []);

  const filteredDeans = deans.filter(dean => {
    const matchesSearch = dean.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dean.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterDepartment || dean.schoolSection === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  const filteredHods = hods.filter(hod => {
    const matchesSearch = hod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          hod.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterDepartment || hod.schoolSection === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  const renderOverview = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome, {user?.firstName} {user?.lastName}</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{deans.length}</div>
            <div className="stat-label">School Deans</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <User size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{hods.length}</div>
            <div className="stat-label">Department Heads</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Building size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-number">6</div>
            <div className="stat-label">Schools</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-number">24</div>
            <div className="stat-label">Departments</div>
          </div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <User size={16} />
            </div>
            <div className="activity-content">
              <p><strong>Dr. Sarah Johnson</strong> updated department budget</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <FileText size={16} />
            </div>
            <div className="activity-content">
              <p><strong>Annual Report</strong> submitted by School of Engineering</p>
              <span className="activity-time">1 day ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <TrendingUp size={16} />
            </div>
            <div className="activity-content">
              <p><strong>Enrollment</strong> increased by 12% this semester</p>
              <span className="activity-time">2 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeans = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>School Deans</h2>
        <p>Manage and view all school deans</p>
      </div>
      
      <div className="filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search deans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="form-select"
        >
          <option value="">All Schools</option>
          <option value="SOET">SOET</option>
          <option value="School of Forensics science">School of Forensics Science</option>
          <option value="radiology and Agriculture">Radiology and Agriculture</option>
          <option value="Anesthesia">Anesthesia</option>
          <option value="Optometry">Optometry</option>
          <option value="Pharmacy">Pharmacy</option>
        </select>
      </div>
      
      <div className="deans-grid">
        {filteredDeans.map(dean => (
          <div key={dean.id} className="dean-card">
            <div className="dean-header">
              <div className="dean-avatar">
                <User size={24} />
              </div>
              <div className="dean-info">
                <h3>{dean.name}</h3>
                <p className="dean-department">{dean.department}</p>
              </div>
            </div>
            <div className="dean-details">
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">{dean.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">{dean.phone}</span>
              </div>
              <div className="detail-item">
                <span className="label">School:</span>
                <span className="value">{dean.schoolSection}</span>
              </div>
              <div className="detail-item">
                <span className="label">Joined:</span>
                <span className="value">{new Date(dean.joinedDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className={`status-badge ${dean.status}`}>
                  {dean.status.charAt(0).toUpperCase() + dean.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="dean-actions">
              <button className="btn btn-outline">
                <Eye size={16} />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHods = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Department Heads</h2>
        <p>Manage and view all department heads</p>
      </div>
      
      <div className="filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search HODs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="form-select"
        >
          <option value="">All Schools</option>
          <option value="SOET">SOET</option>
          <option value="School of Forensics science">School of Forensics Science</option>
          <option value="radiology and Agriculture">Radiology and Agriculture</option>
          <option value="Anesthesia">Anesthesia</option>
          <option value="Optometry">Optometry</option>
          <option value="Pharmacy">Pharmacy</option>
        </select>
      </div>
      
      <div className="hods-grid">
        {filteredHods.map(hod => (
          <div key={hod.id} className="hod-card">
            <div className="hod-header">
              <div className="hod-avatar">
                <User size={24} />
              </div>
              <div className="hod-info">
                <h3>{hod.name}</h3>
                <p className="hod-department">{hod.department}</p>
              </div>
            </div>
            <div className="hod-details">
              <div className="detail-item">
                <span className="label">Email:</span>
                <span className="value">{hod.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">{hod.phone}</span>
              </div>
              <div className="detail-item">
                <span className="label">School:</span>
                <span className="value">{hod.schoolSection}</span>
              </div>
              <div className="detail-item">
                <span className="label">Reports to:</span>
                <span className="value">{hod.reportsTo}</span>
              </div>
              <div className="detail-item">
                <span className="label">Joined:</span>
                <span className="value">{new Date(hod.joinedDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className={`status-badge ${hod.status}`}>
                  {hod.status.charAt(0).toUpperCase() + hod.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="hod-actions">
              <button className="btn btn-outline">
                <Eye size={16} />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'deans':
        return renderDeans();
      case 'hods':
        return renderHods();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              <User size={24} />
            </div>
            <div className="user-details">
              <h3>{user?.firstName} {user?.lastName}</h3>
              <p>Vice Chancellor</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <TrendingUp size={20} />
            Overview
          </button>
          <button 
            className={`nav-item ${activeSection === 'deans' ? 'active' : ''}`}
            onClick={() => setActiveSection('deans')}
          >
            <Users size={20} />
            School Deans
          </button>
          <button 
            className={`nav-item ${activeSection === 'hods' ? 'active' : ''}`}
            onClick={() => setActiveSection('hods')}
          >
            <User size={20} />
            Department Heads
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
      
      <style jsx>{`
        /* Ensure active buttons are visible in dark mode */
        [data-theme="dark"] .nav-item.active {
          background: var(--button-primary) !important;
          color: white !important;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.6), 0 2px 4px rgba(59, 130, 246, 0.3);
        }
        
        [data-theme="dark"] .nav-item.active:hover {
          background: #2563eb !important;
        }
        
        [data-theme="dark"] .status-badge.active {
          background: #166534;
          color: #dcfce7;
        }
      `}</style>
    </div>
  );
};

export default VCDashboard;