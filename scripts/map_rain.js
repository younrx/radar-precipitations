///// Map setup /////

import { Marker, loadMarkers } from "./markers.js";

// Display map according to view settings:
function setMapView(map) {
    // Define view parameters to apply:
    let viewCoordinatesDefault = { lat: 46.85, lng: 1.37 }; // default view coordinates
    let viewDefaultZoom = 6; // default view zoom
    if (window.screen.width <= 640) {
        viewDefaultZoom = 5;
    } // smaller zoom on small screens
    // Read cache:
    const viewCoordinatesLat = localStorage.getItem("viewCoordinatesLat") != null ? localStorage.getItem("viewCoordinatesLat") : viewCoordinatesDefault.lat;
    const viewCoordinatesLng = localStorage.getItem("viewCoordinatesLng") != null ? localStorage.getItem("viewCoordinatesLng") : viewCoordinatesDefault.lng;
    const viewZoom = localStorage.getItem("viewZoom") != null ? localStorage.getItem("viewZoom") : viewDefaultZoom;
    // apply view parameters:
    map.setView({ lat: viewCoordinatesLat, lng: viewCoordinatesLng });
    map.setZoom(viewZoom);

    // Store view parameters in local cache so that the view shown after loading page is based on user preferences:
    map.addEventListener("moveend", function (ev) {
        // triggered on map move/zoom
        const viewCoordinates = map.getCenter();
        const viewZoom = map.getZoom();
        localStorage.setItem("viewCoordinatesLat", viewCoordinates.lat);
        localStorage.setItem("viewCoordinatesLng", viewCoordinates.lng);
        localStorage.setItem("viewZoom", viewZoom);
    });

    // Creating a Layer object for the map tiles:
    new L.TileLayer( "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" ).addTo(map);
}


// Add the rain layer to the map + the map legend:
function displayRain(map, rainGifImageSource) {
    // ***** Map rain animation - Start ***** //
    // Add an overlay of the rain gif image as reference:
    let latLngBounds = L.latLngBounds([ [40.92, -7.94], [52.18, 10.52], ]);
    let rainImageOverlayRef = L.imageOverlay(rainGifImageSource, latLngBounds, { opacity: 0.7, });
    rainImageOverlayRef.addTo(map);
    rainImageOverlayRef.getElement().id = "rain-gif-ref";
    // Create a custom overlay, which is an image in a div with the same styles than the reference overlay:
    // generate the div:
    let rainImageOverlayWrapper = document.createElement("div");
    rainImageOverlayWrapper.id = "rain-gif-wrapper";
    // generate the image:
    let rainImageOverlay = document.createElement("img");
    rainImageOverlay.id = "rain-gif";
    rainImageOverlay.src = rainGifImageSource;
    // insert elements in DOM (right next to the reference overlay):
    document.querySelector("div.leaflet-pane:has(> #rain-gif-ref)").appendChild(rainImageOverlayWrapper);
    document.querySelector("#rain-gif-wrapper").appendChild(rainImageOverlay);
    // update styles:
    document.querySelector("#rain-gif-wrapper").style.transform = document.querySelector("#rain-gif-ref").style.transform;
    document.querySelector("#rain-gif-wrapper").style.width = document.querySelector("#rain-gif-ref").style.width;
    document.querySelector("#rain-gif-wrapper").style.zIndex = document.querySelector("#rain-gif-ref").style.zIndex;
    document.querySelector("#rain-gif-wrapper").style.opacity = document.querySelector("#rain-gif-ref").style.opacity;
    // update class:
    document.querySelector("#rain-gif-wrapper").className = document.querySelector("#rain-gif-ref").className;
    // ***** Map rain animation - End ***** //

    // ***** Map legend - Start ***** //
    // Leaftlet control for main div:
    L.Control.LegendWrapper = L.Control.extend({
        onAdd: function (map) {
            let div = L.DomUtil.create("div");
            div.id = "map-legend";
            return div;
        },
    });
    // Leaftlet control for rain scale:
    L.Control.RainLegend = L.Control.extend({
        onAdd: function (map) {
            let img = L.DomUtil.create("img");
            img.id = "rain-legend";
            img.src = "./static/images/rain_levels.png";
            return img;
        },
    });
    // add elements into map:
    const legendDiv = new L.Control.LegendWrapper({ position: "bottomleft" });
    const rainLegend = new L.Control.RainLegend();
    legendDiv.addTo(map);
    rainLegend.addTo(map);
    // place sub-elements into map-legend:
    let timeLegend = document.createElement("div");
    timeLegend.id = "time-legend";
    let timeLegendImg = document.createElement("img");
    timeLegendImg.src = rainGifImageSource;
    let timeLegendBoder = document.createElement("div"); // border to hide rain blue pixels when resizing is not exactly perfect (on small screens)
    timeLegendBoder.id = "time-legend-border";
    document.getElementById("map-legend").appendChild(timeLegend);
    document.getElementById("time-legend").appendChild(timeLegendBoder);
    document.getElementById("time-legend").appendChild(timeLegendImg);
    document.getElementById("map-legend").appendChild(document.getElementById("rain-legend"));
    // ***** Map legend - End ***** //

    // Dynamically update styles of my custom overlay, when styles of the reference overlay are changed:
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutationRecord) {
            // set wrapper style identical to rain-gif-ref styles:
            document.querySelector("#rain-gif-wrapper").style.transform = document.querySelector("#rain-gif-ref").style.transform;
            document.querySelector("#rain-gif-wrapper").style.width = document.querySelector("#rain-gif-ref").style.width;
        });
    });
    observer.observe(document.getElementById("rain-gif-ref"), {
        attributes: true,
        attributeFilter: ["style"],
    }); // link the observer to the reference overlay
}

