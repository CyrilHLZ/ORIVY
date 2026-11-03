/*
 * Service worker d'ORIVY : garde une copie des fichiers du site pour qu'il s'ouvre vite,
 * et même sans réseau (la dernière version vue). L'API (/api/…) n'est JAMAIS mise en cache :
 * les sorties, messages et profils viennent toujours du serveur.
 */
const CACHE = 'orivy-v1';

// Installation : on garde tout de suite la page d'accueil (le « squelette » de l'app React)
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.add('/')));
    self.skipWaiting();   // la nouvelle version prend la main sans attendre
});

// Activation : on supprime les anciens caches (orivy-v0…) quand on change de version
self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((noms) =>
        Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n)))));
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const requete = event.request;
    const url = new URL(requete.url);
    // On ne touche qu'aux lectures (GET) de NOTRE site, et jamais à l'API
    if (requete.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

    // Une page (/, /carte, /sorties/12…) : le réseau d'abord ; hors ligne, le squelette gardé en cache
    if (requete.mode === 'navigate') {
        event.respondWith(fetch(requete).catch(() => caches.match('/')));
        return;
    }
    // Les fichiers (JS, CSS, images, polices) : le cache d'abord (rapide), et on met à jour en arrière-plan
    event.respondWith(caches.open(CACHE).then(async (cache) => {
        const enCache = await cache.match(requete);
        const reseau = fetch(requete).then((reponse) => {
            if (reponse.ok) cache.put(requete, reponse.clone());
            return reponse;
        }).catch(() => enCache);
        return enCache || reseau;
    }));
});
