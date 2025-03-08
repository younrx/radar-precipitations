// Specific script for drawer management

export function activateDrawerListener(map) {
    document.querySelector('a#drawer-button').addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        let drawerDiv = document.querySelector("div#drawer");
        if (drawerDiv.classList.contains("hidden")) {
            openDrawer();
        } else {
            closeDrawer();
        }
    });
};

function openDrawer() {
    let drawerDiv = document.querySelector("div#drawer");
    let drawerButtonImage = document.querySelector("a#drawer-button img");
    drawerDiv.classList.remove("hidden");
    drawerButtonImage.src = "static/images/arrow_down.svg";
}

export function closeDrawer() {
    let drawerDiv = document.querySelector("div#drawer");
    let drawerButtonImage = document.querySelector("a#drawer-button img");
    drawerDiv.classList.add("hidden");
    drawerButtonImage.src = "static/images/arrow_up.svg";
}
