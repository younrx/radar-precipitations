///// Map setup /////

import { Marker, loadMarkers } from "./markers.js";
import { activateLocation } from "./location.js";
import { VERSION } from "../sw.js";

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
    map.setView({ lat: viewCoordinatesLat, lng: viewCoordinatesLng }, viewZoom);

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
    let mapLegendMainGroup = document.createElement("div");
    mapLegendMainGroup.id = "map-legend-main-group";
    let mapLegendDataGroup = document.createElement("div");
    mapLegendDataGroup.id = "map-legend-data-group";
    let timeLegend = document.createElement("div");
    timeLegend.id = "time-legend";
    let timeLegendImg = document.createElement("img");
    timeLegendImg.src = rainGifImageSource;
    let timeLegendBoder = document.createElement("div"); // border to hide rain blue pixels when resizing is not exactly perfect (on small screens)
    timeLegendBoder.id = "time-legend-border";

    // App version for debug:
    let versionLegend = document.createElement("div");
    versionLegend.innerHTML = `<p class="version-number">v${VERSION}</p>`;
    
    document.getElementById("map-legend").appendChild(mapLegendMainGroup);
    document.getElementById("map-legend").appendChild(versionLegend);
    document.getElementById("map-legend-main-group").appendChild(mapLegendDataGroup);

    document.getElementById("map-legend-data-group").appendChild(timeLegend);
    document.getElementById("time-legend").appendChild(timeLegendBoder);
    document.getElementById("time-legend").appendChild(timeLegendImg);
    document.getElementById("map-legend-data-group").appendChild(document.getElementById("rain-legend"));

    let locateButton = document.createElement("a");
    locateButton.id = "locate";
    locateButton.classList.add("button-dark");
    locateButton.innerHTML = `<img class="icon-dark" alt="" src="static/images/aim.svg"/>`;
    document.getElementById("map-legend-main-group").appendChild(locateButton);

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
    refreshBut.classList.add("button-dark");
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

function insertReleaseNote(map) {
    L.Control.ReleaseNote = L.Control.extend({
        onAdd: function (map) {
            let div = L.DomUtil.create("div");
            div.id = "release-note";
            div.className += "hidden";
            return div;
        },
    });
    const popUp = new L.Control.ReleaseNote({ position: 'topleft' });
    popUp.addTo(map);
}

function generateMarker(map, lat, lng) {
    const marker = new Marker(map, lat, lng);
    marker.displayOnMap();
    marker.saveInLocalStorage();
    marker.showDetails();
}

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

    // Insert release note Control:
    insertReleaseNote(map);

    // Activate user location features:
    activateLocation(map);

    // ***** Markers management - Start ***** //

    map.addEventListener('dblclick', function(ev) {
        ev.originalEvent.preventDefault();
        ev.originalEvent.stopPropagation();
        generateMarker(map, ev.latlng.lat, ev.latlng.lng);
    });
    
    // Close maker details pop-up on click:
    map.addEventListener('mousedown', function(ev) {
        const markerLegendDiv = document.getElementById('marker-legend-div');
        if (markerLegendDiv) {
            markerLegendDiv.remove();
        }
    });

    // Manage marker creation on long-press on touch devices:
    let pressTimer = null;
    map.addEventListener('touchstart', function(ev) {
        let mouseHasMoved = false;

        function detectMoves() {
            mouseHasMoved = true;
            // see https://github.com/Leaflet/Leaflet/pull/8435/files for 'expect(latlng).to.be.nearLatLng([..., ...])' instead
        }

        map.addEventListener('touchmove', detectMoves);

        pressTimer = window.setTimeout(function() {
            if (!mouseHasMoved) {
                ev.originalEvent.preventDefault();
                ev.originalEvent.stopPropagation();
                map.removeEventListener('touchmove', detectMoves);
                generateMarker(map, ev.latlng.lat, ev.latlng.lng);
            }
        }, 500);
    })
    map.addEventListener('touchend', function(ev) {
        clearTimeout(pressTimer);
    })

    // ***** Markers management - End ***** //
});
