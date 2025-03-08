// Script specific to get/use current user location

import { removeElementsByClass } from "./utils.js";
import { closeDrawer } from "./drawer.js";
import { messageError } from "./message.js";


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

function startSpinAnimation() {
    let locateButtonImage = document.querySelector('a#locate img');
    locateButtonImage.classList.add("spin");
    locateButtonImage.src = "static/images/spin.svg"
}

function stopSpinAnimation() {
    let locateButtonImage = document.querySelector('a#locate img');
    locateButtonImage.classList.remove("spin");
    locateButtonImage.src = "static/images/aim.svg"
}

export function activateLocation(map) {
    // Center view on user location:
    let isLocationInProgress = false;
    document.querySelector('a#locate').addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        if ("geolocation" in navigator) {
            /* geolocation is available */
            startSpinAnimation();
            if (!isLocationInProgress) {  // prevent multiple calls if user clicks multiple times
                isLocationInProgress = true;
                navigator.geolocation.getCurrentPosition(
                    // success callback:
                    (position) => {
                        displayCurrentLocation(map, position.coords.latitude, position.coords.longitude, position.coords.accuracy);
                        stopSpinAnimation();
                        closeDrawer();
                        isLocationInProgress = false;
                    },
                    // failure callback:
                    (err) => {
                        console.warn(`ERROR(${err.code}): ${err.message}`);
                        messageError(`Erreur de géolocalisation : ${err.message}`);
                        stopSpinAnimation();
                        closeDrawer();
                        isLocationInProgress = false;
                    },
                    // options:
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0,  // never use cached position
                    }
                );
            }
        } else {
            /* geolocation IS NOT available */
            messageError("Pas de géolocalisation disponible");
        }
    });
};
