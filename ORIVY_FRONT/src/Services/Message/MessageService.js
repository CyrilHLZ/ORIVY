import { apiRequest } from '../api.js';

// Conversation privée entre l'utilisateur connecté et `userId`
export const getMessages = (userId) => apiRequest(`/messages/${userId}`);
export const sendMessage = (userId, message) => apiRequest(`/messages/${userId}`, { method: 'POST', body: { message } });
export const deleteMessage = (userId, messageId) => apiRequest(`/messages/${userId}/${messageId}`, { method: 'DELETE' });
// Mes conversations : [{ membre, dernierMessage, date, nonLus }]
export const getConversations = () => apiRequest('/messages');