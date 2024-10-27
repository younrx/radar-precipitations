// Markers specific code


const MARKER_ICON = L.icon({
    iconUrl: `static/images/pin.svg`,
    shadowUrl: `static/images/marker-shadow.png`,
    iconSize: [21.5, 38.25], // size of the icon
    shadowSize: [40, 40],
    iconAnchor: [10.75, 38.25], // point of the icon which will correspond to marker's location
});

class LocalStorageMarkers {
    static localStorageKey = "markers";

    static getAllMarkersData() {
        return localStorage.getItem(LocalStorageMarkers.localStorageKey) != null ? JSON.parse(localStorage.getItem(LocalStorageMarkers.localStorageKey)) : [];
    }

    static add(marker) {
        let markers = localStorage.getItem(LocalStorageMarkers.localStorageKey) != null ? JSON.parse(localStorage.getItem(LocalStorageMarkers.localStorageKey)) : [];
        markers.push(marker.asDict());
        localStorage.setItem(LocalStorageMarkers.localStorageKey, JSON.stringify(markers));
    }

    static remove(marker) {
        let markers = localStorage.getItem(LocalStorageMarkers.localStorageKey) != null ? JSON.parse(localStorage.getItem(LocalStorageMarkers.localStorageKey)) : [];
        const index = array.indexOf(marker.asDict());
        if (index > -1) { // only splice array when item is found
            markers.splice(index, 1); // 2nd parameter means remove one item only
        }
        localStorage.setItem(LocalStorageMarkers.localStorageKey, JSON.stringify(markers));
    }
}

function _prepareText(text) {
    return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(' ', '+')
}

export class Marker {
    constructor(map, lat, lng) {
        this.lat = lat;
        this.lng = lng;
        this.map = map;
        this.id = `${this.lat};${this.lng}`;
        this.leafletMarker = L.marker([lat, lng], {icon: MARKER_ICON});
        this.location = '';
        // reverse location from coordinates:
        this.getLocation(lat, lng).then(
            (locationData) => {  // success callback
                if(locationData) {
                    this.updateLocation(locationData);
                }
            },
            () => {  // failure callback
                console.error(`Failed to reverse location of point ${coordinates.lat}, ${coordinates.lng}`);
            });
    }

    /* Returns a dict with specific object properties */
    asDict() {
        const excludedProperties = ["id", "leafletMarker", "map"];
        let data = {};
        for (const propertyName of Object.getOwnPropertyNames(this)) {
            if (!excludedProperties.includes(propertyName)) {
                data[propertyName] = this[propertyName];
            }
        }
        return data;
    }

    saveInLocalStorage() {
        LocalStorageMarkers.add(this);
    }

    deleteFromLocalStorage() {
        LocalStorageMarkers.remove(this);
    }

    async getLocation(lat, lng) {
        const response = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lat=${lat}&lon=${lng}&limit=1`);
        const rawData = await response.json(); // extract JSON from the http response
        if(rawData.features?.length) {
            return {
                'city': rawData.features[0].properties.city,
                'postcode': rawData.features[0].properties.postcode,
                'address': rawData.features[0].properties.name,
            }
        }
        return null;
    }

    updateLocation(data) {
        this.location = data;
    }

    displayOnMap() {
        this.leafletMarker.addTo(this.map).on('click', () => {
            this.showDetails();
        });
    }

    showDetails() {
        console.log(this);

        // Generate address and query texts:
        let addressText = "Adresse inconnue";
        let queryAddressText = "";
        if (this.location.address || (this.location.postcode && this.location.city)) {
            addressText = "";
            if (this.location.address) {
                addressText += `${this.location.address}`;
            }
            if (this.location.postcode && this.location.city) {
                addressText += `${this.location.address ? ", " : ""}${this.location.postcode}, ${this.location.city}`;
                queryAddressText = `${_prepareText(this.location.city)}+${this.location.postcode}`;
            }
        }
        // Insert legend div in DOM:
        const legendDiv = document.getElementById("map-legend");
        const markerLegendDivId = "marker-legend-div";
        let markerLegendDiv = document.getElementById(markerLegendDivId);
        if (!markerLegendDiv) {  // i.e. legend div does not exist yet
            markerLegendDiv = document.createElement("div");
            markerLegendDiv.id = markerLegendDivId;
            legendDiv.prepend(markerLegendDiv);
        }
        markerLegendDiv.innerHTML = `
            <p>${addressText}</p>
            <a
                ${queryAddressText ? `href="https://www.meteociel.fr/prevville.php?action=getville&ville=${queryAddressText}&envoyer=OK"` : ""}
                target = "_blank"
                rel=”nofollow”
            >Météociel <img class="external-link-icon" alt="" src="static/images/external_link.svg"/></a>
        `;
        // Block cusrsor creation through clicks on the details pop-up:
        ['click', 'dblclick'].forEach(function(eventName){
            markerLegendDiv.addEventListener(eventName, function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
            });
        });
    }
}

export function loadMarkers(map) {
    const markersData = LocalStorageMarkers.getAllMarkersData();
    for (const markerData of markersData) {
        const marker = new Marker(map, markerData.lat, markerData.lng);
        marker.displayOnMap();
    }
}
