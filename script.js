// ==========================================================================
// INITIALISATION EMAILJS & LOGIQUE DU SITE
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {

    // 1. Initialisation d'EmailJS avec la clé publique
    emailjs.init({
        publicKey: "hT9KB3hjI2a4XS4U"
    });

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
    // 2. BEHAVIOR DU BOUTON NON (ESQUIVE & MESSAGES)
    // ==========================================================================

    const noMessages = [
        "Tu es sûre ? 🥺",
        "Le NON est un peu timide… 😈",
        "Essaie encore 😂",
        "Il semblerait que le OUI soit la bonne réponse ❤️"
    ];
    let noAttemptCount = 0;

    // Fonction pour déplacer le bouton NON de façon fluide et sécurisée
    function dodgeNoButton() {
        const card = page1.getBoundingClientRect();
        const btnRect = btnNo.getBoundingClientRect();

        // Calculer les limites à l'intérieur de la carte ou du viewport
        const padding = 20;
        
        // Obtenir des coordonnées relatives pour que le bouton reste visible dans la carte
        const minX = -card.width / 2 + btnRect.width;
        const maxX = card.width / 2 - btnRect.width;
        const minY = -card.height / 3;
        const maxY = card.height / 3;

        const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
        const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

        // Transformer le bouton NON
        btnNo.style.position = "relative";
        btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;

        // Afficher progressivement les messages ludiques
        const messageIndex = Math.min(noAttemptCount, noMessages.length - 1);
        noMsgBox.textContent = noMessages[messageIndex];
        noMsgBox.classList.remove("hidden");

        noAttemptCount++;
    }

    // Événements pour ordinateurs (souris) et téléphones (tactile)
    btnNo.addEventListener("mouseenter", dodgeNoButton);
    btnNo.addEventListener("touchstart", (e) => {
        e.preventDefault(); // Empêche le clic effectif sur mobile
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
    // 4. SOUMISSION DU FORMULAIRE ET EMAILJS
    // ==========================================================================

    dateForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Masquer l'erreur précédente si présente
        errorMessage.classList.add("hidden");

        const selectedDate = inputDate.value;
        const selectedTime = inputTime.value;
        const selectedMessage = inputMessage.value.trim();

        // Validation simple
        if (!selectedDate || !selectedTime) {
            return;
        }

        // Activer l'état de chargement sur le bouton
        btnSubmit.disabled = true;
        btnText.style.opacity = "0.5";
        btnLoader.classList.remove("hidden");

        // Préparation des variables strictes pour le template EmailJS
        const templateParams = {
            date: selectedDate,
            time: selectedTime,
            message: selectedMessage || "(Aucun message fourni)"
        };

        // Envoi via EmailJS SDK
        emailjs.send("service_1xzgh5v", "template_4bhs946", templateParams)
            .then((response) => {
                console.log("SUCCÈS EmailJS !", response.status, response.text);

                // Formater la date en français pour l'affichage final
                const dateObj = new Date(selectedDate + "T00:00:00");
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const dateFormatee = dateObj.toLocaleDateString('fr-FR', options);

                // Remplir la page de résumé
                summaryDate.textContent = dateFormatee.charAt(0).toUpperCase() + dateFormatee.slice(1);
                summaryTime.textContent = selectedTime;
                summaryMessage.textContent = selectedMessage ? `« ${selectedMessage} »` : "(Aucun message)";

                // Basculer vers la Page 3
                page2.classList.remove("active");
                page2.classList.add("hidden");

                page3.classList.remove("hidden");
                setTimeout(() => {
                    page3.classList.add("active");
                    createConfetti(); // Animation festive de félicitations
                }, 50);
            })
            .catch((error) => {
                console.error("ÉCHEC d'envoi EmailJS :", error);

                // Réinitialiser l'état du bouton
                btnSubmit.disabled = false;
                btnText.style.opacity = "1";
                btnLoader.classList.add("hidden");

                // Afficher le message d'erreur clair
                errorMessage.classList.remove("hidden");
            });
    });

    // ==========================================================================
    // 5. ANIMATIONS D'ARRIÈRE-PLAN (CŒURS ET CONFETTIS)
    // ==========================================================================

    const heartsContainer = document.getElementById("hearts-bg");

    function createHeart() {
        const heart = document.createElement("div");
        heart.classList.add("floating-heart");
        
        const heartIcons = ["❤️", "💖", "💕", "💗", "🌸"];
        heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
        
        heart.style.left = Math.random() * 100 + "vw";
        heart.style.animationDuration = Math.random() * 3 + 4 + "s"; // entre 4s et 7s
        heart.style.fontSize = Math.random() * 15 + 15 + "px"; // entre 15px et 30px
        
        heartsContainer.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 7000);
    }

    // Générer des cœurs régulièrement
    setInterval(createHeart, 500);

    // Animation de confettis pour la confirmation finale
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
