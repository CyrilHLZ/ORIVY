const activiteService = async (path, options = {}) => {
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

export const getActivities = () => activiteService('/activites');

export const createActivity = (activity) => activiteService('/activites', {
    method: 'POST',
    body: JSON.stringify(activity),
});


