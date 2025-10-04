import api from './api';

// Simple notification function
const showNotification = (message, type = 'info') => {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add styles
  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '4px',
    color: 'white',
    fontWeight: '500',
    zIndex: '10000',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
    backgroundColor: type === 'success' ? '#10b981' : 
                   type === 'error' ? '#ef4444' : 
                   type === 'warning' ? '#f59e0b' : '#3b82f6'
  });
  
  // Add to document
  document.body.appendChild(notification);
  
  // Show animation
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
};

const scheduleChangeService = {
  // Get all schedule changes (for deans)
  getAllScheduleChanges: async () => {
    try {
      const response = await api.get('/schedule-changes/all');
      return response;
    } catch (error) {
      showNotification('Failed to fetch schedule changes: ' + error.message, 'error');
      throw new Error(error.message || 'Failed to fetch schedule changes');
    }
  },

  // Get schedule changes for current faculty
  getMyScheduleChanges: async () => {
    try {
      const response = await api.get('/schedule-changes/my-changes');
      return response;
    } catch (error) {
      showNotification('Failed to fetch your schedule changes: ' + error.message, 'error');
      throw new Error(error.message || 'Failed to fetch my schedule changes');
    }
  },

  // Submit a schedule change request
  submitScheduleChange: async (scheduleChangeData) => {
    try {
      const response = await api.post('/schedule-changes/request', scheduleChangeData);
      showNotification('Schedule change request submitted successfully!', 'success');
      return response;
    } catch (error) {
      showNotification('Failed to submit schedule change request: ' + error.message, 'error');
      throw new Error(error.message || 'Failed to submit schedule change request');
    }
  },

  // Review a schedule change request (for deans)
  reviewScheduleChange: async (id, reviewData) => {
    try {
      const response = await api.put(`/schedule-changes/${id}/review`, reviewData);
      const status = reviewData.status;
      showNotification(
        `Schedule change request ${status} successfully!`, 
        status === 'approved' ? 'success' : 'warning'
      );
      return response;
    } catch (error) {
      showNotification('Failed to review schedule change request: ' + error.message, 'error');
      throw new Error(error.message || 'Failed to review schedule change request');
    }
  }
};

export default scheduleChangeService;