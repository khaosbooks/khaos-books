// modal.js - Phase 1.2: Modal Components

class ModalManager {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal(this.activeModal);
            }
        });

        // Prevent closing when clicking inside modal container
        document.querySelectorAll('.modal__container').forEach(container => {
            container.addEventListener('click', (e) => e.stopPropagation());
        });

        // Initialize galleries for any modals that exist on page load
        this.initAllGalleries();
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        // Close any open modal first
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.activeModal = modalId;
        
        // Initialize gallery for this modal
        this.initGallery(modalId);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        if (this.activeModal === modalId) {
            this.activeModal = null;
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
        this.activeModal = null;
    }

    // Gallery functions
    initAllGalleries() {
        document.querySelectorAll('.modal').forEach(modal => {
            this.initGallery(modal.id);
        });
    }

    initGallery(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        const mainImage = modal.querySelector('.modal__gallery-main');
        const thumbs = modal.querySelectorAll('.modal__thumb');

        if (!mainImage || thumbs.length === 0) return;

        // Remove any existing event listeners by cloning and replacing
        thumbs.forEach(thumb => {
            thumb.replaceWith(thumb.cloneNode(true));
        });

        // Re-query to get fresh elements
        const freshThumbs = modal.querySelectorAll('.modal__thumb');
        const freshMainImage = modal.querySelector('.modal__gallery-main');

        freshThumbs.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Update main image src to clicked thumb src
                if (thumb.src) {
                    freshMainImage.src = thumb.src;
                }
                
                // Update active state
                freshThumbs.forEach(t => t.classList.remove('modal__thumb--active'));
                thumb.classList.add('modal__thumb--active');
            });
        });

        // Optional: Click on main image to open full size in new tab
        if (freshMainImage) {
            freshMainImage.addEventListener('click', () => {
                window.open(freshMainImage.src, '_blank');
            });
        }
    }

    // Navigate to project modal from book card
    openProjectFromBook(projectId) {
        this.closeAllModals();
        this.openModal(projectId);
    }
}

// Initialize modal manager
const modalManager = new ModalManager();

// Global functions for HTML onclick attributes
function openModal(modalId) {
    modalManager.openModal(modalId);
}

function closeModal(modalId) {
    modalManager.closeModal(modalId);
}

// For book cards to open project modals
function openProjectModal(projectId) {
    modalManager.openProjectFromBook(projectId);
}