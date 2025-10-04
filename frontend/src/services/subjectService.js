import api from './api';

const subjectService = {
  // Get all subjects
  getAllSubjects: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/subjects${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subjects');
    }
  },

  // Get subjects by department
  getSubjectsByDepartment: async (department) => {
    try {
      const response = await api.get(`/subjects/departments/${department}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subjects by department');
    }
  },

  // Get subject by ID
  getSubjectById: async (id) => {
    try {
      const response = await api.get(`/subjects/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subject');
    }
  },

  // Create a new subject (Admin/Dean only)
  createSubject: async (subjectData) => {
    try {
      const response = await api.post('/subjects', subjectData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create subject');
    }
  },

  // Update subject (Admin/Dean only)
  updateSubject: async (id, subjectData) => {
    try {
      const response = await api.put(`/subjects/${id}`, subjectData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update subject');
    }
  },

  // Delete subject (Admin only)
  deleteSubject: async (id) => {
    try {
      const response = await api.delete(`/subjects/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete subject');
    }
  }
};

export default subjectService;