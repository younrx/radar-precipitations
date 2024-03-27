// SERVICE WORKER FILE

const VERSION = "1.1.0"; // Version number to update when a change is made to the app
const CACHE_NAME = `rainfall-${VERSION}`; // Cache name based on version to ensure a new cache will be created (and the old one will be deleted) on version update

// resources needed when offline:
const APP_STATIC_RESOURCES = [
    "/",
    "/index.html",
    "/styles/reset.css",
    "/styles/map_rain.css",
    "/scripts/map_rain.js",
    "/static/icons/icon512.svg",
    "/static/icons/icon512.png",
    "/static/icons/icon512_maskable.svg",
    "/static/icons/icon512_maskable.png",
    "/static/images/rain_levels.png",
];

// Create cache on  'install' event:
self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            cache.addAll(APP_STATIC_RESOURCES);
        })()
    );
});

// Delete previous installed cache
self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const names = await caches.keys();
            await Promise.all(
                names.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
            await clients.claim(); // enable our service worker to set itself as the controller for the current running instance of the PWA.
        })()
    );
});
