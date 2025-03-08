// Script specific to get/use current user location

import { removeElementsByClass } from "./utils.js";
import { closeDrawer } from "./drawer.js";


const POSITION_ICON = L.icon({
    iconUrl: `static/images/pin_dot.svg`,
    iconSize: [13, 13], // size of the icon
    iconAnchor: [6.5, 6.5], // point of the icon which will correspond to marker's location
});

function displayCurrentLocation(map, lat, lng, accuracy) {
    map.setView({ lat: lat, lng: lng });
    const positionMarkerClass = 'current-position-marker';
    removeElementsByClass(positionMarkerClass);
    const position_maker = L.marker(
        [lat, lng],
        {
            icon: POSITION_ICON,
            interactive: false,
        }
    ).addTo(map);
    position_maker._icon.classList.add(positionMarkerClass);
    L.circle(
        [lat, lng],
        {
            radius: accuracy,
            className: positionMarkerClass,
            interactive: false,
            stroke: false,
            fillColor: '#3388ff',
            fillOpacity: 0.2,
        }
    ).addTo(map);
}

export function activateLocation(map) {
    // Center view on user location:
    document.querySelector('a#locate').addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if ("geolocation" in navigator) {
            /* geolocation is available */
            navigator.geolocation.getCurrentPosition(
                // success callback:
                (position) => {
                    displayCurrentLocation(map, position.coords.latitude, position.coords.longitude, position.coords.accuracy);
                    closeDrawer();
                },
                // failure callback:
                (err) => {
                    console.warn(`ERROR(${err.code}): ${err.message}`);
                    closeDrawer();
                },
                // options:
                {
                    // enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,  // never use cached position
                }
            );
        } else {
            /* geolocation IS NOT available */
        }
    });
};
