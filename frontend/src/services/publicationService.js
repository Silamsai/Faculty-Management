import api from './api';

// Publication management service
const publicationService = {
  // Get user's publications
  getMyPublications: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const endpoint = params ? `/publications?${params}` : '/publications';
      
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new publication
  createPublication: async (publicationData) => {
    try {
      const response = await api.post('/publications', publicationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get publication by ID
  getPublication: async (publicationId) => {
    try {
      const response = await api.get(`/publications/${publicationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update publication
  updatePublication: async (publicationId, publicationData) => {
    try {
      const response = await api.put(`/publications/${publicationId}`, publicationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete publication
  deletePublication: async (publicationId) => {
    try {
      const response = await api.delete(`/publications/${publicationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Export publications as CSV
  exportPublications: async () => {
    try {
      const response = await api.get('/publications/export/csv', {
        responseType: 'blob'
      });

      // Get the blob and create download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'publications.csv';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { message: 'Publications exported successfully' };
    } catch (error) {
      throw error;
    }
  },

  // Get publication statistics
  getPublicationStats: async () => {
    try {
      const response = await api.get('/publications/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify publication (Admin/Dean only)
  verifyPublication: async (publicationId, isVerified, reviewNotes = '') => {
    try {
      const response = await api.put(`/publications/${publicationId}/verify`, { isVerified, reviewNotes });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default publicationService;