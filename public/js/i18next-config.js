document.addEventListener("DOMContentLoaded", function() {
    i18next.init({
        lng: window.currentLang || 'en', // You can pass the current language here
        resources: {
            en: {
                translation: {
                    "contact": {
                        "emailSuccess": "Email sent successfully. We will respond as soon as we can.",
                        "emailFailure": "Failed to send the email. Please try again later.",
                        "emailError": "An error occurred. Please try again later."
                    }
                }
            },
            sr: {
                translation: {
                    "contact": {
                        "emailSuccess": "Email je uspešno poslat. Odgovorićemo što pre možemo.",
                        "emailFailure": "Nije uspelo slanje emaila. Molimo pokušajte kasnije.",
                        "emailError": "Došlo je do greške. Molimo pokušajte kasnije."
                    }
                }
            }
        }
    });
});
