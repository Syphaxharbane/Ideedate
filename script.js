// ==========================================================================
// CONFIGURATION DÉTAILLÉE EMAILJS & DÉTECTION DES ERREURS DIRECTE
// ==========================================================================

const CONFIG = {
    PUBLIC_KEY: "hT9KB3hjI2a4XS4U",
    SERVICE_ID: "service_1xzgh5v",
    TEMPLATE_ID: "template_4bhs946"
};

document.addEventListener("DOMContentLoaded", () => {

    // Initialisation d'EmailJS avec vérification sécurisée
    try {
        if (typeof emailjs !== 'undefined') {
            emailjs.init({
                publicKey: CONFIG.PUBLIC_KEY
            });
            console.log("EmailJS initialisé avec succès.");
        } else {
            console.error("SDK EmailJS non disponible sur cette page.");
        }
    } catch (e) {
        console.error("Erreur d'initialisation EmailJS:", e);
    }

    // Éléments du DOM
    const page1 = document.getElementById("page1");
    const page2 = document.getElementById("page2");
    const page3 = document.getElementById("page3");

    const btnYes = document.getElementById("btn-yes");
    const btnNo = document.getElementById("btn-no");
    const noMsgBox = document.getElementById("no-message-box");

    const dateForm = document.getElementById("date-form");
    const inputDate = document.getElementById("input-date");
    const inputTime = document.getElementById("input-time");
    const inputMessage = document.getElementById("input-message");
    const charCount = document.getElementById("char-count");
    const btnSubmit = document.getElementById("btn-submit");
    const btnText = btnSubmit.querySelector(".btn-text");
    const btnLoader = btnSubmit.querySelector(".btn-loader");
    
    const errorMessage = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");
    const errorDetails = document.getElementById("error-details");

    const summaryDate = document.getElementById("summary-date");
    const summaryTime = document.getElementById("summary-time");
    const summaryMessage = document.getElementById("summary-message");

    // Configurer la date minimale à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    inputDate.setAttribute('min', today);

    // Compteur de caractères pour le message
    inputMessage.addEventListener("input", () => {
        charCount.textContent = inputMessage.value.length;
    });

    // ==========================================================================
    // 2. BOUTON NON (ESQUIVE & MESSAGES)
    // ==========================================================================

    const noMessages = [
        "Tu es sûre ? 🥺",
        "Le NON est un peu timide… 😈",
        "Essaie encore 😂",
        "Il semblerait que le OUI soit la bonne réponse ❤️"
    ];
    let noAttemptCount = 0;

    function dodgeNoButton() {
        const card = page1.getBoundingClientRect();
        const btnRect = btnNo.getBoundingClientRect();

        const minX = -card.width / 2 + btnRect.width;
        const maxX = card.width / 2 - btnRect.width;
        const minY = -card.height / 3;
        const maxY = card.height / 3;

        const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
        const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

        btnNo.style.position = "relative";
        btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;

        const messageIndex = Math.min(noAttemptCount, noMessages.length - 1);
        noMsgBox.textContent = noMessages[messageIndex];
        noMsgBox.classList.remove("hidden");

        noAttemptCount++;
    }

    btnNo.addEventListener("mouseenter", dodgeNoButton);
    btnNo.addEventListener("touchstart", (e) => {
        e.preventDefault();
        dodgeNoButton();
    });
    btnNo.addEventListener("click", (e) => {
        e.preventDefault();
        dodgeNoButton();
    });

    // ==========================================================================
    // 3. CLIC SUR LE BOUTON OUI
    // ==========================================================================

    btnYes.addEventListener("click", () => {
        page1.classList.remove("active");
        page1.classList.add("hidden");

        page2.classList.remove("hidden");
        setTimeout(() => {
            page2.classList.add("active");
        }, 50);
    });

    // ==========================================================================
    // 4. SOUMISSION DU FORMULAIRE ET CATCH ÉTENDU DES ERREURS
    // ==========================================================================

    dateForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Réinitialiser la zone d'erreur
        errorMessage.classList.add("hidden");
        errorDetails.innerHTML = "";

        const selectedDate = inputDate.value;
        const selectedTime = inputTime.value;
        const selectedMessage = inputMessage.value.trim();

        if (!selectedDate || !selectedTime) {
            return;
        }

        // État de chargement
        btnSubmit.disabled = true;
        btnText.style.opacity = "0.5";
        btnLoader.classList.remove("hidden");

        // Paramètres stricts pour le template EmailJS
        const templateParams = {
            date: selectedDate,
            time: selectedTime,
            message: selectedMessage || "(Aucun message)"
        };

        // Envoi avec fallback de clé intégrée dans la requête
        emailjs.send(
            CONFIG.SERVICE_ID,
            CONFIG.TEMPLATE_ID,
            templateParams,
            { publicKey: CONFIG.PUBLIC_KEY }
        )
        .then((response) => {
            console.log("SUCCÈS EmailJS !", response.status, response.text);

            // Formater la date en français pour la vue
            const dateObj = new Date(selectedDate + "T00:00:00");
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateFormatee = dateObj.toLocaleDateString('fr-FR', options);

            summaryDate.textContent = dateFormatee.charAt(0).toUpperCase() + dateFormatee.slice(1);
            summaryTime.textContent = selectedTime;
            summaryMessage.textContent = selectedMessage ? `« ${selectedMessage} »` : "(Aucun message)";

            // Afficher la page 3
            page2.classList.remove("active");
            page2.classList.add("hidden");

            page3.classList.remove("hidden");
            setTimeout(() => {
                page3.classList.add("active");
                createConfetti();
            }, 50);
        })
        .catch((error) => {
            console.error("ÉCHEC DETECTÉ EmailJS :", error);

            // Réinitialiser le bouton
            btnSubmit.disabled = false;
            btnText.style.opacity = "1";
            btnLoader.classList.add("hidden");

            // Extraction détaillée du problème
            let detailedInfo = "";
            let userAdvice = "L’envoi a échoué 😭 Vérifie ta connexion et réessaie.";

            if (typeof error === 'object' && error !== null) {
                const status = error.status || (error.response ? error.response.status : null);
                const text = error.text || error.message || JSON.stringify(error);

                if (status === 400 || text.includes("Invalid")) {
                    userAdvice = "Erreur 400 : Les identifiants Service ID ou Public Key sont rejetés par EmailJS.";
                } else if (status === 412 || text.includes("Precondition Failed")) {
                    userAdvice = "Erreur 412 : Votre compte Gmail relié à EmailJS s'est déconnecté. Reconnectez-le sur EmailJS.com.";
                } else if (location.protocol === 'file:') {
                    userAdvice = "Attention : Ouvrir le fichier en local (file://) bloque les requêtes EmailJS sur mobile/navigateur.";
                }

                detailedInfo = `Code: ${status || 'N/A'} | Détails: ${text}`;
            } else {
                detailedInfo = String(error);
            }

            // Affichage direct à l'écran du motif précis de l'erreur
            errorText.textContent = userAdvice;
            errorDetails.innerHTML = `<strong>Diagnostic technique :</strong><br>${detailedInfo}`;
            errorMessage.classList.remove("hidden");
        });
    });

    // ==========================================================================
    // 5. ANIMATIONS (CŒURS & CONFETTIS)
    // ==========================================================================

    const heartsContainer = document.getElementById("hearts-bg");

    function createHeart() {
        const heart = document.createElement("div");
        heart.classList.add("floating-heart");
        
        const heartIcons = ["❤️", "💖", "💕", "💗", "🌸"];
        heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
        
        heart.style.left = Math.random() * 100 + "vw";
        heart.style.animationDuration = Math.random() * 3 + 4 + "s";
        heart.style.fontSize = Math.random() * 15 + 15 + "px";
        
        heartsContainer.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 7000);
    }

    setInterval(createHeart, 500);

    function createConfetti() {
        const colors = ['#ff6584', '#ff4769', '#ffccd5', '#ffffff', '#ffd166'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = Math.random() * 8 + 6 + 'px';
            confetti.style.height = Math.random() * 8 + 6 + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.zIndex = '99';
            confetti.style.pointerEvents = 'none';

            const duration = Math.random() * 2 + 2;
            confetti.style.transition = `transform ${duration}s ease-out, opacity ${duration}s ease-out`;

            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.style.transform = `translate(${Math.random() * 200 - 100}px, ${window.innerHeight + 20}px) rotate(${Math.random() * 360}deg)`;
                confetti.style.opacity = '0';
            }, 50);

            setTimeout(() => {
                confetti.remove();
            }, duration * 1000);
        }
    }
});
