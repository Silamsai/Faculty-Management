import api from './api';

// Leave management service
const leaveService = {
  // Submit leave application
  applyLeave: async (leaveData) => {
    try {
      const response = await api.post('/leaves/apply', leaveData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user's leave applications
  getMyApplications: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const endpoint = params ? `/leaves/my-applications?${params}` : '/leaves/my-applications';
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all leave applications (Dean/Admin)
  getAllApplications: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const endpoint = params ? `/leaves/all?${params}` : '/leaves/all';
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get pending leave applications (Dean/Admin)
  getPendingApplications: async () => {
    try {
      const response = await api.get('/leaves/pending');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Review leave application (Dean/Admin)
  reviewApplication: async (applicationId, status, reviewNotes = '') => {
    try {
      const response = await api.put(`/leaves/${applicationId}/review`, { status, reviewNotes });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get specific leave application
  getApplication: async (applicationId) => {
    try {
      const response = await api.get(`/leaves/${applicationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete leave application (Faculty only, pending only)
  deleteApplication: async (applicationId) => {
    try {
      const response = await api.delete(`/leaves/${applicationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get leave statistics (Dean/Admin)
  getLeaveStats: async () => {
    try {
      const response = await api.get('/leaves/stats/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default leaveService;