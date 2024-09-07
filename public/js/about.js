        // Function to check if an element is in the viewport
        function isInViewport(element) {
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