import api from './api';

// Get gallery images (Public)
export const getGalleryImages = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add default category filter for campus images
    if (!filters.category) {
      filters.category = 'campus';
    }
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/gallery?${params.toString()}`);
    
    return {
      success: true,
      data: response.data,
      pagination: response.pagination
    };
  } catch (error) {
    console.error('Gallery service error:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch gallery images'
    };
  }
};

// Get gallery categories (Public)
export const getGalleryCategories = async () => {
  try {
    const response = await api.get('/gallery/categories');
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch categories'
    };
  }
};

// Upload gallery image (Admin only)
export const uploadGalleryImage = async (imageData, imageFile) => {
  try {
    const formData = new FormData();
    
    // Append form fields
    Object.keys(imageData).forEach(key => {
      if (imageData[key] !== null && imageData[key] !== undefined && imageData[key] !== '') {
        if (key === 'tags' && Array.isArray(imageData[key])) {
          formData.append(key, JSON.stringify(imageData[key]));
        } else {
          formData.append(key, imageData[key]);
        }
      }
    });
    
    // Append image file
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    console.log('Uploading image with data:', imageData);
    console.log('Uploading file:', imageFile);
    
    const response = await api.post('/gallery', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      // Add timeout to prevent hanging
      timeout: 30000
    });
    
    console.log('Upload response:', response);
    
    // Check if response has the expected structure
    if (response && response.data) {
      return {
        success: response.data.success || true,
        message: response.data.message || 'Image uploaded successfully',
        data: response.data.data || response.data
      };
    } else {
      return {
        success: true,
        message: 'Image uploaded successfully',
        data: response
      };
    }
  } catch (error) {
    console.error('Upload error:', error);
    // More detailed error handling
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: 'Upload timed out. Please try again with a smaller image.'
      };
    } else if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data.message || `Server error: ${error.response.status}`
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.'
      };
    } else {
      // Something else happened
      return {
        success: false,
        message: error.message || 'Failed to upload image'
      };
    }
  }
};

// Get gallery images for admin (Admin only)
export const getAdminGalleryImages = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/gallery/admin?${params.toString()}`);
    
    return {
      success: true,
      data: response.data,
      pagination: response.pagination
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to fetch admin gallery'
    };
  }
};

// Update gallery image (Admin only)
export const updateGalleryImage = async (imageId, updateData) => {
  try {
    const response = await api.put(`/gallery/${imageId}`, updateData);
    
    return {
      success: true,
      message: response.message,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to update image'
    };
  }
};

// Delete gallery image (Admin only)
export const deleteGalleryImage = async (imageId) => {
  try {
    const response = await api.delete(`/gallery/${imageId}`);
    
    return {
      success: true,
      message: response.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to delete image'
    };
  }
};

// Get image URL helper
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Otherwise, construct the full URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://faculty-management-hsdq.onrender.com';

  return `${baseUrl}${imageUrl}`;
};

export default {
  getGalleryImages,
  getGalleryCategories,
  uploadGalleryImage,
  getAdminGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
  getImageUrl
};