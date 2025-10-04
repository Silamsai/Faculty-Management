import api from './api';

// User management service
const userService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update current user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      
      // Update user data in localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all users (Admin only)
  getAllUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const endpoint = params ? `/users/all?${params}` : '/users/all';
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user (Admin only)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user status (Admin only)
  updateUserStatus: async (userId, status) => {
    try {
      console.log('Sending request to update user status:', userId, status);
      const requestData = { status };
      console.log('Request data being sent:', requestData);
      const response = await api.put(`/users/${userId}/status`, requestData);
      console.log('Received response:', response);
      
      return response.data;
    } catch (error) {
      console.error('Update user status service error:', error);
      throw error;
    }
  },

  // Get pending faculty applications (Dean/Admin)
  getPendingFaculty: async () => {
    try {
      console.log('Fetching pending faculty applications');
      const response = await api.get('/users/faculty/pending');
      console.log('Pending faculty response:', response);
      return response.data;
    } catch (error) {
      console.error('Get pending faculty error:', error);
      throw error;
    }
  },

  // Delete user (Admin only)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user details including password info (Admin only)
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/details`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics (Admin only)
  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new user (Admin only)
  createUser: async (userData) => {
    try {
      const response = await api.post('/users/create', userData);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user (Admin only)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;