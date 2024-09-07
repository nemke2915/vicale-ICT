// Handle form submission via AJAX
document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("email").value;
    
    // Regular expression for validating an email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(emailInput)) {
        showResponseModal('Invalid email format. Please enter a valid email.', false);
        return; // Stop form submission
    }

    // If the email is valid, continue with form submission
    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());

    fetch('/send-mail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formObject)
    })
        .then(response => {
            if (response.ok) {
                showResponseModal('Email sent successfully. We will respond as soon as we can.', true);
                document.getElementById("contactForm").reset(); // Clear the form
            } else {
                showResponseModal('Failed to send the email. Please try again later.', false);
            }
        })
        .catch(error => {
            showResponseModal('An error occurred. Please try again later.', false);
        });
});

function showResponseModal(message, success) {
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.textContent = message;

    const modal = new bootstrap.Modal(document.getElementById('responseModal'), {
        backdrop: 'static', // Prevent closing by clicking outside the modal
        keyboard: false     // Disable closing by pressing Esc
    });

    modal.show();

    // Auto close after 5 seconds if not manually closed
    setTimeout(() => {
        modal.hide();
    }, 5000);
}
