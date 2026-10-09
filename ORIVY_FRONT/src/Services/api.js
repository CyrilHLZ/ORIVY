const apiRequest = async (path, options = {}) => {
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

export const getActivities = () => apiRequest('/activites');
export const createActivity = (activity) => apiRequest('/activites', {
    method: 'POST',
    body: JSON.stringify(activity),
});
export const getMapData = () => apiRequest('/carte');
export const createPoint = (point) => apiRequest('/points-interet', { method: 'POST', body: JSON.stringify(point) });
export const updatePoint = (id, point) => apiRequest(`/points-interet/${id}`, { method: 'PUT', body: JSON.stringify(point) });
export const deletePoint = (id) => apiRequest(`/points-interet/${id}`, { method: 'DELETE' });
export const register = (user) => apiRequest('/utilisateurs/inscription', {
    method: 'POST',
    body: JSON.stringify(user),
});
export const login = (credentials) => apiRequest('/utilisateurs/connexion', {
    method: 'POST',
    body: JSON.stringify(credentials),
});