import React, { useState } from 'react';
import { 
  User, 
  BookOpen, 
  FileText,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  MessageSquare,
  Clock,
  Search,
  Filter
} from 'lucide-react';

const ResearcherDashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const mockPublications = [
    {
      id: 1,
      title: 'Machine Learning Applications in Education',
      author: 'Dr. John Doe',
      faculty: 'Computer Science',
      type: 'Journal Article',
      journal: 'International Journal of Educational Technology',
      year: 2024,
      status: 'under_review',
      submittedDate: '2024-12-15',
      pages: 15,
      keywords: ['Machine Learning', 'Education', 'Technology'],
      abstract: 'This paper explores the applications of machine learning in modern educational systems...'
    },
    {
      id: 2,
      title: 'Advanced Algorithms and Data Structures',
      author: 'Dr. John Doe',
      faculty: 'Computer Science',
      type: 'Book',
      publisher: 'Academic Press International',
      year: 2024,
      status: 'approved',
      submittedDate: '2024-11-20',
      pages: 450,
      keywords: ['Algorithms', 'Data Structures', 'Programming'],
      abstract: 'A comprehensive guide to advanced algorithms and data structures for computer science students...'
    },
    {
      id: 3,
      title: 'Quantum Computing Fundamentals',
      author: 'Dr. Alice Brown',
      faculty: 'Physics',
      type: 'Conference Paper',
      conference: 'IEEE International Conference on Computing',
      year: 2024,
      status: 'rejected',
      submittedDate: '2024-12-01',
      pages: 8,
      keywords: ['Quantum Computing', 'Physics', 'Computing'],
      abstract: 'An introduction to the fundamental principles of quantum computing...',
      reviewNotes: 'Needs more experimental validation and clearer methodology section.'
    }
  ];

  const filteredPublications = mockPublications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         pub.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || pub.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Edit Profile</h2>
              <p>Update your researcher profile and specialization</p>
            </div>
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" defaultValue={user?.firstName || 'Dr. Sarah'} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" defaultValue={user?.lastName || 'Wilson'} className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" defaultValue={user?.email || 'sarah.wilson@university.edu'} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" defaultValue="+1 555-0321" className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Research Area</label>
                  <select className="form-select" defaultValue="computer-science">
                    <option value="computer-science">Computer Science</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="biology">Biology</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Specialization</label>
                  <input type="text" defaultValue="Academic Research & Publication Review" className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label>Research Interests</label>
                <textarea 
                  className="form-textarea" 
                  rows={3} 
                  defaultValue="Machine Learning, Data Science, Educational Technology, Academic Writing, Peer Review"
                ></textarea>
              </div>
              <button className="btn btn-primary">Update Profile</button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Publication Review</h2>
              <p>Review and verify faculty publications and research papers</p>
            </div>
            
            <div className="review-actions">
              <div className="search-filter-container">
                <div className="search-box">
                  <Search size={20} />
                  <input
                    type="text"
                    placeholder="Search publications..."
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
                    <option value="all">All Status</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="review-stats">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon pending">
                    <Clock size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-number">5</div>
                    <div className="stat-label">Pending Reviews</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon present">
                    <CheckCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-number">23</div>
                    <div className="stat-label">Approved This Month</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon absent">
                    <XCircle size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-number">2</div>
                    <div className="stat-label">Rejected</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon percentage">
                    <BookOpen size={24} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-number">89%</div>
                    <div className="stat-label">Approval Rate</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="publications-review-list">
              {filteredPublications.map(pub => (
                <div key={pub.id} className={`publication-review-card ${pub.status}`}>
                  <div className="publication-review-header">
                    <div className="publication-info">
                      <h4>{pub.title}</h4>
                      <div className="publication-meta">
                        <span className="author">By {pub.author}</span>
                        <span className="separator">•</span>
                        <span className="faculty">{pub.faculty} Faculty</span>
                        <span className="separator">•</span>
                        <span className="type">{pub.type}</span>
                      </div>
                    </div>
                    <span className={`status-badge ${pub.status}`}>
                      {pub.status === 'under_review' && <AlertCircle size={14} />}
                      {pub.status === 'approved' && <CheckCircle size={14} />}
                      {pub.status === 'rejected' && <XCircle size={14} />}
                      {pub.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  
                  <div className="publication-details">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="label">Publication:</span>
                        <span>{pub.journal || pub.publisher || pub.conference}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Year:</span>
                        <span>{pub.year}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Pages:</span>
                        <span>{pub.pages}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Submitted:</span>
                        <span>{new Date(pub.submittedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="keywords">
                      <span className="label">Keywords:</span>
                      <div className="keyword-tags">
                        {pub.keywords.map((keyword, index) => (
                          <span key={index} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="abstract">
                      <span className="label">Abstract:</span>
                      <p>{pub.abstract}</p>
                    </div>
                    
                    {pub.reviewNotes && (
                      <div className="review-notes">
                        <span className="label">Review Notes:</span>
                        <p className="notes-text">{pub.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="publication-actions">
                    <button className="btn-icon" title="View Full Document">
                      <Eye size={16} />
                    </button>
                    <button className="btn-icon" title="Download PDF">
                      <Download size={16} />
                    </button>
                    <button className="btn-icon" title="Add Comments">
                      <MessageSquare size={16} />
                    </button>
                    {pub.status === 'under_review' && (
                      <>
                        <button className="btn btn-primary">
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button className="btn btn-danger">
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="section-content">
            <div className="section-header">
              <h2>Review Reports</h2>
              <p>Generate and view review reports and analytics</p>
            </div>
            
            <div className="reports-container">
              <div className="report-card">
                <div className="report-header">
                  <h3>Monthly Review Summary</h3>
                  <span className="report-period">December 2024</span>
                </div>
                <div className="report-stats">
                  <div className="report-stat">
                    <span className="stat-value">28</span>
                    <span className="stat-label">Total Reviews</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-value">23</span>
                    <span className="stat-label">Approved</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-value">5</span>
                    <span className="stat-label">Under Review</span>
                  </div>
                </div>
                <button className="btn btn-outline">Generate Report</button>
              </div>

              <div className="report-card">
                <div className="report-header">
                  <h3>Faculty Publications by Department</h3>
                  <span className="report-period">2024</span>
                </div>
                <div className="department-stats">
                  <div className="dept-stat">
                    <span className="dept-name">Computer Science</span>
                    <div className="dept-bar">
                      <div className="dept-progress" style={{width: '85%'}}></div>
                    </div>
                    <span className="dept-count">34</span>
                  </div>
                  <div className="dept-stat">
                    <span className="dept-name">Mathematics</span>
                    <div className="dept-bar">
                      <div className="dept-progress" style={{width: '65%'}}></div>
                    </div>
                    <span className="dept-count">26</span>
                  </div>
                  <div className="dept-stat">
                    <span className="dept-name">Physics</span>
                    <div className="dept-bar">
                      <div className="dept-progress" style={{width: '45%'}}></div>
                    </div>
                    <span className="dept-count">18</span>
                  </div>
                </div>
                <button className="btn btn-outline">Download Report</button>
              </div>

              <div className="report-card">
                <div className="report-header">
                  <h3>Review Performance</h3>
                  <span className="report-period">Your Statistics</span>
                </div>
                <div className="performance-stats">
                  <div className="perf-item">
                    <span className="perf-label">Average Review Time</span>
                    <span className="perf-value">2.3 days</span>
                  </div>
                  <div className="perf-item">
                    <span className="perf-label">Reviews Completed</span>
                    <span className="perf-value">156</span>
                  </div>
                  <div className="perf-item">
                    <span className="perf-label">Accuracy Rating</span>
                    <span className="perf-value">94%</span>
                  </div>
                </div>
                <button className="btn btn-outline">View Details</button>
              </div>
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
          <h2>Researcher Dashboard</h2>
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
            className={`nav-item ${activeSection === 'review' ? 'active' : ''}`}
            onClick={() => setActiveSection('review')}
          >
            <BookOpen size={20} />
            Publication Review
          </button>
          <button 
            className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveSection('reports')}
          >
            <FileText size={20} />
            Review Reports
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

export default ResearcherDashboard;