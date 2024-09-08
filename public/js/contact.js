// Fetch the CSRF token when the page loads and insert it into the form
document.addEventListener("DOMContentLoaded", function () {
    fetch('/csrf-token')
        .then(response => response.json())
        .then(data => {
            // Inject the CSRF token into the hidden input field
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_csrf';
            csrfInput.value = data.csrfToken;
            document.getElementById('contactForm').appendChild(csrfInput);
        })
        .catch(error => {
            console.error('Error fetching CSRF token:', error);
        });
});

// Handle form submission via AJAX
document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Collect form data
    const formData = new FormData(this);

    // Prepare form data as JSON
    const formObject = Object.fromEntries(formData.entries());

    // Send the form data via Fetch API
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

// Function to display the response message in a modal
function showResponseModal(message, success) {
    const modalMessage = document.getElementById('modalMessage');

    // Ensure the modal content is updated before showing the modal
    modalMessage.textContent = message;

    const modal = new bootstrap.Modal(document.getElementById('responseModal'), {
        backdrop: 'static', // Prevent closing by clicking outside the modal
        keyboard: false     // Disable closing by pressing Esc
    });

    // Show the modal after updating the message
    modal.show();

    // Auto close the modal after 5 seconds if not manually closed
    setTimeout(() => {
        modal.hide();
    }, 5000);
}
