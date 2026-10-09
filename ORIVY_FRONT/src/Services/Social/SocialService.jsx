const socialService = async (path, options = {}) => {
    const response = await fetch(`/api${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Erreur HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('application/json') ? response.json() : response.text();
};

const getFriends = () => socialService('/amis');

const addFriend = (friendId) => socialService(`/amis/${friendId}`, {
    method: 'POST',
});

const removeFriend = (friendId) => socialService(`/amis/${friendId}`, {
    method: 'DELETE',
});

const getFriendRequests = () => socialService('/demandes-amis');

const sendFriendRequest = (friendId) => socialService(`/demandes-amis/${friendId}`, {
    method: 'POST',
});

const acceptFriendRequest = (friendId) => socialService(`/demandes-amis/${friendId}/accepter`, {
    method: 'POST',
});

const declineFriendRequest = (friendId) => socialService(`/demandes-amis/${friendId}/refuser`, {
    method: 'POST',
});

const getMessages = (friendId) => socialService(`/messages/${friendId}`);

const sendMessage = (friendId, message) => socialService(`/messages/${friendId}`, {
    method: 'POST',
    body: JSON.stringify({ message }),
});

const deleteMessage = (friendId, messageId) => socialService(`/messages/${friendId}/${messageId}`, {
    method: 'DELETE',
});

const getNotifications = () => socialService('/notifications');

const markNotificationAsRead = (notificationId) => socialService(`/notifications/${notificationId}/lire`, {
    method: 'POST',
});

const deleteNotification = (notificationId) => socialService(`/notifications/${notificationId}`, {
    method: 'DELETE',
});

const getUserProfile = (userId) => socialService(`/utilisateurs/${userId}`);

const updateUserProfile = (userId, profileData) => socialService(`/utilisateurs/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
});

const deleteUserProfile = (userId) => socialService(`/utilisateurs/${userId}`, {
    method: 'DELETE',
});

const getUserFriends = (userId) => socialService(`/utilisateurs/${userId}/amis`);

const getUserFriendRequests = (userId) => socialService(`/utilisateurs/${userId}/demandes-amis`);

export {
    getFriends,
    addFriend,
    removeFriend,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    getMessages,
    sendMessage,
    deleteMessage,
    getNotifications,
    markNotificationAsRead,
    deleteNotification,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    getUserFriends,
    getUserFriendRequests,
};






