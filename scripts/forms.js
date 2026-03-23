// ===== FORM FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {
    initCharacterArtForm();
    initProjectFeedbackForm();
});

// ===== CHARACTER ART FORM =====
function initCharacterArtForm() {
    const form = document.getElementById('characterArt');
    if (!form) return;
    
    // Dynamic character fields
    const characterCountInput = document.getElementById('characterCount');
    const characterFieldsContainer = document.getElementById('characterFieldsContainer');
    
    if (characterCountInput && characterFieldsContainer) {
        function updateCharacterFields() {
            let count = parseInt(characterCountInput.value) || 1;
            if (count < 1) count = 1;
            if (count > 10) count = 10;
            
            characterFieldsContainer.innerHTML = '';
            
            for (let i = 1; i <= count; i++) {
                const characterDiv = document.createElement('div');
                characterDiv.className = 'contact-fields';
                characterDiv.style.marginBottom = 'var(--md)';
                
                characterDiv.innerHTML = `
                    <div class="form-group">
                        <label for="charName${i}">Character ${i} - Name</label>
                        <input type="text" id="charName${i}" name="character_${i}_name" class="form-input" placeholder="Character name">
                    </div>
                    <div class="form-group">
                        <label for="charDesc${i}">Character ${i} - Descriptors</label>
                        <input type="text" id="charDesc${i}" name="character_${i}_descriptors" class="form-input" placeholder="3-5 words: brooding, royal, proud, etc.">
                    </div>
                `;
                
                characterFieldsContainer.appendChild(characterDiv);
            }
        }
        
        characterCountInput.addEventListener('change', updateCharacterFields);
        updateCharacterFields();
    }
    
    // Pose conditional fields
    const poseRadios = document.querySelectorAll('input[name="poseType"]');
    const actionPoseField = document.getElementById('actionPoseField');
    const standingPoseField = document.getElementById('standingPoseField');
    
    if (poseRadios.length) {
        function updatePoseFields() {
            const selectedPose = document.querySelector('input[name="poseType"]:checked');
            
            if (actionPoseField) {
                actionPoseField.style.display = 'none';
                actionPoseField.classList.remove('active');
            }
            if (standingPoseField) {
                standingPoseField.style.display = 'none';
                standingPoseField.classList.remove('active');
            }
            
            if (selectedPose) {
                if (selectedPose.value === 'action' && actionPoseField) {
                    actionPoseField.style.display = 'block';
                    actionPoseField.classList.add('active');
                } else if (selectedPose.value === 'standing' && standingPoseField) {
                    standingPoseField.style.display = 'block';
                    standingPoseField.classList.add('active');
                }
            }
        }
        
        poseRadios.forEach(radio => {
            radio.addEventListener('change', updatePoseFields);
        });
        updatePoseFields();
    }
    
    // Add-on toggle - Simple working version
    const addonRadios = document.querySelectorAll('#addonSelector input[type="radio"]');
    const addonHidden = document.getElementById('addonValue');
    
    if (addonRadios.length && addonHidden) {
        function updateAddonSelection() {
            let selectedValue = 'none';
            
            addonRadios.forEach(radio => {
                if (radio.checked) {
                    selectedValue = radio.value;
                }
            });
            
            addonHidden.value = selectedValue;
        }
        
        addonRadios.forEach(radio => {
            radio.addEventListener('click', function() {
                if (this.checked) {
                    // Check if it was already checked (will be true before click)
                    // We need to know previous state
                    const wasChecked = this.hasAttribute('data-checked');
                    
                    if (wasChecked) {
                        // Uncheck it
                        this.checked = false;
                        this.removeAttribute('data-checked');
                    } else {
                        // Check it and mark it
                        this.checked = true;
                        this.setAttribute('data-checked', 'true');
                    }
                    
                    // Clear data-checked from other radios
                    addonRadios.forEach(otherRadio => {
                        if (otherRadio !== this) {
                            otherRadio.removeAttribute('data-checked');
                        }
                    });
                    
                    updateAddonSelection();
                }
            });
            
            // Track initial state
            if (radio.checked) {
                radio.setAttribute('data-checked', 'true');
            }
        });
        
        updateAddonSelection();
    }
    
    // Form validation
    form.addEventListener('submit', function(e) {
        const termsCheckbox = document.getElementById('termsAgreement');
        if (!termsCheckbox || !termsCheckbox.checked) {
            e.preventDefault();
            alert('Please agree to the terms regarding revisions and additional costs before submitting.');
            if (termsCheckbox) termsCheckbox.focus();
            return;
        }
        
        const emailField = document.getElementById('clientEmail');
        if (!emailField || !emailField.value.trim()) {
            e.preventDefault();
            alert('Please provide your email address so we can respond to your inquiry.');
            if (emailField) emailField.focus();
            return;
        }
        
        const packageSelected = document.querySelector('input[name="package"]:checked');
        if (!packageSelected) {
            e.preventDefault();
            alert('Please select a package before submitting.');
            return;
        }
    });
}

// ===== PROJECT FEEDBACK FORM =====
function initProjectFeedbackForm() {
    const form = document.getElementById('projectFeedbackForm');
    if (!form) return;
    
    const starRatingValue = document.querySelector('.star-rating-value');
    if (starRatingValue) {
        const starLabels = document.querySelectorAll('.star-rating label');
        starLabels.forEach(label => {
            label.addEventListener('mouseenter', function() {
                const title = this.getAttribute('title');
                starRatingValue.textContent = title;
                starRatingValue.classList.add('active');
            });
            
            label.addEventListener('mouseleave', function() {
                const selectedStar = document.querySelector('.star-rating input:checked');
                if (selectedStar) {
                    const selectedLabel = document.querySelector(`label[for="${selectedStar.id}"]`);
                    starRatingValue.textContent = selectedLabel.getAttribute('title');
                } else {
                    starRatingValue.textContent = 'Hover over stars to see ratings';
                    starRatingValue.classList.remove('active');
                }
            });
        });
        
        const starInputs = document.querySelectorAll('.star-rating input');
        starInputs.forEach(input => {
            input.addEventListener('change', function() {
                const selectedLabel = document.querySelector(`label[for="${this.id}"]`);
                starRatingValue.textContent = selectedLabel.getAttribute('title');
                starRatingValue.classList.add('active');
            });
        });
    }
}