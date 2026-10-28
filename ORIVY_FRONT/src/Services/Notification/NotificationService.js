import { apiRequest } from '../api.js';

export const getNotifications = () => apiRequest('/notifications');
export const markNotificationAsRead = (notificationId) => apiRequest(`/notifications/${notificationId}/lire`, { method: 'POST' });
export const deleteNotification = (notificationId) => apiRequest(`/notifications/${notificationId}`, { method: 'DELETE' });
export const getNombreNonLues = () => apiRequest('/notifications/non-lues');
