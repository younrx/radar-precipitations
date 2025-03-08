// Specific script for drawer management

export function messageError(text) {
    let messageDiv = document.querySelector("div#message");
    messageDiv.classList.add("error");
    displayMessage(text);
    setTimeout(hideMessage, 4000);
}

function displayMessage(text) {
    let messageDiv = document.querySelector("div#message");
    messageDiv.innerHTML = text;
    messageDiv.classList.remove("hidden");
}

function hideMessage() {
    let messageDiv = document.querySelector("div#message");
    messageDiv.classList.add("hidden");
}
