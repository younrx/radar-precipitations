// SERVICE WORKER FILE

const VERSION = "1.1.2"; // Version number to update when a change is made to the app
const CACHE_NAME = `rainfall-${VERSION}`; // Cache name based on version to ensure a new cache will be created (and the old one will be deleted) on version update

// resources needed when offline:
const APP_STATIC_RESOURCES = [
    "/radar-precipitations/",
    "/radar-precipitations/index.html",
    "/radar-precipitations/styles/reset.css",
    "/radar-precipitations/styles/map_rain.css",
    "/radar-precipitations/scripts/map_rain.js",
    "/radar-precipitations/static/icons/icon512.svg",
    "/radar-precipitations/static/icons/icon512.png",
    "/radar-precipitations/static/icons/icon512_maskable.svg",
    "/radar-precipitations/static/icons/icon512_maskable.png",
    "/radar-precipitations/static/images/rain_levels.png",
];

// Create cache on  'install' event:
self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            cache.addAll(APP_STATIC_RESOURCES)
                .catch((error) => {
                    console.error(error);
                });
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