function addRefreshButton(map) {
    L.Control.LegendWrapper = L.Control.extend({
        onAdd: function (map) {
            let divBut = L.DomUtil.create("div");
            divBut.id = "div-refresh-button";
            divBut.className += "refresh-button-hidden";
            return divBut;
        },
    });
    const divBut = new L.Control.LegendWrapper({ position: "topleft" });
    divBut.addTo(map);
    const refreshBut = document.querySelector("#refresh-button");
    document.getElementById("div-refresh-button").appendChild(refreshBut);

    // Make button appear on map move:
    map.addEventListener("movestart", function (ev) {
        // triggered on map move/zoom
        document.getElementById("div-refresh-button").className = "leaflet-control refresh-button-visible";
    });
    // Make button disappear after map move:
    map.addEventListener("moveend", function (ev) {
        // triggered on map move/zoom
        setTimeout(() => {
            document.getElementById("div-refresh-button").className = "leaflet-control refresh-button-hidden";
        }, 2000);
    });
    // Perform action on button click:
    document.getElementById("div-refresh-button").addEventListener("click", function (ev) {
        // triggered on map move/zoom
        window.location.reload(true); // force refresh
        ev.stopPropagation();
    });
}

/*** Marker functions ***/
// function _prepareText(text) {
//     return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(' ', '+')
// }
// function displayMarker(map, coordinates) {
//     // show marker on map:
//     const markerIcon = L.icon({
//         iconUrl: `static/images/pin.svg`,
//         shadowUrl: `static/images/marker-shadow.png`,
//         iconSize: [21.5, 38.25], // size of the icon
//         shadowSize: [40, 40],
//         iconAnchor: [10.75, 38.25], // point of the icon which will correspond to marker's location
//       });
//     L.marker(coordinates, {icon: markerIcon}).addTo(map).on('click', function(ev) {
//         displayMarkerDetails(ev.latlng);
//         // ev.originalEvent.preventDefault();
//         // ev.originalEvent.stopPropagation();  // -> has no effect
//     });
// }
// function displayMarkerDetails(coordinates) {
//     let markers = localStorage.getItem("markers") != null ? JSON.parse(localStorage.getItem("markers")) : [];
//     for(let i=0; i<markers.length; i++) {
//         if(markers[i].lat === coordinates.lat && markers[i].lng === coordinates.lng) {
//             const marker = markers[i];
//             // Generate address and query texts:
//             let addressText = "Adresse inconnue";
//             let queryAddressText = "";
//             if (marker.address || (marker.postcode && marker.city)) {
//                 addressText = "";
//                 if (marker.address) {
//                     addressText += `${marker.address}`;
//                 }
//                 if (marker.postcode && marker.city) {
//                     addressText += `${marker.address ? ", " : ""}${marker.postcode}, ${marker.city}`;
//                     queryAddressText = `${_prepareText(marker.city)}+${marker.postcode}`;
//                 }
//             }
//             // Insert legend div in DOM:
//             const legendDiv = document.getElementById("map-legend");
//             const markerLegendDivId = "marker-legend-div";
//             let markerLegendDiv = document.getElementById(markerLegendDivId);
//             if (!markerLegendDiv) {  // i.e. legend div does not exist yet
//                 markerLegendDiv = document.createElement("div");
//                 markerLegendDiv.id = markerLegendDivId;
//                 legendDiv.appendChild(markerLegendDiv);
//             }
//             markerLegendDiv.innerHTML = `
//                 <p>${addressText}</p>
//                 <a
//                     ${queryAddressText ? `href="https://www.meteociel.fr/prevville.php?action=getville&ville=${queryAddressText}&envoyer=OK"` : ""}
//                     target = "_blank"
//                     rel=”nofollow”
//                 >Météociel <img class="external-link-icon" alt="" src="static/images/external_link.svg"/></a>
//             `;
//         }
//     }
// }
// function addMarker(map, coordinates) {
//     displayMarker(map, coordinates);
//     // store marker in cache:
//     const marker = {'lat': coordinates.lat, 'lng': coordinates.lng};
//     let markers = localStorage.getItem("markers") != null ? JSON.parse(localStorage.getItem("markers")) : [];
//     markers.push(marker);
//     localStorage.setItem("markers", JSON.stringify(markers));
//     // reverse location from coordinates:
//     getLocation(coordinates.lat, coordinates.lng).then(
//         // success callback:
//         (locationData) => {
//             if(locationData) {
//                 updateMarker(coordinates.lat, coordinates.lng, locationData);
//                 displayMarkerDetails(coordinates);
//             }
//         },
//         // failure callback:
//         () => {
//             console.error(`Failed to reverse location of point ${coordinates.lat}, ${coordinates.lng}`);
//         });
// }
// function updateMarker(lat, lng, data) {
//     let markers = localStorage.getItem("markers") != null ? JSON.parse(localStorage.getItem("markers")) : [];
//     for(let i=0; i<markers.length; i++) {
//         if(markers[i].lat === lat && markers[i].lng === lng) {
//             Object.assign(markers[i], data);  // merge marker and data dicts
//         }
//     }
//     localStorage.setItem("markers", JSON.stringify(markers));
// }
// function deleteMarker() {
//     // TODO
// }
// function loadMarkers(map) {
//     const markers = localStorage.getItem("markers") != null ? JSON.parse(localStorage.getItem("markers")) : [];
//     for(const marker of markers) {
//         displayMarker(map, [marker.lat, marker.lng]);
//     }
// }
// async function getLocation(lat, lng) {
//     const response = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lat=${lat}&lon=${lng}&limit=1`);
//     const rawData = await response.json(); // extract JSON from the http response
//     if(rawData.features?.length) {
//         return {
//             'city': rawData.features[0].properties.city,
//             'postcode': rawData.features[0].properties.postcode,
//             'address': rawData.features[0].properties.name,
//         }
//     }
//     return null;
// }


