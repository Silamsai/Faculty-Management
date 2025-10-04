import api from './api';

// Send OTP for faculty application
export const sendFacultyApplicationOTP = async (email) => {
  try {
    const response = await api.post('/faculty-applications/send-otp', { email });
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send OTP'
    };
  }
};

// Verify OTP for faculty application
export const verifyFacultyApplicationOTP = async (email, otp) => {
  try {
    const response = await api.post('/faculty-applications/verify-otp', { email, otp });
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to verify OTP'
    };
  }
};

// Submit faculty application
export const submitFacultyApplication = async (formData, resumeFile) => {
  try {
    const submitData = new FormData();
    
    // Append form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });
    
    // Append resume file
    if (resumeFile) {
      submitData.append('resume', resumeFile);
    } else {
      return {
        success: false,
        message: 'Resume file is required'
      };
    }
    
    // Use axios to send the form data
    const response = await api.post('/faculty-applications/submit', submitData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return {
      success: true,
      message: response.data.message || 'Application submitted successfully!',
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to submit application'
    };
  }
};

// Get all faculty applications (Admin only)
export const getFacultyApplications = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/faculty-applications?${params.toString()}`);
    
    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch applications'
    };
  }
};

// Get single faculty application (Admin only)
export const getFacultyApplication = async (applicationId) => {
  try {
    const response = await api.get(`/faculty-applications/${applicationId}`);
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch application'
    };
  }
};

// Review faculty application (Admin only)
export const reviewFacultyApplication = async (applicationId, reviewData) => {
  try {
    const response = await api.put(`/faculty-applications/${applicationId}/review`, reviewData);
    
    return {
      success: true,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to review application'
    };
  }
};

// Download resume (Admin only)
export const downloadResume = async (applicationId) => {
  try {
    const response = await api.get(`/faculty-applications/download-resume/${applicationId}`, {
      responseType: 'blob'
    });
    
    // Create blob URL
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    return {
      success: true,
      url,
      filename: response.headers['content-disposition']?.split('filename=')[1]?.split(';')[0]?.replace(/"/g, '') || 'resume.pdf'
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to download resume'
    };
  }
};

export default {
  sendFacultyApplicationOTP,
  verifyFacultyApplicationOTP,
  submitFacultyApplication,
  getFacultyApplications,
  getFacultyApplication,
  reviewFacultyApplication,
  downloadResume
};