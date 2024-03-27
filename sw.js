// SERVICE WORKER FILE

const VERSION = "1.2.0"; // Version number to update when a change is made to the app
const CACHE_NAME = `rainfall-${VERSION}`; // Cache name based on version to ensure a new cache will be created (and the old one will be deleted) on version update
const OFFLINE_URL = "/radar-precipitations/pages/offline_fallback.html";

// resources needed when offline:
const APP_STATIC_RESOURCES = [
    "/radar-precipitations/",
    OFFLINE_URL,
    // "/radar-precipitations/index.html",
    "/radar-precipitations/styles/reset.css",
    "/radar-precipitations/styles/app.css",
    // "/radar-precipitations/styles/map_rain.css",
    // "/radar-precipitations/scripts/map_rain.js",
    "/radar-precipitations/static/icons/icon512.svg",
    "/radar-precipitations/static/icons/icon512.png",
    "/radar-precipitations/static/icons/icon512_maskable.svg",
    "/radar-precipitations/static/icons/icon512_maskable.png",
    // "/radar-precipitations/static/images/rain_levels.png",
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

// Monitor requests to detect a network connection-loss
self.addEventListener("fetch", (event) => {
    // Only call event.respondWith() if this is a navigation request for an HTML page:
    if (event.request.mode === "navigate") {

        console.log("Caught a fetch request: ", event.request);
        
        event.respondWith(
            (async () => {
                try {
                    // First, try to use the navigation preload response if it's supported.
                    const preloadResponse = await event.preloadResponse;
                    if (preloadResponse) {
                        return preloadResponse;
                    }

                    // Always try the network first.
                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch (error) {
                    // catch is only triggered if an exception is thrown, which is likely due to a network error.
                    // If fetch() returns a valid HTTP response with a response code in the 4xx or 5xx range, the catch() will NOT be called.
                    console.error("Fetch failed; returning offline page instead.", error);

                    const cache = await caches.open(CACHE_NAME);
                    const cachedResponse = await cache.match(OFFLINE_URL);
                    return cachedResponse;
                }
            })()
        );
    }
});
