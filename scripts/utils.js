// util functions

export function removeElementsByClass(className){
    const elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

export function blockMarkerCreation(element){
    // Block cusrsor creation through clicks on the given element:
    ['click', 'dblclick', 'mousedown', 'touchstart'].forEach(function(eventName){
        element.addEventListener(eventName, function(ev) {
            ev.stopPropagation();
        });
    });
}
