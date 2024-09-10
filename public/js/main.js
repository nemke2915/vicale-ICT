// about js
// Function to check if an element is in the viewport
function isInViewport(element) {
    if (!element) return false; // Ensure the element exists
    const rect = element.getBoundingClientRect();
    return rect.top <= (window.innerHeight || document.documentElement.clientHeight) && rect.bottom >= 0;
}

// Function to add the 'animate' class when in view
function checkScroll() {
    const aboutContent = document.querySelector('.about-content');
    const cards = document.querySelectorAll('.card');
    const teamSection = document.querySelector('.team-section');
    const teamMember = document.querySelector('.team-member');

    if (isInViewport(aboutContent)) {
        aboutContent.classList.add('animate');
    }

    cards.forEach((card) => {
        if (isInViewport(card)) {
            card.classList.add('animate');
        }
    });

    if (isInViewport(teamSection)) {
        teamSection.classList.add('animate');
    }

    if (isInViewport(teamMember)) {
        teamMember.classList.add('animate');
    }
}

// Run on scroll
window.addEventListener('scroll', checkScroll);

// Run once on page load in case elements are already in view
checkScroll();



// contact js

// Check if the contact form exists before trying to append the CSRF token and handle form submission
document.addEventListener("DOMContentLoaded", function () {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        // Fetch the CSRF token and append it to the form
        fetch('/csrf-token')
            .then(response => response.json())
            .then(data => {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_csrf';
                csrfInput.value = data.csrfToken;
                contactForm.appendChild(csrfInput);
            })
            .catch(error => {
                console.error('Error fetching CSRF token:', error);
            });

        // Handle form submission via AJAX
        contactForm.addEventListener("submit", function (e) {
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
                    showResponseModal(i18next.t('contact.emailSuccess'), true);
                    contactForm.reset(); // Clear the form
                } else {
                    showResponseModal(i18next.t('contact.emailFailure'), false);
                }
            })
            .catch(error => {
                showResponseModal(i18next.t('contact.emailError'), false);
            });
        });
    }
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




// language changing functionality
document.addEventListener("DOMContentLoaded", function () {
    const langItems = document.querySelectorAll('.dropdown-item');

    if (langItems.length) {
        langItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const selectedLang = e.target.getAttribute('data-lang');
                const currentUrl = window.location.href.split('?')[0]; // Get the base URL without any query string

                // Set the cookie to store the language selection
                document.cookie = `i18next=${selectedLang}; path=/`;

                // Redirect to the same URL but with the updated language in the query string
                window.location.href = `${currentUrl}?lng=${selectedLang}`;
            });
        });
    }
});

