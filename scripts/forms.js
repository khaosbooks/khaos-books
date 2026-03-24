// ===== FORM FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {
    initCharacterArtForm();
    initProjectFeedbackForm();
});

// ===== CHARACTER ART FORM (UPDATED) =====
function initCharacterArtForm() {
    const form = document.getElementById('characterArt');
    if (!form) return;
    
    const charCountInput = document.getElementById('characterCount');
    const container = document.getElementById('characterFieldsContainer');
    const togetherSeparateGroup = document.getElementById('togetherSeparateGroup');
    const globalSection = document.getElementById('globalPoseBackgroundSection');
    const globalAddonSelector = document.getElementById('globalAddonSelector');
    const globalBackgroundDetails = document.getElementById('globalBackgroundDetails');
    const globalBgColorField = document.getElementById('globalBgColorField');
    const globalAddonValue = document.getElementById('globalAddonValue');
    
    let currentCharacters = [];
    
    // Helper: Update price estimate
    function updateTotalPrice() {
        const packageRadio = document.querySelector('input[name="package"]:checked');
        if (!packageRadio) return;
        
        const basePrice = parseInt(packageRadio.getAttribute('data-price')) || 0;
        const charCount = parseInt(charCountInput.value) || 1;
        
        // First character full price, additional at 50%
        let characterTotal = basePrice;
        for (let i = 2; i <= charCount; i++) {
            characterTotal += Math.round(basePrice * 0.5);
        }
        
        let backgroundTotal = 0;
        const layoutRadio = document.querySelector('input[name="layoutType"]:checked');
        const isTogether = (charCount === 1) || (layoutRadio && layoutRadio.value === 'together');
        
        if (isTogether && charCount > 1) {
            // Global background
            const globalBgRadio = globalAddonSelector ? globalAddonSelector.querySelector('input[type="radio"]:checked') : null;
            if (globalBgRadio && globalBgRadio.value !== 'none') {
                const bgPriceMap = { 'pattern-bg': 100, 'digital-bg': 300, '3d-bg': 400 };
                backgroundTotal = bgPriceMap[globalBgRadio.value] || 0;
            }
        } else {
            // Individual backgrounds - track which characters actually incur charges
            const processedChars = new Set();
            for (let i = 1; i <= charCount; i++) {
                const bgRadio = document.querySelector(`input[name="charBg_${i}"]:checked`);
                if (bgRadio && bgRadio.value !== 'none') {
                    const sameAsSelect = document.getElementById(`sameBgAsPrev_${i}`);
                    const isSameAsOther = sameAsSelect && sameAsSelect.value && sameAsSelect.value !== '';
                    
                    if (!isSameAsOther && !processedChars.has(i)) {
                        const bgPriceMap = { 'pattern-bg': 100, 'digital-bg': 300, '3d-bg': 400 };
                        backgroundTotal += bgPriceMap[bgRadio.value] || 0;
                        processedChars.add(i);
                    }
                }
            }
        }
        
        // Source files fee
        const sourceRadio = document.querySelector('input[name="sourceFiles"]:checked');
        const sourceFee = sourceRadio ? parseInt(sourceRadio.getAttribute('data-source-fee') || 0) : 0;
        
        const total = characterTotal + backgroundTotal + sourceFee;
        
        const breakdownDiv = document.getElementById('priceBreakdown');
        if (breakdownDiv) {
            breakdownDiv.innerHTML = `
                <p><strong>Characters:</strong> ${charCount} × base (€${basePrice} + ${charCount-1} × 50%) = €${characterTotal}</p>
                <p><strong>Background(s):</strong> +€${backgroundTotal}</p>
                <p><strong>Source files:</strong> +€${sourceFee}</p>
                <hr>
            `;
        }
        const totalDisplay = document.getElementById('totalEstimateDisplay');
        if (totalDisplay) totalDisplay.innerHTML = `Total Estimate: €${total}`;
    }
    
    // Update background details visibility for global section
    function updateGlobalBgVisibility() {
        if (!globalAddonSelector) return;
        const selected = globalAddonSelector.querySelector('input[type="radio"]:checked');
        
        if (globalBackgroundDetails) {
            globalBackgroundDetails.style.display = (selected && selected.value !== 'none') ? 'block' : 'none';
        }
        if (globalBgColorField) {
            globalBgColorField.style.display = (selected && selected.value === 'none') ? 'block' : 'none';
        }
        if (globalAddonValue) {
            globalAddonValue.value = selected ? selected.value : 'none';
        }
        updateTotalPrice();
    }
    
    // Update layout visibility (together vs separate)
    function updateLayoutVisibility() {
        const charCount = parseInt(charCountInput.value) || 1;
        const layoutRadio = document.querySelector('input[name="layoutType"]:checked');
        const isTogether = (charCount === 1) || (layoutRadio && layoutRadio.value === 'together');
        
        if (charCount > 1) {
            togetherSeparateGroup.style.display = 'block';
            if (isTogether) {
                globalSection.style.display = 'block';
                // Hide individual background sections
                currentCharacters.forEach(char => {
                    const bgGroup = char.body.querySelector('[id^="charBgGroup_"]');
                    if (bgGroup) bgGroup.style.display = 'none';
                });
            } else {
                globalSection.style.display = 'none';
                currentCharacters.forEach(char => {
                    const bgGroup = char.body.querySelector('[id^="charBgGroup_"]');
                    if (bgGroup) bgGroup.style.display = 'block';
                });
            }
        } else {
            togetherSeparateGroup.style.display = 'none';
            globalSection.style.display = 'none';
            if (currentCharacters[0]) {
                const bgGroup = currentCharacters[0].body.querySelector('[id^="charBgGroup_"]');
                if (bgGroup) bgGroup.style.display = 'block';
            }
        }
        updateTotalPrice();
    }
    
    // Build dropdown options for "same as" based on previous characters
    function buildSameAsDropdown(charId, currentCount) {
        let options = '<option value="">Select a character...</option>';
        for (let i = 1; i < charId; i++) {
            const charNameInput = document.getElementById(`charName_${i}`);
            const charName = charNameInput ? charNameInput.value.trim() || `Character ${i}` : `Character ${i}`;
            options += `<option value="${i}">${charName} (Character ${i})</option>`;
        }
        return options;
    }
    
    // Update same-as dropdowns when character names change
    function updateAllSameAsDropdowns() {
        const charCount = parseInt(charCountInput.value) || 1;
        for (let i = 2; i <= charCount; i++) {
            const dropdown = document.getElementById(`sameAsDropdown_${i}`);
            if (dropdown) {
                const currentValue = dropdown.value;
                dropdown.innerHTML = buildSameAsDropdown(i, charCount);
                if (currentValue && dropdown.querySelector(`option[value="${currentValue}"]`)) {
                    dropdown.value = currentValue;
                }
            }
        }
    }
    
    // Update individual background visibility for a character
    function updateCharBgVisibility(charId) {
        const bgSelector = document.querySelector(`.char-bg-selector[data-char="${charId}"]`);
        const bgDetails = document.getElementById(`charBgDetails_${charId}`);
        const bgColorField = document.getElementById(`charBgColorField_${charId}`);
        const sameAsGroup = document.getElementById(`sameAsGroup_${charId}`);
        
        if (!bgSelector) return;
        const selected = bgSelector.querySelector('input[type="radio"]:checked');
        const isNoneSelected = selected && selected.value === 'none';
        const isBackgroundSelected = selected && selected.value !== 'none';
        
        if (bgDetails) {
            bgDetails.style.display = isBackgroundSelected ? 'block' : 'none';
        }
        if (bgColorField) {
            bgColorField.style.display = isNoneSelected ? 'block' : 'none';
        }
        if (sameAsGroup && charId > 1) {
            sameAsGroup.style.display = 'block';
        }
    }
    
    // Build dynamic character cards
    function rebuildCharacterCards() {
        let count = parseInt(charCountInput.value) || 1;
        if (count < 1) count = 1;
        if (count > 10) count = 10;
        charCountInput.value = count;
        
        container.innerHTML = '';
        currentCharacters = [];
        
        for (let i = 1; i <= count; i++) {
            const charId = i;
            const cardDiv = document.createElement('div');
            cardDiv.className = 'form-section';
            cardDiv.style.marginBottom = 'var(--md)';
            cardDiv.style.padding = '0';
            cardDiv.style.overflow = 'hidden';
            
            // Header (collapsible)
            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.padding = 'var(--md) var(--lg)';
            header.style.backgroundColor = 'var(--primary-bg)';
            header.style.cursor = 'pointer';
            header.style.borderBottom = 'var(--border-thin)';
            
            const title = document.createElement('h4');
            title.textContent = `Character ${i}`;
            title.style.margin = '0';
            title.style.fontFamily = 'var(--font-heading)';
            const toggleSpan = document.createElement('span');
            toggleSpan.textContent = '▼';
            toggleSpan.style.fontSize = 'var(--md)';
            
            header.appendChild(title);
            header.appendChild(toggleSpan);
            
            const body = document.createElement('div');
            body.style.padding = 'var(--lg)';
            body.style.display = 'none';
            body.style.borderTop = 'var(--border-thin)';
            
            // Character name + descriptors
            body.innerHTML = `
                <div class="contact-fields">
                    <div class="form-group">
                        <label for="charName_${charId}">Character name</label>
                        <input type="text" id="charName_${charId}" name="character_${charId}_name" class="form-input char-name-input" data-char="${charId}" placeholder="Character name">
                    </div>
                    <div class="form-group">
                        <label for="charDesc_${charId}">Descriptors (3-5 words)</label>
                        <input type="text" id="charDesc_${charId}" name="character_${charId}_descriptors" class="form-input" placeholder="brooding, royal, proud, etc.">
                    </div>
                </div>
                <div class="form-group">
                    <label>Pose preference for this character</label>
                    <div class="service-selector pose-selector" data-char="${charId}">
                        <label class="service-option">
                            <input type="radio" name="poseType_${charId}" value="action">
                            <span class="service-name">Action / Dynamic</span>
                        </label>
                        <label class="service-option">
                            <input type="radio" name="poseType_${charId}" value="sitting">
                            <span class="service-name">Sitting / Leaning</span>
                        </label>
                        <label class="service-option">
                            <input type="radio" name="poseType_${charId}" value="standing">
                            <span class="service-name">Standing / T-Pose</span>
                        </label>
                    </div>
                </div>
                <div class="form-group conditional-pose" data-char="${charId}" data-pose="action" style="display:none;">
                    <label for="actionPose_${charId}">Action pose details</label>
                    <input type="text" id="actionPose_${charId}" name="character_${charId}_actionPose" class="form-input" placeholder="Describe the dynamic pose">
                </div>
                <div class="form-group conditional-pose" data-char="${charId}" data-pose="sitting" style="display:none;">
                    <label for="sittingPose_${charId}">Sitting pose details</label>
                    <input type="text" id="sittingPose_${charId}" name="character_${charId}_sittingPose" class="form-input" placeholder="Describe the sitting pose or what they are sitting/leaning against">
                </div>
                <div class="form-group conditional-pose" data-char="${charId}" data-pose="standing" style="display:none;">
                    <div class="checkbox-item">
                        <input type="checkbox" id="refSheet_${charId}" name="character_${charId}_referenceSheet" value="yes">
                        <label for="refSheet_${charId}">Is this for a reference sheet?</label>
                    </div>
                    <span class="form-note">Reference sheets require front/back/side views</span>
                </div>
                <div class="form-group">
                    <label>Zoom level / Crop</label>
                    <div class="service-selector">
                        <label class="service-option"><input type="radio" name="zoom_${charId}" value="bust-up"><span class="service-name">Bust up</span></label>
                        <label class="service-option"><input type="radio" name="zoom_${charId}" value="thighs-up"><span class="service-name">Thighs up</span></label>
                        <label class="service-option"><input type="radio" name="zoom_${charId}" value="full-body"><span class="service-name">Full body</span></label>
                    </div>
                </div>
            `;
            
            // Background section for individual characters
            const bgDiv = document.createElement('div');
            bgDiv.className = 'form-group';
            bgDiv.id = `charBgGroup_${charId}`;
            
            let sameAsHtml = '';
            if (charId > 1) {
                sameAsHtml = `
                    <div id="sameAsGroup_${charId}" class="form-group" style="margin-top: var(--sm);">
                        <label>Or use same background as:</label>
                        <select id="sameAsDropdown_${charId}" name="character_${charId}_sameAsBackground" class="form-input same-as-dropdown" data-char="${charId}">
                            ${buildSameAsDropdown(charId, count)}
                        </select>
                        <span class="form-note">No additional charge when selecting an existing background</span>
                    </div>
                `;
            }
            
            bgDiv.innerHTML = `
                <label>Background for this character</label>
                <div class="service-selector service-selector-2cols char-bg-selector" data-char="${charId}">
                    <label class="service-option"><input type="radio" name="charBg_${charId}" value="none"><span class="service-name">No background (simple gradient)</span><p class="small-body">€0</p></label>
                    <label class="service-option"><input type="radio" name="charBg_${charId}" value="pattern-bg"><span class="service-name">Pattern background</span><p class="small-body">+€100</p></label>
                    <label class="service-option"><input type="radio" name="charBg_${charId}" value="digital-bg"><span class="service-name">Digital background</span><p class="small-body">+€300</p></label>
                    <label class="service-option"><input type="radio" name="charBg_${charId}" value="3d-bg"><span class="service-name">3D background</span><p class="small-body">+€400</p></label>
                </div>
                <div id="charBgDetails_${charId}" class="char-bg-details" style="display:none;">
                    <div class="form-group">
                        <label for="charBgDesc_${charId}">Background description</label>
                        <textarea id="charBgDesc_${charId}" name="character_${charId}_bgDescription" class="form-textarea" placeholder="Describe background environment"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="charBgRef_${charId}">Background reference links</label>
                        <input type="url" id="charBgRef_${charId}" name="character_${charId}_bgReference" class="form-input" placeholder="https://...">
                    </div>
                </div>
                <div id="charBgColorField_${charId}" style="display:none;">
                    <div class="form-group">
                        <label for="charBgColor_${charId}">Background color (if simple gradient selected)</label>
                        <input type="text" id="charBgColor_${charId}" name="character_${charId}_bgColor" class="form-input" placeholder="e.g., #1a1a2e, dark blue, purple gradient">
                    </div>
                </div>
                ${sameAsHtml}
            `;
            body.appendChild(bgDiv);
            cardDiv.appendChild(header);
            cardDiv.appendChild(body);
            container.appendChild(cardDiv);
            
            // Collapse toggle
            let isOpen = false;
            header.addEventListener('click', () => {
                isOpen = !isOpen;
                body.style.display = isOpen ? 'block' : 'none';
                toggleSpan.textContent = isOpen ? '▲' : '▼';
            });
            
            // Pose conditional logic
            const poseRadios = body.querySelectorAll(`input[name="poseType_${charId}"]`);
            const updatePose = () => {
                const selected = body.querySelector(`input[name="poseType_${charId}"]:checked`);
                body.querySelectorAll('.conditional-pose').forEach(el => el.style.display = 'none');
                if (selected) {
                    const target = body.querySelector(`.conditional-pose[data-char="${charId}"][data-pose="${selected.value}"]`);
                    if (target) target.style.display = 'block';
                }
            };
            poseRadios.forEach(r => r.addEventListener('change', updatePose));
            
            // Background toggle logic
            const bgSelector = bgDiv.querySelector('.char-bg-selector');
            const bgRadiosList = bgSelector.querySelectorAll('input[type="radio"]');
            const sameAsDropdown = bgDiv.querySelector(`#sameAsDropdown_${charId}`);
            
            const updateBgVisibilityForChar = () => {
                updateCharBgVisibility(charId);
                updateTotalPrice();
            };
            
            bgRadiosList.forEach(radio => radio.addEventListener('change', () => {
                if (sameAsDropdown) sameAsDropdown.value = '';
                updateBgVisibilityForChar();
            }));
            
            if (sameAsDropdown) {
                sameAsDropdown.addEventListener('change', function() {
                    if (this.value) {
                        // Clear background radio selection
                        bgRadiosList.forEach(r => r.checked = false);
                        // Hide background details
                        const bgDetails = document.getElementById(`charBgDetails_${charId}`);
                        const bgColorField = document.getElementById(`charBgColorField_${charId}`);
                        if (bgDetails) bgDetails.style.display = 'none';
                        if (bgColorField) bgColorField.style.display = 'none';
                    }
                    updateTotalPrice();
                });
            }
            
            updateBgVisibilityForChar();
            
            currentCharacters.push({id: charId, body: body});
        }
        
        // Add name change listeners for dropdown updates
        document.querySelectorAll('.char-name-input').forEach(input => {
            input.addEventListener('input', updateAllSameAsDropdowns);
        });
        
        updateLayoutVisibility();
        updateTotalPrice();
    }
    
    // Event listeners
    charCountInput.addEventListener('change', rebuildCharacterCards);
    
    const layoutRadios = document.querySelectorAll('input[name="layoutType"]');
    layoutRadios.forEach(radio => {
        radio.addEventListener('change', updateLayoutVisibility);
    });
    
    if (globalAddonSelector) {
        const globalBgRadios = globalAddonSelector.querySelectorAll('input[type="radio"]');
        globalBgRadios.forEach(radio => {
            radio.addEventListener('change', updateGlobalBgVisibility);
        });
    }
    
    const packageRadios = document.querySelectorAll('input[name="package"]');
    packageRadios.forEach(radio => {
        radio.addEventListener('change', updateTotalPrice);
    });
    
    const sourceRadios = document.querySelectorAll('input[name="sourceFiles"]');
    sourceRadios.forEach(radio => {
        radio.addEventListener('change', updateTotalPrice);
    });
    
    rebuildCharacterCards();
    
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