// Actions to perform when the document is loaded:
document.addEventListener("DOMContentLoaded", () => {

    // Creating a map object:
    let map = new L.map("map", {
        zoomControl: false,
        zoomSnap: 0.1,
        attributionControl: false,
        doubleClickZoom: false,
    });

    // update view:
    setMapView(map);
    loadMarkers(map);

    // display rain:
    const rainGifImageSource = "https://www.meteo60.fr/radars/animation-radars-france.gif";
    displayRain(map, rainGifImageSource);
    addRefreshButton(map);

    // Refresh page to update rain data every time the user opens the tab page:
    document.addEventListener("visibilitychange", function() {
        if (!document.hidden){ // i.e. if the page displayed is the current app
            window.location.reload(true); // force refresh
        }
    });

    // Create markers on double click:
    map.addEventListener('dblclick', function(ev) {
        ev.originalEvent.preventDefault();
        ev.originalEvent.stopPropagation();
        const marker = new Marker(map, ev.latlng.lat, ev.latlng.lng);
        marker.saveInLocalStorage();
        marker.displayOnMap();
    });
    
    // Close maker details pop-up on click:
    map.addEventListener('click', function(ev) {
        const markerLegendDiv = document.getElementById('marker-legend-div');
        if (markerLegendDiv) {
            markerLegendDiv.remove();
        }
    });
});
