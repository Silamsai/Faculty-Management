import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getGalleryImages, getImageUrl } from '../services/galleryService';

const HomePage = ({ onSignupClick, onLoginClick }) => {
  console.log('HomePage is rendering!');
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);

  // Load gallery images on component mount
  useEffect(() => {
    const loadGalleryImages = async () => {
      try {
        setGalleryLoading(true);
        const result = await getGalleryImages({ 
          limit: 8, 
          sortBy: 'displayOrder',
          category: 'campus'
        });
        console.log('Gallery images loaded:', result);
        if (result.success) {
          setGalleryImages(result.data);
        } else {
          console.error('Failed to load gallery images:', result.message);
        }
      } catch (error) {
        console.error('Gallery loading error:', error);
      } finally {
        setGalleryLoading(false);
      }
    };

    loadGalleryImages();
    
    // Listen for gallery image upload events
    const handleGalleryImageUpload = () => {
      loadGalleryImages();
    };
    
    window.addEventListener('galleryImageUploaded', handleGalleryImageUpload);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('galleryImageUploaded', handleGalleryImageUpload);
    };
  }, []);
  
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <div className="homepage">
      {/* University Header */}
      <div className="university-header">
        <div className="container">
          <div className="university-logo-section">
            <div className="logo-placeholder">
              <div className="logo-box">
                {/* Replace this with your custom logo image */}
                <img 
                  src="/cent.jpg" 
                  alt="University Logo" 
                  className="custom-logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
            <div className="university-info">
              <h1 className="university-name">Centurion University Of Technology & Management</h1>
              <p className="university-tagline">Excellence in Education & Research</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Welcome to Faculty Management System
              </h1>
              <p className="hero-subtitle">
                Streamline your academic operations with our comprehensive faculty management platform
              </p>
              <div className="hero-buttons">
                <button 
                  className="btn btn-outline"
                  onClick={() => scrollToSection('features')}
                >
                  EXPLORE FEATURES
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => scrollToSection('contact')}
                >
                  CONTACT US
                </button>
              </div>
            </div>
            <div className="hero-image">
              <img 
                src="/build.jpg" 
                alt="University Campus" 
                className="hero-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="key-features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Key Features</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card" onClick={() => scrollToSection('about')}>
              <div className="feature-icon">🏛️</div>
              <h3>Faculty Management</h3>
              <p>Comprehensive faculty profiles, attendance tracking, and performance monitoring</p>
            </div>
            <div className="feature-card" onClick={() => scrollToSection('features')}>
              <div className="feature-icon">📅</div>
              <h3>Smart Scheduling</h3>
              <p>Automated timetable generation and conflict resolution for optimal class scheduling</p>
            </div>
            <div className="feature-card" onClick={() => scrollToSection('contact')}>
              <div className="feature-icon">✈️</div>
              <h3>Leave Management</h3>
              <p>Streamlined leave application and approval process with real-time status updates</p>
            </div>
            <div className="feature-card" onClick={() => scrollToSection('gallery')}>
              <div className="feature-icon">📊</div>
              <h3>Analytics Dashboard</h3>
              <p>Real-time insights and reports for better decision making and performance tracking</p>
            </div>
            <div className="feature-card" onClick={() => scrollToSection('about')}>
              <div className="feature-icon">📚</div>
              <h3>Research Publications</h3>
              <p>Upload and manage research publications with AI-powered analysis and verification</p>
            </div>
            <div className="feature-card" onClick={() => scrollToSection('contact')}>
              <div className="feature-icon">🔒</div>
              <h3>Secure Authentication</h3>
              <p>Enterprise-grade security with role-based access control and data protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="gallery-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Campus Life</h2>
            <p className="section-subtitle">Explore our vibrant campus and academic facilities</p>
          </div>
          <div className="gallery-grid">
            {galleryLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading campus life images...</p>
              </div>
            ) : galleryImages.length > 0 ? (
              galleryImages.map((image) => (
                <div className="gallery-item" key={image._id}>
                  <img 
                    src={getImageUrl(image.imageUrl)} 
                    alt={image.title} 
                    onError={(e) => {
                      console.error('Image failed to load:', image.imageUrl);
                      e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="gallery-overlay">
                    <h4>{image.title}</h4>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-gallery">
                <p>No campus life images available at the moment.</p>
              </div>
            )}
          </div>
          <div className="gallery-actions">
            <button 
              className="btn btn-outline see-more-btn"
              onClick={() => scrollToSection('gallery')}
            >
              See More Images
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">About Centurion University</h2>
          </div>
          <div className="about-content">
            <p className="about-description">
              Centurion University stands at the forefront of higher education, 
              fostering innovation, research excellence, and academic achievement. 
              Join our community of distinguished faculty and shape the minds of tomorrow.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Contact Us</h2>
            <p className="section-subtitle">Get in touch with Centurion University</p>
          </div>
          <div className="contact-content">
            <div className="contact-grid">
              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <h3>Phone</h3>
                <p>+91 9876543210</p>
                <p>+91 9876543211</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">✉️</div>
                <h3>Email</h3>
                <p>info@centurionuniversity.edu</p>
                <p>admissions@centurionuniversity.edu</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">📍</div>
                <h3>Address</h3>
                <p>Centurion University Campus</p>
                <p>Academic City, Education District</p>
                <p>Pin: 751024</p>
              </div>
              <div className="contact-card">
                <div className="contact-icon">🕰️</div>
                <h3>Office Hours</h3>
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p>© 2024 Faculty Management System - Centurion University</p>
            <p>Built with React, Node.js, and MongoDB</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;