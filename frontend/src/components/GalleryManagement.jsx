import React, { useState, useEffect } from 'react';
import { Upload, Edit, Trash2, Eye, Image as ImageIcon, Plus, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { 
  getAdminGalleryImages, 
  uploadGalleryImage, 
  updateGalleryImage, 
  deleteGalleryImage, 
  getGalleryCategories,
  getImageUrl 
} from '../services/galleryService';

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'campus',
    tags: '',
    displayOrder: 0
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadError, setUploadError] = '';

  // Load gallery images
  const loadImages = async () => {
    setLoading(true);
    try {
      const result = await getAdminGalleryImages({ limit: 24 });
      
      if (result.success) {
        setImages(result.data);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
    
    setLoading(false);
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const result = await getGalleryCategories();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadImages();
    loadCategories();
  }, []);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setUploadError('');
    } else {
      setUploadError('Please select a valid image file (JPEG, PNG, GIF, WebP).');
      setSelectedFile(null);
    }
  };

  // Handle upload submit
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    console.log('Upload form submitted');
    
    if (!selectedFile) {
      setUploadError('Please select an image file.');
      return;
    }

    if (!uploadData.title) {
      setUploadError('Please enter a title for the image.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');
    
    try {
      // Prepare tags array
      const tagsArray = uploadData.tags 
        ? uploadData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];
      
      const imageData = {
        title: uploadData.title,
        description: uploadData.description,
        category: uploadData.category,
        tags: tagsArray,
        displayOrder: uploadData.displayOrder
      };

      console.log('Uploading image with data:', imageData);
      console.log('Selected file:', selectedFile);
      
      const result = await uploadGalleryImage(imageData, selectedFile);
      
      console.log('Upload result:', result);
      
      if (result.success) {
        console.log('Upload successful');
        setShowUploadModal(false);
        setUploadData({
          title: '',
          description: '',
          category: 'campus',
          tags: '',
          displayOrder: 0
        });
        setSelectedFile(null);
        setUploadError('');
        await loadImages(); // Reload images
        alert('Image uploaded successfully! The image is now visible on the homepage in the Campus Life section.');
        
        // Dispatch a custom event to notify other components (like HomePage) to refresh
        window.dispatchEvent(new CustomEvent('galleryImageUploaded'));
      } else {
        console.log('Upload failed:', result.message);
        setUploadError(result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
      setUploadError(errorMessage);
    }
    
    setUploadLoading(false);
  };

  // Handle delete image
  const handleDeleteImage = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      try {
        const result = await deleteGalleryImage(imageId);
        if (result.success) {
          await loadImages(); // Reload images
          alert('Image deleted successfully!');
        } else {
          alert(result.message || 'Failed to delete image');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete image: ' + error.message);
      }
    }
  };

  // Toggle image active status
  const toggleImageStatus = async (imageId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const result = await updateGalleryImage(imageId, { isActive: newStatus });
      
      if (result.success) {
        await loadImages(); // Reload images
        alert(`Image ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      } else {
        alert(result.message || `Failed to ${newStatus ? 'activate' : 'deactivate'} image`);
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      alert(`Failed to ${!currentStatus ? 'activate' : 'deactivate'} image: ` + error.message);
    }
  };

  return (
    <div className="gallery-management">
      <div className="gallery-header">
        <div className="header-content">
          <h2>Gallery Management</h2>
          <p>Manage campus images and photo gallery</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Upload Image
        </button>
      </div>

      {/* Display recently uploaded images */}
      {images.length > 0 && (
        <div className="recent-uploads-section">
          <div className="card-header">
            <h3>Recently Uploaded Images</h3>
          </div>
          <div className="recent-uploads-grid">
            {images.slice(0, 4).map((image) => (
              <div key={image._id} className="recent-upload-item">
                <div className="image-container">
                  <img 
                    src={getImageUrl(image.imageUrl)} 
                    alt={image.title}
                  />
                </div>
                <div className="image-info">
                  <h4>{image.title}</h4>
                  <div className="image-meta">
                    <span className="date">
                      {new Date(image.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="gallery-grid-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="empty-state">
            <ImageIcon size={48} />
            <h3>No Images Found</h3>
            <p>Upload your first image to get started.</p>
          </div>
        ) : (
          <div className="admin-gallery-grid">
            {images.map((image) => (
              <div key={image._id} className="admin-gallery-item">
                <div className="image-container">
                  <img 
                    src={getImageUrl(image.imageUrl)} 
                    alt={image.title}
                  />
                  <div className="image-overlay">
                    <div className="overlay-actions">
                      <button 
                        className="action-btn edit"
                        onClick={() => setSelectedImage(image)}
                        title="Edit Image"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteImage(image._id)}
                        title="Delete Image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="image-info">
                  <h4>{image.title}</h4>
                  <div className="image-meta">
                    <span className="category">{image.category}</span>
                    <span className="date">
                      {new Date(image.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="image-status">
                    <span className={`status ${image.isActive ? 'active' : 'inactive'}`}>
                      {image.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button 
                      className="toggle-status-btn"
                      onClick={() => toggleImageStatus(image._id, image.isActive)}
                      title={image.isActive ? 'Deactivate image' : 'Activate image'}
                    >
                      {image.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal - Simplified form */}
      {showUploadModal && (
        <div className="overlay">
          <div className="overlay-backdrop" onClick={() => setShowUploadModal(false)}></div>
          <div className="auth-modal upload-modal">
            <div className="modal-header">
              <h2>Upload New Image</h2>
              <button onClick={() => setShowUploadModal(false)} className="close-button">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="upload-form">
              {uploadError && (
                <div className="error-message">
                  {uploadError}
                </div>
              )}
              
              <div className="form-group">
                <label>Choose File *</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="form-input"
                  required
                />
                {selectedFile && (
                  <div className="file-preview">
                    <span>Selected: {selectedFile.name}</span>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Title *</label>
                <input 
                  type="text" 
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  className="form-input"
                  required
                  placeholder="Enter a title for this image"
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-outline"
                  disabled={uploadLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={uploadLoading || !selectedFile || !uploadData.title}
                >
                  {uploadLoading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;