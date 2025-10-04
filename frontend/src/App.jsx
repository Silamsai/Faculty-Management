import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginOverlay from './components/LoginOverlay';
import SignupOverlay from './components/SignupOverlay';
import ResetPassword from './components/ResetPassword';
import FacultyDashboard from './components/FacultyDashboard';
import DeanDashboard from './components/DeanDashboard';
import AdminDashboard from './components/AdminDashboard';
import ResearcherDashboard from './components/ResearcherDashboard';
import VCDashboard from './components/VCDashboard';
import authService from './services/authService';
import leaveService from './services/leaveService';
import './App.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showApprovalMessage, setShowApprovalMessage] = useState(false); // New state for approval message
  const [user, setUser] = useState(null);
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current route is a dashboard
  const isDashboardRoute = () => {
    return location.pathname.includes('-dashboard');
  };

  // Load theme preference from localStorage on app start
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document and save to localStorage
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Simplified auth check - only run when needed
  useEffect(() => {
    const initAuth = () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getCurrentUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
      }
    };

    initAuth();
  }, []);

  // Load user's leave applications
  const loadLeaveApplications = async () => {
    try {
      const response = await leaveService.getMyApplications();
      console.log('Loaded faculty leave applications:', response);
      setLeaveApplications(response.applications || []);
    } catch (error) {
      console.error('Error loading leave applications:', error);
      setLeaveApplications([]); // Set to empty array on error
    }
  };

  // Load all leave applications (for dean/admin)
  const loadAllLeaveApplications = async () => {
    try {
      const response = await leaveService.getAllApplications();
      console.log('Loaded all leave applications:', response);
      setLeaveApplications(response.applications || []);
    } catch (error) {
      console.error('Error loading all leave applications:', error);
      setLeaveApplications([]); // Set to empty array on error
    }
  };

  // Add effect to load leave applications when user type changes
  useEffect(() => {
    if (user) {
      console.log('Loading leave applications for user type:', user.userType);
      if (user.userType === 'faculty') {
        loadLeaveApplications();
      } else if (user.userType === 'dean' || user.userType === 'admin' || user.userType === 'vc') {
        loadAllLeaveApplications();
      }
    }
  }, [user]);

  // Add event listener to refresh leave applications when updated
  useEffect(() => {
    const handleLeaveApplicationsUpdated = () => {
      if (user) {
        if (user.userType === 'faculty') {
          loadLeaveApplications();
        } else if (user.userType === 'dean' || user.userType === 'admin' || user.userType === 'vc') {
          loadAllLeaveApplications();
        }
      }
    };

    window.addEventListener('leaveApplicationsUpdated', handleLeaveApplicationsUpdated);
    
    return () => {
      window.removeEventListener('leaveApplicationsUpdated', handleLeaveApplicationsUpdated);
    };
  }, [user]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = async (loginData) => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors before attempting login
      
      const response = await authService.login(loginData);
      console.log('Login response:', response); // Debug log
      
      setUser(response.user);
      setShowLogin(false);
      
      // Load leave applications based on user type
      if (response.user.userType === 'faculty') {
        await loadLeaveApplications();
      } else if (response.user.userType === 'dean' || response.user.userType === 'admin' || response.user.userType === 'vc') {
        await loadAllLeaveApplications();
      }
      
      // Navigate to appropriate dashboard
      navigate(`/${response.user.userType}-dashboard`);
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (signupData) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authService.signup(signupData);
      
      setUser(response.user);
      setShowSignup(false);
      
      // Check if the user is a faculty member
      if (response.user.userType === 'faculty') {
        // Show approval message instead of navigating to dashboard
        setShowApprovalMessage(true);
      } else {
        // Navigate to appropriate dashboard for other user types
        navigate(`/${response.user.userType}-dashboard`);
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setLeaveApplications([]);
    // Don't reset theme on logout - keep user preference
    navigate('/');
  };

  const addLeaveApplication = async (application) => {
    try {
      setLoading(true);
      const response = await leaveService.applyLeave(application);
      console.log('Leave application submitted:', response);
      
      // Reload applications to get updated list
      if (user && user.userType === 'faculty') {
        await loadLeaveApplications();
      } else if (user && (user.userType === 'dean' || user.userType === 'admin' || user.userType === 'vc')) {
        await loadAllLeaveApplications();
      }
      
      return response;
    } catch (error) {
      console.error('Error applying for leave:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLeaveApplication = async (applicationId, status, reviewNotes = '') => {
    try {
      setLoading(true);
      await leaveService.reviewApplication(applicationId, status, reviewNotes);
      
      // Reload applications to get updated list
      if (user && (user.userType === 'dean' || user.userType === 'admin' || user.userType === 'vc')) {
        await loadAllLeaveApplications();
      } else if (user && user.userType === 'faculty') {
        await loadLeaveApplications();
      }
      
    } catch (error) {
      console.error('Error updating leave application:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const closeOverlays = () => {
    setShowLogin(false);
    setShowSignup(false);
    setError(''); // Clear any errors when closing overlays
  };

  return (
    <div className="App">
      {/* Show navbar only on non-dashboard pages */}
      {!isDashboardRoute() && (
        <Navbar 
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onLoginClick={() => setShowLogin(true)}
          onSignupClick={() => setShowSignup(true)}
        />
      )}
      
      <Routes>
        <Route path="/" element={
          <HomePage 
            onSignupClick={() => setShowSignup(true)}
            onLoginClick={() => setShowLogin(true)}
          />
        } />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* <Route path="/test-gallery" element={<TestGallery />} */}
        <Route path="/faculty-dashboard" element={
          user ? (
            <FacultyDashboard 
              user={user} 
              onLogout={handleLogout} 
              leaveApplications={leaveApplications.filter(app => 
                app.applicantEmail === user?.email || 
                (app.applicantId && app.applicantId.email === user?.email) ||
                (app.applicantId && app.applicantId._id === user?._id)
              )}
              onAddLeaveApplication={addLeaveApplication}
              loading={loading}
            />
          ) : (
            <HomePage onSignupClick={() => setShowSignup(true)} onLoginClick={() => setShowLogin(true)} />
          )
        } />
        <Route path="/dean-dashboard" element={
          user ? (
            <DeanDashboard 
              user={user} 
              onLogout={handleLogout} 
              leaveApplications={leaveApplications}
            />
          ) : (
            <HomePage onSignupClick={() => setShowSignup(true)} onLoginClick={() => setShowLogin(true)} />
          )
        } />
        <Route path="/admin-dashboard" element={
          user ? (
            <AdminDashboard user={user} onLogout={handleLogout} />
          ) : (
            <HomePage onSignupClick={() => setShowSignup(true)} onLoginClick={() => setShowLogin(true)} />
          )
        } />
        <Route path="/researcher-dashboard" element={
          user ? (
            <ResearcherDashboard user={user} onLogout={handleLogout} />
          ) : (
            <HomePage onSignupClick={() => setShowSignup(true)} onLoginClick={() => setShowLogin(true)} />
          )
        } />
        <Route path="/vc-dashboard" element={
          user ? (
            <VCDashboard user={user} onLogout={handleLogout} />
          ) : (
            <HomePage onSignupClick={() => setShowSignup(true)} onLoginClick={() => setShowLogin(true)} />
          )
        } />
      </Routes>
      
      <LoginOverlay 
        isOpen={showLogin}
        onClose={closeOverlays}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
          setError('');
        }}
        onLogin={handleLogin}
        loading={loading}
        error={error}
        clearError={() => setError('')} // Add this new prop
      />
      
      <SignupOverlay 
        isOpen={showSignup}
        onClose={closeOverlays}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
          setError('');
        }}
        onSignup={handleSignup}
        loading={loading}
        error={error}
      />
      
      {/* Approval Message Modal */}
      {showApprovalMessage && (
        <div className="overlay">
          <div className="overlay-backdrop" onClick={() => setShowApprovalMessage(false)}></div>
          <div className="auth-modal">
            <div className="modal-header">
              <h2 className="modal-title">Account Pending Approval</h2>
            </div>
            <div className="approval-message">
              <p>Your account will be approved by the dean of your department. You will be notified once approved.</p>
              <button 
                className="btn btn-primary btn-full"
                onClick={() => {
                  setShowApprovalMessage(false);
                  navigate('/');
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;