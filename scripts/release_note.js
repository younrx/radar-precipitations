// Release note management


// Actions to perform when the document is loaded:
document.addEventListener("DOMContentLoaded", () => {
    const showReleaseNote = localStorage.getItem("showReleaseNote") != null ? localStorage.getItem("showReleaseNote") : 'true';
    if (showReleaseNote === 'true') {
        let releaseNote = document.getElementById('release-note');
        releaseNote.classList.remove('hidden');
        releaseNote.innerHTML = `
            <div>
                <div class="header">
                    <p class="title">Nouveauté !</p>
                </div>
                <div class="content">
                    <p>Il est maintenant possible d'ajouter un marqueur sur la carte en effectuant un double-clic.</p>
                    <a id="close" class="button">Fermer</a>
                </div>
            </div>
        `;
        // Manage close operation:
        const closeButton = document.querySelector('#release-note #close');
        closeButton.addEventListener('click', function(ev) {
            ev.preventDefault();
            ev.stopPropagation();
            releaseNote.remove();
            localStorage.setItem("showReleaseNote", 'false');
        });
        // Block cusrsor creation through clicks on the pop-up:
        ['click', 'dblclick'].forEach(function(eventName){
            releaseNote.addEventListener(eventName, function(ev) {
                ev.stopPropagation();
            });
        });
    }
});
