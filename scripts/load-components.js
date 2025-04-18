//LOAD FAVICON
injectFavicons();

//LOAD BOTH HEADER AND FOOTER
Promise.all([
    fetch('includes/header.html').then(res => res.text()),
    fetch('includes/footer.html').then(res => res.text())
])
.then(([headerHtml, footerHtml]) => {
    document.body.insertAdjacentHTML('afterbegin', headerHtml);
    document.body.insertAdjacentHTML('beforeend', footerHtml);
    
    initializeHeader();
    initializeFooter();
    
    document.body.classList.add('components-loaded');
})
.catch(error => console.error('Error loading components:', error));

// ===== FAV ICON LOCATIONS =====
function injectFavicons() {
    const faviconHtml = `
        <link rel="icon" href="images/logos/favicon.ico" type="image/x-icon">
        <link rel="icon" type="image/svg+xml" href="images/logos/favicon.svg">
        <link rel="icon" type="image/png" href="images/logos/favicon-32x32.png" sizes="32x32">
        <link rel="icon" type="image/png" href="images/logos/favicon-16x16.png" sizes="16x16">
        <link rel="apple-touch-icon" sizes="180x180" href="images/logos/apple-touch-icon.png">
        <link rel="manifest" href="images/logos/site.webmanifest">
        <meta name="theme-color" content="#BE002C">
    `;
    document.head.insertAdjacentHTML('beforeend', faviconHtml);
}

// ===== HEADER INITIALIZATION ===== 
// ===== HEADER INITIALIZATION ===== 
function initializeHeader() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    // Add dropdown arrows if missing
    document.querySelectorAll('.nav-item:has(.dropdown)').forEach(item => {
        const link = item.querySelector('.nav-link');
        if (!link.querySelector('.dropdown-arrow')) {
            link.innerHTML += '<span class="dropdown-arrow">▾</span>';
            link.classList.add('with-arrow');
        }
    });

    // NUCLEAR OPTION: Force hide all dropdowns on mobile load
    function hideAllDropdowns() {
        if (window.innerWidth <= 900) {
            document.querySelectorAll('.dropdown').forEach(dd => {
                dd.classList.remove('active');
            });
        }
    }

    // Initialize immediately
    hideAllDropdowns();
    
    // Re-initialize on resize
    window.addEventListener('resize', hideAllDropdowns);

    // Mobile menu toggle
    hamburger?.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        if (!navMenu.classList.contains('active')) {
            hideAllDropdowns();
        }
    });

    // Mobile dropdown behavior - SIMPLIFIED VERSION
    document.querySelectorAll('.mobile-menu-group > .with-arrow').forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth > 900) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = this.closest('.mobile-menu-group').querySelector('.dropdown');
            const isOpen = dropdown.classList.contains('active');
            
            // Close all others
            document.querySelectorAll('.dropdown').forEach(dd => {
                if (dd !== dropdown) dd.classList.remove('active');
            });
            
            // Toggle current
            dropdown.classList.toggle('active', !isOpen);
            
            console.log('Dropdown toggled:', dropdown, 'New state:', !isOpen);
        });
    });

    // Close menu when clicking dropdown links
    document.querySelectorAll('.dropdown-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                hamburger?.classList.remove('active');
                navMenu?.classList.remove('active');
                closeAllDropdowns();
            }
        });
    });

    // Sticky header
    const header = document.querySelector('.header');
    function updateHeader() {
        header?.classList.toggle('scrolled', window.scrollY > 50);
    }
    window.addEventListener('scroll', updateHeader);
    updateHeader();

    // Highlight current page
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.pathname === window.location.pathname) {
            link.classList.add('active');
            const parentItem = link.closest('.nav-item');
            if (parentItem && parentItem.querySelector('.dropdown')) {
                parentItem.querySelector('.dropdown').classList.add('active');
            }
        }
    });

    // Helper function
    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dd => dd.classList.remove('active'));
        document.querySelectorAll('.dropdown-arrow').forEach(arrow => arrow.classList.remove('active'));
    }
}

// ===== FOOTER INITIALIZATION =====
function initializeFooter() {
    const yearElement = document.querySelector('.footer-bottom .year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    document.querySelectorAll('.footer-nav a').forEach(link => {
        if (link.pathname === window.location.pathname) {
            link.classList.add('active');
        }
    });
    
    document.querySelector('.footer-logo')?.addEventListener('click', (e) => {
        if (e.currentTarget.href === window.location.href) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}