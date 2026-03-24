// ===== FORM FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    initCharacterArtForm();
    initProjectFeedbackForm();
    initTypesettingForm();
    initPromoArtForm(); 
    initMapsForm(); 
    initTraditionalArtForm(); 
    initCoverDesignForm(); 
    initAuthorBrandForm(); 
    initPublisherForm(); 
});

// ===== CHARACTER ART FORM =====
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
                        <label for="charBgColor_${charId}">Background color</label>
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

// ===== TYPESETTING FORM =====
function initTypesettingForm() {
    const form = document.getElementById('typesettingForm');
    if (!form) return;
    
    // DOM elements
    const packageRadios = document.querySelectorAll('#typesettingForm input[name="package"]');
    const addonContainer = document.getElementById('addonsSelector');
    const sourceRadios = document.querySelectorAll('#typesettingForm input[name="sourceFiles"]');
    const additionalFormatsDetails = document.getElementById('additionalFormatsDetails');
    const sceneArtDetails = document.getElementById('sceneArtDetails');
    const formatCountInput = document.getElementById('formatCount');
    const formatTypesInput = document.getElementById('formatTypes');
    const sceneArtDescription = document.getElementById('sceneArtDescription');
    const coverLinkField = document.getElementById('coverLinkField');
    const coverAssistanceNote = document.getElementById('coverAssistanceNote');
    const coverHasOption = document.getElementById('coverHasOption');
    const coverNeedOption = document.getElementById('coverNeedOption');
    const trimSizeGroup = document.getElementById('trimSizeGroup');
    const trimSizeInput = document.getElementById('trimSize');
    
    // Store selected addons
    let selectedAddons = new Set();
    
    // COMPLETELY REBUILD ADD-ONS WITHOUT CHECKBOXES
    function rebuildAddonsWithoutCheckboxes() {
        if (!addonContainer) return;
        
        const addonData = [
            { value: 'scene-art', price: 25, name: 'Scene art', description: 'Custom vector illustrations for chapter headers, scene breaks, or pagination. Also provided as separate files.' },
            { value: 'additional-formats', price: 100, name: 'Additional formats', description: 'Expand your reach. Convert your finished design — ebook from print, or paperback from hardback.' },
            { value: 'clean-ebook', price: 100, name: 'Clean ebook', description: 'Your print book, expertly adapted for a flawless digital reading experience on all ereader platforms.' }
        ];
        
        addonContainer.innerHTML = '';
        
        addonData.forEach(data => {
            const label = document.createElement('label');
            label.className = 'service-option addon-option';
            label.setAttribute('data-addon-value', data.value);
            label.setAttribute('data-price', data.price);
            label.style.cursor = 'pointer';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'service-name';
            nameSpan.innerText = data.name;
            
            const descP = document.createElement('p');
            descP.className = 'small-body';
            descP.innerText = data.description;
            
            const priceP = document.createElement('p');
            priceP.innerText = `+€${data.price}${data.value === 'additional-formats' ? ' each' : ''}`;
            
            label.appendChild(nameSpan);
            label.appendChild(descP);
            label.appendChild(priceP);
            
            addonContainer.appendChild(label);
        });
    }
    
    // Get all addon options after rebuild
    function getAddonOptions() {
        return document.querySelectorAll('#addonsSelector .addon-option');
    }
    
    // Helper: check if selected package is special (journals or poetry)
    function isSpecialPackage() {
        const selectedPackage = document.querySelector('#typesettingForm input[name="package"]:checked');
        if (!selectedPackage) return false;
        const val = selectedPackage.value;
        return val === 'journals' || val === 'poetry';
    }
    
    // Helper: check if selected package is ebook formatting
    function isEbookPackage() {
        const selectedPackage = document.querySelector('#typesettingForm input[name="package"]:checked');
        if (!selectedPackage) return false;
        return selectedPackage.value === 'ebook-formatting';
    }
    
    // Helper: check if print-related package (print-layout, art-print-layout, or journals/poetry which may have print)
    function isPrintRelatedPackage() {
        const selectedPackage = document.querySelector('#typesettingForm input[name="package"]:checked');
        if (!selectedPackage) return false;
        const val = selectedPackage.value;
        return val === 'print-layout' || val === 'art-print-layout' || val === 'journals' || val === 'poetry';
    }
    
    // Helper: check if additional formats add-on is selected
    function isAdditionalFormatsSelected() {
        return selectedAddons.has('additional-formats');
    }
    
    // Update trim size visibility based on package and add-ons
    function updateTrimSizeVisibility() {
        const showTrimSize = isPrintRelatedPackage() || isAdditionalFormatsSelected();
        if (trimSizeGroup) {
            trimSizeGroup.style.display = showTrimSize ? 'block' : 'none';
        }
    }
    
    // Helper: get selected addons total with dynamic pricing for additional formats
    function getSelectedAddonsTotal() {
        if (isSpecialPackage()) return 0;
        let total = 0;
        selectedAddons.forEach(addonValue => {
            const addonOption = Array.from(getAddonOptions()).find(opt => opt.getAttribute('data-addon-value') === addonValue);
            if (addonOption) {
                let price = parseInt(addonOption.getAttribute('data-price') || 0);
                if (addonValue === 'additional-formats' && formatCountInput) {
                    const count = parseInt(formatCountInput.value) || 1;
                    price = price * count;
                }
                total += price;
            }
        });
        return total;
    }
    
    // Helper: get selected addons names for breakdown
    function getSelectedAddonsList() {
        const addons = [];
        selectedAddons.forEach(addonValue => {
            const addonOption = Array.from(getAddonOptions()).find(opt => opt.getAttribute('data-addon-value') === addonValue);
            if (addonOption) {
                const nameSpan = addonOption.querySelector('.service-name');
                let name = nameSpan ? nameSpan.innerText : addonValue;
                if (addonValue === 'additional-formats' && formatCountInput) {
                    const count = parseInt(formatCountInput.value) || 1;
                    name = `${name} (${count} format${count > 1 ? 's' : ''})`;
                }
                addons.push(name);
            }
        });
        return addons;
    }
    
    // Update visual styling of addon options
    function updateAddonVisuals() {
        const addonOptionsList = getAddonOptions();
        addonOptionsList.forEach(option => {
            const addonValue = option.getAttribute('data-addon-value');
            if (selectedAddons.has(addonValue)) {
                option.classList.add('selected');
                option.style.borderColor = 'var(--accent)';
                option.style.backgroundColor = 'rgba(190, 0, 44, 0.1)';
            } else {
                option.classList.remove('selected');
                option.style.borderColor = '';
                option.style.backgroundColor = '';
            }
        });
    }
    
    // Show/hide add-on detail fields
    function updateAddonDetailsVisibility() {
        const isSceneArtSelected = selectedAddons.has('scene-art');
        const isAdditionalFormatsSelected = selectedAddons.has('additional-formats');
        
        if (sceneArtDetails) {
            sceneArtDetails.style.display = (isSceneArtSelected && !isSpecialPackage()) ? 'block' : 'none';
        }
        if (additionalFormatsDetails) {
            additionalFormatsDetails.style.display = (isAdditionalFormatsSelected && !isSpecialPackage()) ? 'block' : 'none';
        }
        updateTrimSizeVisibility();
        updateTotalPrice();
    }
    
    // Toggle addon selection (click to select/unselect)
    function setupAddonToggle() {
        const addonOptionsList = getAddonOptions();
        addonOptionsList.forEach(option => {
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            const addonValue = newOption.getAttribute('data-addon-value');
            
            newOption.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Check if a package is selected first
                const hasPackageSelected = document.querySelector('#typesettingForm input[name="package"]:checked');
                if (!hasPackageSelected) {
                    alert('Please select a package first before choosing add-ons.');
                    return;
                }
                
                // Check if special package is selected
                if (isSpecialPackage()) return;
                
                if (selectedAddons.has(addonValue)) {
                    selectedAddons.delete(addonValue);
                } else {
                    selectedAddons.add(addonValue);
                }
                
                updateAddonVisuals();
                updateAddonDetailsVisibility();
                updateTotalPrice();
            });
        });
    }
    
    // Enable/disable addons based on package type
    function updateAddonsAvailability() {
        const special = isSpecialPackage();
        const hasPackageSelected = document.querySelector('#typesettingForm input[name="package"]:checked');
        const addonOptionsList = getAddonOptions();
        
        addonOptionsList.forEach(option => {
            if (special || !hasPackageSelected) {
                option.style.opacity = '0.5';
                option.style.cursor = 'not-allowed';
                option.style.pointerEvents = 'none';
            } else {
                option.style.opacity = '1';
                option.style.cursor = 'pointer';
                option.style.pointerEvents = 'auto';
            }
        });
        
        // Clear selected addons if special package is selected
        if (special && selectedAddons.size > 0) {
            selectedAddons.clear();
            updateAddonVisuals();
        }
        
        updateAddonDetailsVisibility();
        updateTotalPrice();
    }
    
    // Update total price estimate
    function updateTotalPrice() {
        const selectedPackage = document.querySelector('#typesettingForm input[name="package"]:checked');
        if (!selectedPackage) return;
        
        const basePrice = parseInt(selectedPackage.getAttribute('data-price')) || 0;
        const addonsTotal = getSelectedAddonsTotal();
        
        // Source files fee - €100
        const sourceRadio = document.querySelector('#typesettingForm input[name="sourceFiles"]:checked');
        const sourceFee = sourceRadio && sourceRadio.value === 'yes' ? 100 : 0;
        
        const total = basePrice + addonsTotal + sourceFee;
        
        // Build breakdown HTML
        const breakdownDiv = document.getElementById('priceBreakdown');
        if (breakdownDiv) {
            let packageDisplayName = getPackageDisplayName(selectedPackage.value);
            let breakdownHtml = `<p><strong>Package:</strong> ${packageDisplayName} – €${basePrice}</p>`;
            
            const addonsList = getSelectedAddonsList();
            if (addonsList.length > 0 && !isSpecialPackage()) {
                breakdownHtml += `<p><strong>Add-ons:</strong> ${addonsList.join(', ')} – +€${addonsTotal}</p>`;
            }
            
            if (sourceFee > 0) {
                breakdownHtml += `<p><strong>Source files:</strong> +€${sourceFee}</p>`;
            }
            
            breakdownHtml += `<hr>`;
            breakdownDiv.innerHTML = breakdownHtml;
        }
        
        const totalDisplay = document.getElementById('totalEstimateDisplay');
        if (totalDisplay) {
            totalDisplay.innerHTML = `Total Estimate: €${total}`;
        }
    }
    
    // Helper to get readable package name
    function getPackageDisplayName(packageValue) {
        const names = {
            'ebook-formatting': 'Ebook formatting',
            'print-layout': 'Print layout',
            'art-print-layout': 'Art print layout',
            'journals': 'Journals',
            'poetry': 'Poetry'
        };
        return names[packageValue] || packageValue;
    }
    
    // Setup cover options as toggle cards
    function setupCoverOptions() {
        function updateCoverVisuals() {
            const hasSelected = coverHasOption && coverHasOption.classList.contains('selected');
            const needSelected = coverNeedOption && coverNeedOption.classList.contains('selected');
            
            if (coverLinkField) {
                coverLinkField.style.display = hasSelected ? 'block' : 'none';
            }
            if (coverAssistanceNote) {
                coverAssistanceNote.style.display = needSelected ? 'block' : 'none';
            }
        }
        
        function setupCoverToggle(option) {
            if (!option) return;
            
            option.style.cursor = 'pointer';
            
            option.addEventListener('click', function(e) {
                e.preventDefault();
                
                const isSelected = this.classList.contains('selected');
                
                // Deselect both first
                if (coverHasOption) coverHasOption.classList.remove('selected');
                if (coverNeedOption) coverNeedOption.classList.remove('selected');
                
                // Remove styling
                if (coverHasOption) {
                    coverHasOption.style.borderColor = '';
                    coverHasOption.style.backgroundColor = '';
                }
                if (coverNeedOption) {
                    coverNeedOption.style.borderColor = '';
                    coverNeedOption.style.backgroundColor = '';
                }
                
                // If it wasn't selected, select this one
                if (!isSelected) {
                    this.classList.add('selected');
                    this.style.borderColor = 'var(--accent)';
                    this.style.backgroundColor = 'rgba(190, 0, 44, 0.1)';
                }
                
                updateCoverVisuals();
            });
        }
        
        if (coverHasOption) setupCoverToggle(coverHasOption);
        if (coverNeedOption) setupCoverToggle(coverNeedOption);
        
        updateCoverVisuals();
    }
    
    // Validate URL
    function isValidUrl(url) {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // Format count change listener
    if (formatCountInput) {
        formatCountInput.addEventListener('change', function() {
            updateTotalPrice();
        });
    }
    
    // Add change listeners to package radios
    packageRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateAddonsAvailability();
            updateTrimSizeVisibility();
            updateTotalPrice();
        });
    });
    
    // Add change listeners to source files radios
    sourceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateTotalPrice();
        });
    });
    
    // Form validation and submission
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
            alert('Please provide your email address so I can respond to your inquiry.');
            if (emailField) emailField.focus();
            return;
        }
        
        const nameField = document.getElementById('clientName');
        if (!nameField || !nameField.value.trim()) {
            e.preventDefault();
            alert('Please provide your name or pen name.');
            if (nameField) nameField.focus();
            return;
        }
        
        const packageSelected = document.querySelector('#typesettingForm input[name="package"]:checked');
        if (!packageSelected) {
            e.preventDefault();
            alert('Please select a package before submitting.');
            return;
        }
        
        // Validate cover link if provided
        const coverLink = document.getElementById('coverLink');
        if (coverLink && coverLink.value && !isValidUrl(coverLink.value)) {
            e.preventDefault();
            alert('Please enter a valid URL for your cover link.');
            coverLink.focus();
            return;
        }
        
        // Validate inspiration links if provided
        const inspirationLinks = document.getElementById('inspirationLinks');
        if (inspirationLinks && inspirationLinks.value && !isValidUrl(inspirationLinks.value)) {
            e.preventDefault();
            alert('Please enter a valid URL for inspiration links.');
            inspirationLinks.focus();
            return;
        }
        
        // Add hidden fields for selected addons
        if (selectedAddons.size > 0) {
            const addonsList = Array.from(selectedAddons).join(', ');
            let existingInput = form.querySelector('input[name="selected_addons"]');
            if (existingInput) existingInput.remove();
            const addonsInput = document.createElement('input');
            addonsInput.type = 'hidden';
            addonsInput.name = 'selected_addons';
            addonsInput.value = addonsList;
            form.appendChild(addonsInput);
        }
        
        // Add scene art description if selected
        if (selectedAddons.has('scene-art') && sceneArtDescription && sceneArtDescription.value) {
            let existingInput = form.querySelector('input[name="scene_art_description"]');
            if (existingInput) existingInput.remove();
            const descInput = document.createElement('input');
            descInput.type = 'hidden';
            descInput.name = 'scene_art_description';
            descInput.value = sceneArtDescription.value;
            form.appendChild(descInput);
        }
        
        // Add cover status
        const hasCoverSelected = coverHasOption && coverHasOption.classList.contains('selected');
        const needCoverSelected = coverNeedOption && coverNeedOption.classList.contains('selected');
        
        if (hasCoverSelected) {
            let existingInput = form.querySelector('input[name="cover_status"]');
            if (existingInput) existingInput.remove();
            const coverInput = document.createElement('input');
            coverInput.type = 'hidden';
            coverInput.name = 'cover_status';
            coverInput.value = 'has_cover';
            form.appendChild(coverInput);
            
            if (coverLink && coverLink.value) {
                let existingLink = form.querySelector('input[name="cover_link"]');
                if (existingLink) existingLink.remove();
                const linkInput = document.createElement('input');
                linkInput.type = 'hidden';
                linkInput.name = 'cover_link';
                linkInput.value = coverLink.value;
                form.appendChild(linkInput);
            }
        } else if (needCoverSelected) {
            let existingInput = form.querySelector('input[name="cover_status"]');
            if (existingInput) existingInput.remove();
            const coverInput = document.createElement('input');
            coverInput.type = 'hidden';
            coverInput.name = 'cover_status';
            coverInput.value = 'need_assistance';
            form.appendChild(coverInput);
        }
        
        // Add additional formats details if selected
        if (selectedAddons.has('additional-formats') && formatCountInput && formatTypesInput) {
            let existingCount = form.querySelector('input[name="additional_formats_count"]');
            if (existingCount) existingCount.remove();
            const countInput = document.createElement('input');
            countInput.type = 'hidden';
            countInput.name = 'additional_formats_count';
            countInput.value = formatCountInput.value;
            form.appendChild(countInput);
            
            if (formatTypesInput.value) {
                let existingTypes = form.querySelector('input[name="additional_formats_types"]');
                if (existingTypes) existingTypes.remove();
                const typesInput = document.createElement('input');
                typesInput.type = 'hidden';
                typesInput.name = 'additional_formats_types';
                typesInput.value = formatTypesInput.value;
                form.appendChild(typesInput);
            }
        }
    });
    
    // Initialize
    rebuildAddonsWithoutCheckboxes();
    setupAddonToggle();
    setupCoverOptions();
    updateAddonsAvailability();
    updateTrimSizeVisibility();
}

// ===== PROMO ART FORM =====
function initPromoArtForm() {
    const form = document.getElementById('promoArtForm');
    if (!form) return;
    
    // DOM elements
    const packageRadios = document.querySelectorAll('#promoArtForm input[name="package"]');
    const addonContainer = document.getElementById('addonsSelector');
    const sourceRadios = document.querySelectorAll('#promoArtForm input[name="sourceFiles"]');
    const setCountInput = document.getElementById('setCount');
    const alternateVersionsDetails = document.getElementById('alternateVersionsDetails');
    const fullChapterSetDetails = document.getElementById('fullChapterSetDetails');
    
    // Store selected addons
    let selectedAddons = new Set();
    
    // Rebuild add-ons without checkboxes - using same styling as packages
    function rebuildAddonsWithoutCheckboxes() {
        if (!addonContainer) return;
        
        const addonData = [
            { value: 'advanced-vector', price: 25, name: 'Advanced vector', description: 'More detailed designs for simple vector art. Upgrade your icons and headers with extra complexity and polish.' },
            { value: 'alternate-versions', price: 50, name: 'Alternate versions', description: 'Slight variations for chapter art instead of new designs, just adjusted current ones. Flexibility for different uses.' },
            { value: 'full-chapter-set', price: 150, name: 'Full chapter set', description: 'Complete chapter art package including headers, scene breaks, pagination, and part-titles for your entire book.' }
        ];
        
        addonContainer.innerHTML = '';
        addonContainer.className = 'service-selector';
        
        addonData.forEach(data => {
            const label = document.createElement('label');
            label.className = 'service-option addon-option';
            label.setAttribute('data-addon-value', data.value);
            label.setAttribute('data-price', data.price);
            label.style.cursor = 'pointer';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'service-name';
            nameSpan.innerText = data.name;
            
            const descP = document.createElement('p');
            descP.className = 'small-body';
            descP.innerText = data.description;
            
            const priceP = document.createElement('p');
            priceP.innerText = `+€${data.price} / set`;
            
            label.appendChild(nameSpan);
            label.appendChild(descP);
            label.appendChild(priceP);
            
            addonContainer.appendChild(label);
        });
    }
    
    function getAddonOptions() {
        return document.querySelectorAll('#addonsSelector .addon-option');
    }
    
    function getSelectedAddonsTotal() {
        const setCount = parseInt(setCountInput.value) || 1;
        let total = 0;
        selectedAddons.forEach(addonValue => {
            const addonOption = Array.from(getAddonOptions()).find(opt => opt.getAttribute('data-addon-value') === addonValue);
            if (addonOption) {
                const pricePerSet = parseInt(addonOption.getAttribute('data-price') || 0);
                total += pricePerSet * setCount;
            }
        });
        return total;
    }
    
    function getSelectedAddonsList() {
        const setCount = parseInt(setCountInput.value) || 1;
        const addons = [];
        selectedAddons.forEach(addonValue => {
            const addonOption = Array.from(getAddonOptions()).find(opt => opt.getAttribute('data-addon-value') === addonValue);
            if (addonOption) {
                const nameSpan = addonOption.querySelector('.service-name');
                const baseName = nameSpan ? nameSpan.innerText : addonValue;
                if (setCount > 1) {
                    addons.push(`${baseName} (${setCount} sets)`);
                } else {
                    addons.push(baseName);
                }
            }
        });
        return addons;
    }
    
    function updateAddonVisuals() {
        const addonOptionsList = getAddonOptions();
        addonOptionsList.forEach(option => {
            const addonValue = option.getAttribute('data-addon-value');
            if (selectedAddons.has(addonValue)) {
                option.classList.add('selected');
                option.style.borderColor = 'var(--accent)';
                option.style.backgroundColor = 'rgba(190, 0, 44, 0.1)';
            } else {
                option.classList.remove('selected');
                option.style.borderColor = '';
                option.style.backgroundColor = '';
            }
        });
    }
    
    function updateAddonDetailsVisibility() {
        const isAlternateVersionsSelected = selectedAddons.has('alternate-versions');
        const isFullChapterSetSelected = selectedAddons.has('full-chapter-set');
        
        if (alternateVersionsDetails) {
            alternateVersionsDetails.style.display = isAlternateVersionsSelected ? 'block' : 'none';
        }
        if (fullChapterSetDetails) {
            fullChapterSetDetails.style.display = isFullChapterSetSelected ? 'block' : 'none';
        }
    }
    
    function setupAddonToggle() {
        const addonOptionsList = getAddonOptions();
        addonOptionsList.forEach(option => {
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            const addonValue = newOption.getAttribute('data-addon-value');
            
            newOption.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const hasPackageSelected = document.querySelector('#promoArtForm input[name="package"]:checked');
                if (!hasPackageSelected) {
                    alert('Please select a package first before choosing add-ons.');
                    return;
                }
                
                if (selectedAddons.has(addonValue)) {
                    selectedAddons.delete(addonValue);
                } else {
                    selectedAddons.add(addonValue);
                }
                
                updateAddonVisuals();
                updateAddonDetailsVisibility();
                updateTotalPrice();
            });
        });
    }
    
    function updateTotalPrice() {
        const selectedPackage = document.querySelector('#promoArtForm input[name="package"]:checked');
        if (!selectedPackage) return;
        
        const basePrice = parseInt(selectedPackage.getAttribute('data-price')) || 0;
        const setCount = parseInt(setCountInput.value) || 1;
        const packageTotal = basePrice * setCount;
        const addonsTotal = getSelectedAddonsTotal();
        
        const sourceRadio = document.querySelector('#promoArtForm input[name="sourceFiles"]:checked');
        const sourceFee = sourceRadio && sourceRadio.value === 'yes' ? 50 : 0;
        
        const total = packageTotal + addonsTotal + sourceFee;
        
        const breakdownDiv = document.getElementById('priceBreakdown');
        if (breakdownDiv) {
            let packageDisplayName = getPackageDisplayName(selectedPackage.value);
            let breakdownHtml = `<p><strong>Package:</strong> ${packageDisplayName} – €${basePrice} × ${setCount} set${setCount > 1 ? 's' : ''} = €${packageTotal}</p>`;
            
            const addonsList = getSelectedAddonsList();
            if (addonsList.length > 0) {
                breakdownHtml += `<p><strong>Add-ons:</strong> ${addonsList.join(', ')} – +€${addonsTotal}</p>`;
            }
            
            if (sourceFee > 0) {
                breakdownHtml += `<p><strong>Source files:</strong> +€${sourceFee}</p>`;
            }
            
            breakdownHtml += `<hr>`;
            breakdownDiv.innerHTML = breakdownHtml;
        }
        
        const totalDisplay = document.getElementById('totalEstimateDisplay');
        if (totalDisplay) {
            totalDisplay.innerHTML = `Total Estimate: €${total}`;
        }
    }
    
    function getPackageDisplayName(packageValue) {
        const names = {
            'icons-headers': 'Icons & headers',
            'textured-vectors': 'Textured vectors',
            'chapter-art': 'Chapter art'
        };
        return names[packageValue] || packageValue;
    }
    
    function isValidUrl(url) {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // Event listeners
    if (setCountInput) {
        setCountInput.addEventListener('change', function() {
            if (this.value < 1) this.value = 1;
            updateTotalPrice();
        });
    }
    
    packageRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateTotalPrice();
        });
    });
    
    sourceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateTotalPrice();
        });
    });
    
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
            alert('Please provide your email address so I can respond to your inquiry.');
            if (emailField) emailField.focus();
            return;
        }
        
        const nameField = document.getElementById('clientName');
        if (!nameField || !nameField.value.trim()) {
            e.preventDefault();
            alert('Please provide your name or pen name.');
            if (nameField) nameField.focus();
            return;
        }
        
        const packageSelected = document.querySelector('#promoArtForm input[name="package"]:checked');
        if (!packageSelected) {
            e.preventDefault();
            alert('Please select a package before submitting.');
            return;
        }
        
        const inspirationLinks = document.getElementById('inspirationLinks');
        if (inspirationLinks && inspirationLinks.value && !isValidUrl(inspirationLinks.value)) {
            e.preventDefault();
            alert('Please enter a valid URL for inspiration links.');
            inspirationLinks.focus();
            return;
        }
        
        // Add hidden fields for selected addons
        if (selectedAddons.size > 0) {
            const addonsList = Array.from(selectedAddons).join(', ');
            let existingInput = form.querySelector('input[name="selected_addons"]');
            if (existingInput) existingInput.remove();
            const addonsInput = document.createElement('input');
            addonsInput.type = 'hidden';
            addonsInput.name = 'selected_addons';
            addonsInput.value = addonsList;
            form.appendChild(addonsInput);
        }
        
        // Add set count
        const setCount = parseInt(setCountInput.value) || 1;
        let existingSetCount = form.querySelector('input[name="set_count"]');
        if (existingSetCount) existingSetCount.remove();
        const setCountInputHidden = document.createElement('input');
        setCountInputHidden.type = 'hidden';
        setCountInputHidden.name = 'set_count';
        setCountInputHidden.value = setCount;
        form.appendChild(setCountInputHidden);
        
        // Add alternate versions description if selected
        if (selectedAddons.has('alternate-versions')) {
            const altDesc = document.getElementById('alternateVersionsDescription');
            if (altDesc && altDesc.value) {
                let existingInput = form.querySelector('input[name="alternate_versions_description"]');
                if (existingInput) existingInput.remove();
                const descInput = document.createElement('input');
                descInput.type = 'hidden';
                descInput.name = 'alternate_versions_description';
                descInput.value = altDesc.value;
                form.appendChild(descInput);
            }
        }
        
        // Add full chapter set description if selected
        if (selectedAddons.has('full-chapter-set')) {
            const fullDesc = document.getElementById('fullChapterSetDescription');
            if (fullDesc && fullDesc.value) {
                let existingInput = form.querySelector('input[name="full_chapter_set_description"]');
                if (existingInput) existingInput.remove();
                const descInput = document.createElement('input');
                descInput.type = 'hidden';
                descInput.name = 'full_chapter_set_description';
                descInput.value = fullDesc.value;
                form.appendChild(descInput);
            }
        }
    });
    
    // Initialize
    rebuildAddonsWithoutCheckboxes();
    setupAddonToggle();
    updateTotalPrice();
}

// ===== MAPS FORM =====
function initMapsForm() {
    const form = document.getElementById('mapsForm');
    if (!form) return;
    
    // DOM elements
    const packageRadios = document.querySelectorAll('#mapsForm input[name="package"]');
    const addonContainer = document.getElementById('addonsSelector');
    const sourceRadios = document.querySelectorAll('#mapsForm input[name="sourceFiles"]');
    const customIconsDetails = document.getElementById('customIconsDetails');
    const bwClrVariationDetails = document.getElementById('bwClrVariationDetails');
    const handDrawnDetails = document.getElementById('handDrawnDetails');
    const iconCountInput = document.getElementById('iconCount');
    const intendedUseSelect = document.getElementById('intendedUse');
    const printDetailsDiv = document.getElementById('printDetails');
    const digitalDetailsDiv = document.getElementById('digitalDetails');
    const bleedRadios = document.querySelectorAll('#mapsForm input[name="bleedOption"]');
    const borderDetailsDiv = document.getElementById('borderDetails');
    
    // Store selected addons
    let selectedAddons = new Set();
    
    // Rebuild add-ons without checkboxes
    function rebuildAddonsWithoutCheckboxes() {
        if (!addonContainer) return;
        
        const addonData = [
            { value: 'custom-icons', price: 25, name: 'Custom icons', description: 'Unique map markers, compass roses, and location symbols tailored to your world. Hand-drawn or vector.' },
            { value: 'bw-clr-variation', price: 50, name: 'BW/Clr variation', description: 'Add simple colour swatches to basic maps, or add custom BW filter to coloured maps. Flexibility for different uses.' },
            { value: 'hand-drawn', price: 200, name: 'Hand-drawn', description: 'Full customization with hand-drawn elements, from icons to landscape and more. Truly one-of-a-kind map details.' }
        ];
        
        addonContainer.innerHTML = '';
        addonContainer.className = 'service-selector';
        
        addonData.forEach(data => {
            const label = document.createElement('label');
            label.className = 'service-option addon-option';
            label.setAttribute('data-addon-value', data.value);
            label.setAttribute('data-price', data.price);
            label.style.cursor = 'pointer';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'service-name';
            nameSpan.innerText = data.name;
            
            const descP = document.createElement('p');
            descP.className = 'small-body';
            descP.innerText = data.description;
            
            const priceP = document.createElement('p');
            priceP.innerText = data.value === 'custom-icons' ? `+€${data.price} / set of 3` : `+€${data.price}`;
            
            label.appendChild(nameSpan);
            label.appendChild(descP);
            label.appendChild(priceP);
            
            addonContainer.appendChild(label);
        });
    }
    
    function getAddonOptions() {
        return document.querySelectorAll('#addonsSelector .addon-option');
    }
    
    function getSelectedAddonsTotal() {
        let total = 0;
        selectedAddons.forEach(addonValue => {
            const addonOption = Array.from(getAddonOptions()).find(opt => opt.getAttribute('data-addon-value') === addonValue);
            if (addonOption) {
                let price = parseInt(addonOption.getAttribute('data-price') || 0);
                if (addonValue === 'custom-icons' && iconCountInput) {
                    const iconSets = parseInt(iconCountInput.value) || 1;
                    price = price * iconSets;
                }
                total += price;
            }
        });
        return total;
    }
    
    function getSelectedAddonsList() {
        const addons = [];
        selectedAddons.forEach(addonValue => {
            const addonOption = Array.from(getAddonOptions()).find(opt => opt.getAttribute('data-addon-value') === addonValue);
            if (addonOption) {
                const nameSpan = addonOption.querySelector('.service-name');
                let name = nameSpan ? nameSpan.innerText : addonValue;
                if (addonValue === 'custom-icons' && iconCountInput) {
                    const iconSets = parseInt(iconCountInput.value) || 1;
                    name = `${name} (${iconSets} set${iconSets > 1 ? 's' : ''})`;
                }
                addons.push(name);
            }
        });
        return addons;
    }
    
    function updateAddonVisuals() {
        const addonOptionsList = getAddonOptions();
        addonOptionsList.forEach(option => {
            const addonValue = option.getAttribute('data-addon-value');
            if (selectedAddons.has(addonValue)) {
                option.classList.add('selected');
                option.style.borderColor = 'var(--accent)';
                option.style.backgroundColor = 'rgba(190, 0, 44, 0.1)';
            } else {
                option.classList.remove('selected');
                option.style.borderColor = '';
                option.style.backgroundColor = '';
            }
        });
    }
    
    function updateAddonDetailsVisibility() {
        const isCustomIconsSelected = selectedAddons.has('custom-icons');
        const isBwClrVariationSelected = selectedAddons.has('bw-clr-variation');
        const isHandDrawnSelected = selectedAddons.has('hand-drawn');
        
        if (customIconsDetails) {
            customIconsDetails.style.display = isCustomIconsSelected ? 'block' : 'none';
        }
        if (bwClrVariationDetails) {
            bwClrVariationDetails.style.display = isBwClrVariationSelected ? 'block' : 'none';
        }
        if (handDrawnDetails) {
            handDrawnDetails.style.display = isHandDrawnSelected ? 'block' : 'none';
        }
        updateTotalPrice();
    }
    
    function setupAddonToggle() {
        const addonOptionsList = getAddonOptions();
        addonOptionsList.forEach(option => {
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            const addonValue = newOption.getAttribute('data-addon-value');
            
            newOption.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const hasPackageSelected = document.querySelector('#mapsForm input[name="package"]:checked');
                if (!hasPackageSelected) {
                    alert('Please select a package first before choosing add-ons.');
                    return;
                }
                
                if (selectedAddons.has(addonValue)) {
                    selectedAddons.delete(addonValue);
                } else {
                    selectedAddons.add(addonValue);
                }
                
                updateAddonVisuals();
                updateAddonDetailsVisibility();
                updateTotalPrice();
            });
        });
    }
    
    function updateTotalPrice() {
        const selectedPackage = document.querySelector('#mapsForm input[name="package"]:checked');
        if (!selectedPackage) return;
        
        const basePrice = parseInt(selectedPackage.getAttribute('data-price')) || 0;
        const addonsTotal = getSelectedAddonsTotal();
        
        const sourceRadio = document.querySelector('#mapsForm input[name="sourceFiles"]:checked');
        const sourceFee = sourceRadio && sourceRadio.value === 'yes' ? 100 : 0;
        
        const total = basePrice + addonsTotal + sourceFee;
        
        const breakdownDiv = document.getElementById('priceBreakdown');
        if (breakdownDiv) {
            let packageDisplayName = getPackageDisplayName(selectedPackage.value);
            let breakdownHtml = `<p><strong>Package:</strong> ${packageDisplayName} – €${basePrice}</p>`;
            
            const addonsList = getSelectedAddonsList();
            if (addonsList.length > 0) {
                breakdownHtml += `<p><strong>Add-ons:</strong> ${addonsList.join(', ')} – +€${addonsTotal}</p>`;
            }
            
            if (sourceFee > 0) {
                breakdownHtml += `<p><strong>Source files:</strong> +€${sourceFee}</p>`;
            }
            
            breakdownHtml += `<hr>`;
            breakdownDiv.innerHTML = breakdownHtml;
        }
        
        const totalDisplay = document.getElementById('totalEstimateDisplay');
        if (totalDisplay) {
            totalDisplay.innerHTML = `Total Estimate: €${total}`;
        }
    }
    
    function getPackageDisplayName(packageValue) {
        const names = {
            'city-maps': 'City maps',
            'black-white': 'Black and white',
            'coloured': 'Coloured'
        };
        return names[packageValue] || packageValue;
    }
    
    function isValidUrl(url) {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // Intended use - show/hide print details or digital details
    if (intendedUseSelect) {
        intendedUseSelect.addEventListener('change', function() {
            if (printDetailsDiv) {
                printDetailsDiv.style.display = (this.value === 'print' || this.value === 'both') ? 'block' : 'none';
            }
            if (digitalDetailsDiv) {
                digitalDetailsDiv.style.display = (this.value === 'digital-only' || this.value === 'both') ? 'block' : 'none';
            }
        });
    }
    
    // Bleed option - show/hide border details
    if (bleedRadios.length > 0) {
        bleedRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (borderDetailsDiv) {
                    borderDetailsDiv.style.display = (this.value === 'border') ? 'block' : 'none';
                }
            });
        });
    }
    
    // Event listeners
    if (iconCountInput) {
        iconCountInput.addEventListener('change', function() {
            if (this.value < 1) this.value = 1;
            updateTotalPrice();
        });
    }
    
    packageRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateTotalPrice();
        });
    });
    
    sourceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateTotalPrice();
        });
    });
    
    // Variation type radio listeners for additional details
    const variationRadios = document.querySelectorAll('#mapsForm input[name="variationType"]');
    variationRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // No price change, just capturing the selection
        });
    });
    
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
            alert('Please provide your email address so I can respond to your inquiry.');
            if (emailField) emailField.focus();
            return;
        }
        
        const nameField = document.getElementById('clientName');
        if (!nameField || !nameField.value.trim()) {
            e.preventDefault();
            alert('Please provide your name or pen name.');
            if (nameField) nameField.focus();
            return;
        }
        
        const packageSelected = document.querySelector('#mapsForm input[name="package"]:checked');
        if (!packageSelected) {
            e.preventDefault();
            alert('Please select a package before submitting.');
            return;
        }
        
        const inspirationLinks = document.getElementById('inspirationLinks');
        if (inspirationLinks && inspirationLinks.value && !isValidUrl(inspirationLinks.value)) {
            e.preventDefault();
            alert('Please enter a valid URL for inspiration links.');
            inspirationLinks.focus();
            return;
        }
        
        const roughSketchesLinks = document.getElementById('roughSketchesLinks');
        if (roughSketchesLinks && roughSketchesLinks.value && !isValidUrl(roughSketchesLinks.value)) {
            e.preventDefault();
            alert('Please enter a valid URL for rough sketches/design samples.');
            roughSketchesLinks.focus();
            return;
        }
        
        // Add hidden fields for selected addons
        if (selectedAddons.size > 0) {
            const addonsList = Array.from(selectedAddons).join(', ');
            let existingInput = form.querySelector('input[name="selected_addons"]');
            if (existingInput) existingInput.remove();
            const addonsInput = document.createElement('input');
            addonsInput.type = 'hidden';
            addonsInput.name = 'selected_addons';
            addonsInput.value = addonsList;
            form.appendChild(addonsInput);
        }
        
        // Add custom icons details if selected
        if (selectedAddons.has('custom-icons')) {
            const iconSets = iconCountInput ? iconCountInput.value : 1;
            let existingIconSets = form.querySelector('input[name="custom_icons_sets"]');
            if (existingIconSets) existingIconSets.remove();
            const setsInput = document.createElement('input');
            setsInput.type = 'hidden';
            setsInput.name = 'custom_icons_sets';
            setsInput.value = iconSets;
            form.appendChild(setsInput);
            
            const iconDesc = document.getElementById('iconDescriptions');
            if (iconDesc && iconDesc.value) {
                let existingDesc = form.querySelector('input[name="custom_icons_descriptions"]');
                if (existingDesc) existingDesc.remove();
                const descInput = document.createElement('input');
                descInput.type = 'hidden';
                descInput.name = 'custom_icons_descriptions';
                descInput.value = iconDesc.value;
                form.appendChild(descInput);
            }
            
            const iconStyle = document.getElementById('iconStyle');
            if (iconStyle && iconStyle.value) {
                let existingStyle = form.querySelector('input[name="custom_icons_style"]');
                if (existingStyle) existingStyle.remove();
                const styleInput = document.createElement('input');
                styleInput.type = 'hidden';
                styleInput.name = 'custom_icons_style';
                styleInput.value = iconStyle.value;
                form.appendChild(styleInput);
            }
        }
        
        // Add BW/Clr variation details if selected
        if (selectedAddons.has('bw-clr-variation')) {
            const variationType = document.querySelector('#mapsForm input[name="variationType"]:checked');
            if (variationType) {
                let existingType = form.querySelector('input[name="variation_type"]');
                if (existingType) existingType.remove();
                const typeInput = document.createElement('input');
                typeInput.type = 'hidden';
                typeInput.name = 'variation_type';
                typeInput.value = variationType.value;
                form.appendChild(typeInput);
            }
            
            const variationDetails = document.getElementById('variationDetails');
            if (variationDetails && variationDetails.value) {
                let existingDetails = form.querySelector('input[name="variation_details"]');
                if (existingDetails) existingDetails.remove();
                const detailsInput = document.createElement('input');
                detailsInput.type = 'hidden';
                detailsInput.name = 'variation_details';
                detailsInput.value = variationDetails.value;
                form.appendChild(detailsInput);
            }
        }
        
        // Add hand-drawn details if selected
        if (selectedAddons.has('hand-drawn')) {
            const handDrawnElements = document.getElementById('handDrawnElements');
            if (handDrawnElements && handDrawnElements.value) {
                let existingElements = form.querySelector('input[name="hand_drawn_elements"]');
                if (existingElements) existingElements.remove();
                const elementsInput = document.createElement('input');
                elementsInput.type = 'hidden';
                elementsInput.name = 'hand_drawn_elements';
                elementsInput.value = handDrawnElements.value;
                form.appendChild(elementsInput);
            }
            
            const handDrawnStyle = document.getElementById('handDrawnStyle');
            if (handDrawnStyle && handDrawnStyle.value) {
                let existingStyle = form.querySelector('input[name="hand_drawn_style"]');
                if (existingStyle) existingStyle.remove();
                const styleInput = document.createElement('input');
                styleInput.type = 'hidden';
                styleInput.name = 'hand_drawn_style';
                styleInput.value = handDrawnStyle.value;
                form.appendChild(styleInput);
            }
        }
        
        // Add bleed/border details
        const bleedOption = document.querySelector('#mapsForm input[name="bleedOption"]:checked');
        if (bleedOption) {
            let existingBleed = form.querySelector('input[name="bleed_option"]');
            if (existingBleed) existingBleed.remove();
            const bleedInput = document.createElement('input');
            bleedInput.type = 'hidden';
            bleedInput.name = 'bleed_option';
            bleedInput.value = bleedOption.value;
            form.appendChild(bleedInput);
            
            if (bleedOption.value === 'border') {
                const borderDesc = document.getElementById('borderDescription');
                if (borderDesc && borderDesc.value) {
                    let existingBorder = form.querySelector('input[name="border_description"]');
                    if (existingBorder) existingBorder.remove();
                    const borderInput = document.createElement('input');
                    borderInput.type = 'hidden';
                    borderInput.name = 'border_description';
                    borderInput.value = borderDesc.value;
                    form.appendChild(borderInput);
                }
            }
        }
        
        // Add intended use and related fields
        if (intendedUseSelect && intendedUseSelect.value) {
            let existingUse = form.querySelector('input[name="intended_use"]');
            if (existingUse) existingUse.remove();
            const useInput = document.createElement('input');
            useInput.type = 'hidden';
            useInput.name = 'intended_use';
            useInput.value = intendedUseSelect.value;
            form.appendChild(useInput);
        }
        
        // Add print trim size if applicable
        const trimSize = document.getElementById('trimSize');
        if (trimSize && trimSize.value) {
            let existingTrim = form.querySelector('input[name="trim_size"]');
            if (existingTrim) existingTrim.remove();
            const trimInput = document.createElement('input');
            trimInput.type = 'hidden';
            trimInput.name = 'trim_size';
            trimInput.value = trimSize.value;
            form.appendChild(trimInput);
        }
        
        // Add digital size and orientation if applicable
        const digitalSize = document.getElementById('digitalSize');
        if (digitalSize && digitalSize.value) {
            let existingSize = form.querySelector('input[name="digital_size"]');
            if (existingSize) existingSize.remove();
            const sizeInput = document.createElement('input');
            sizeInput.type = 'hidden';
            sizeInput.name = 'digital_size';
            sizeInput.value = digitalSize.value;
            form.appendChild(sizeInput);
        }
        
        const digitalOrientation = document.getElementById('digitalOrientation');
        if (digitalOrientation && digitalOrientation.value) {
            let existingOrientation = form.querySelector('input[name="digital_orientation"]');
            if (existingOrientation) existingOrientation.remove();
            const orientationInput = document.createElement('input');
            orientationInput.type = 'hidden';
            orientationInput.name = 'digital_orientation';
            orientationInput.value = digitalOrientation.value;
            form.appendChild(orientationInput);
        }
        
        // Add rough sketches links
        if (roughSketchesLinks && roughSketchesLinks.value) {
            let existingLinks = form.querySelector('input[name="rough_sketches_links"]');
            if (existingLinks) existingLinks.remove();
            const linksInput = document.createElement('input');
            linksInput.type = 'hidden';
            linksInput.name = 'rough_sketches_links';
            linksInput.value = roughSketchesLinks.value;
            form.appendChild(linksInput);
        }
    });
    
    // Initialize
    rebuildAddonsWithoutCheckboxes();
    setupAddonToggle();
    updateTotalPrice();
}

// ===== TRADITIONAL ART FORM =====
function initTraditionalArtForm() {
    const form = document.getElementById('traditionalArtForm');
    if (!form) return;
    
    // DOM elements
    const packageRadios = document.querySelectorAll('#traditionalArtForm input[name="package"]');
    const addonContainer = document.getElementById('addonsSelector');
    const sourceRadios = document.querySelectorAll('#traditionalArtForm input[name="sourceFiles"]');
    
    // Store selected addons
    let selectedAddons = new Set();
    
    // Rebuild add-ons without checkboxes
    function rebuildAddonsWithoutCheckboxes() {
        if (!addonContainer) return;
        
        const addonData = [
            { value: 'vector-conversion', price: 25, name: 'Vector conversion', description: 'Convert your traditional art to scalable vector format. Perfect for logos, merch, or resizing without quality loss.' },
            { value: 'large-scale', price: 100, name: 'Large scale', description: 'Get a much more detailed and larger scale version of the original idea. For prints or special displays.' },
            { value: 'filled', price: 200, name: 'Filled', description: 'Full page design with darker fills, multiple patterns and drawings. Makes a bold statement.' }
        ];
        
        addonContainer.innerHTML = '';
        addonContainer.className = 'service-selector';
        
        addonData.forEach(data => {
            const label = document.createElement('label');
            label.className = 'service-option addon-option';
            label.setAttribute('data-addon-value', data.value);
            label.setAttribute('data-price', data.price);
            label.style.cursor = 'pointer';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'service-name';
            nameSpan.innerText = data.name;
            
            const descP = document.createElement('p');
            descP.className = 'small-body';
            descP.innerText = data.description;
            
            const priceP = document.createElement('p');
            priceP.innerText = `+€${data.price}`;
            
            label.appendChild(nameSpan);
            label.appendChild(descP);
            label.appendChild(priceP);
            
            addonContainer.appendChild(label);
        });
    }
    
    function getAddonOptions() {
        return document.querySelectorAll('#addonsSelector .addon-option');
    }
    
    function getSelectedAddonsTotal() {
        let total = 0;
        selectedAddons.forEach(addonValue => {
            const addonOption = Array.from(getAddonOptions()).find(opt => opt.getAttribute('data-addon-value') === addonValue);
            if (addonOption) {
                total += parseInt(addonOption.getAttribute('data-price') || 0);
            }
        });
        return total;
    }
    
    function getSelectedAddonsList() {
        const addons = [];
        selectedAddons.forEach(addonValue => {
            const addonOption = Array.from(getAddonOptions()).find(opt => opt.getAttribute('data-addon-value') === addonValue);
            if (addonOption) {
                const nameSpan = addonOption.querySelector('.service-name');
                addons.push(nameSpan ? nameSpan.innerText : addonValue);
            }
        });
        return addons;
    }
    
    function updateAddonVisuals() {
        const addonOptionsList = getAddonOptions();
        addonOptionsList.forEach(option => {
            const addonValue = option.getAttribute('data-addon-value');
            if (selectedAddons.has(addonValue)) {
                option.classList.add('selected');
                option.style.borderColor = 'var(--accent)';
                option.style.backgroundColor = 'rgba(190, 0, 44, 0.1)';
            } else {
                option.classList.remove('selected');
                option.style.borderColor = '';
                option.style.backgroundColor = '';
            }
        });
    }
    
    function setupAddonToggle() {
        const addonOptionsList = getAddonOptions();
        addonOptionsList.forEach(option => {
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            const addonValue = newOption.getAttribute('data-addon-value');
            
            newOption.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const hasPackageSelected = document.querySelector('#traditionalArtForm input[name="package"]:checked');
                if (!hasPackageSelected) {
                    alert('Please select a package first before choosing add-ons.');
                    return;
                }
                
                if (selectedAddons.has(addonValue)) {
                    selectedAddons.delete(addonValue);
                } else {
                    selectedAddons.add(addonValue);
                }
                
                updateAddonVisuals();
                updateTotalPrice();
            });
        });
    }
    
    function updateTotalPrice() {
        const selectedPackage = document.querySelector('#traditionalArtForm input[name="package"]:checked');
        if (!selectedPackage) return;
        
        const basePrice = parseInt(selectedPackage.getAttribute('data-price')) || 0;
        const addonsTotal = getSelectedAddonsTotal();
        
        const sourceRadio = document.querySelector('#traditionalArtForm input[name="sourceFiles"]:checked');
        const sourceFee = sourceRadio && sourceRadio.value === 'yes' ? 100 : 0;
        
        const total = basePrice + addonsTotal + sourceFee;
        
        const breakdownDiv = document.getElementById('priceBreakdown');
        if (breakdownDiv) {
            let packageDisplayName = getPackageDisplayName(selectedPackage.value);
            let breakdownHtml = `<p><strong>Package:</strong> ${packageDisplayName} – €${basePrice}</p>`;
            
            const addonsList = getSelectedAddonsList();
            if (addonsList.length > 0) {
                breakdownHtml += `<p><strong>Add-ons:</strong> ${addonsList.join(', ')} – +€${addonsTotal}</p>`;
            }
            
            if (sourceFee > 0) {
                breakdownHtml += `<p><strong>Source files:</strong> +€${sourceFee}</p>`;
            }
            
            breakdownHtml += `<hr>`;
            breakdownDiv.innerHTML = breakdownHtml;
        }
        
        const totalDisplay = document.getElementById('totalEstimateDisplay');
        if (totalDisplay) {
            totalDisplay.innerHTML = `Total Estimate: €${total}`;
        }
    }
    
    function getPackageDisplayName(packageValue) {
        const names = {
            'ink-drawing': 'Ink drawing',
            'landscape-ink': 'Landscape ink',
            'detailed-ink': 'Detailed ink'
        };
        return names[packageValue] || packageValue;
    }
    
    function isValidUrl(url) {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // Event listeners
    packageRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateTotalPrice();
        });
    });
    
    sourceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateTotalPrice();
        });
    });
    
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
            alert('Please provide your email address so I can respond to your inquiry.');
            if (emailField) emailField.focus();
            return;
        }
        
        const nameField = document.getElementById('clientName');
        if (!nameField || !nameField.value.trim()) {
            e.preventDefault();
            alert('Please provide your name or pen name.');
            if (nameField) nameField.focus();
            return;
        }
        
        const packageSelected = document.querySelector('#traditionalArtForm input[name="package"]:checked');
        if (!packageSelected) {
            e.preventDefault();
            alert('Please select a package before submitting.');
            return;
        }
        
        const inspirationLinks = document.getElementById('inspirationLinks');
        if (inspirationLinks && inspirationLinks.value && !isValidUrl(inspirationLinks.value)) {
            e.preventDefault();
            alert('Please enter a valid URL for inspiration links.');
            inspirationLinks.focus();
            return;
        }
        
        // Add hidden fields for selected addons
        if (selectedAddons.size > 0) {
            const addonsList = Array.from(selectedAddons).join(', ');
            let existingInput = form.querySelector('input[name="selected_addons"]');
            if (existingInput) existingInput.remove();
            const addonsInput = document.createElement('input');
            addonsInput.type = 'hidden';
            addonsInput.name = 'selected_addons';
            addonsInput.value = addonsList;
            form.appendChild(addonsInput);
        }
    });
    
    // Initialize
    rebuildAddonsWithoutCheckboxes();
    setupAddonToggle();
    updateTotalPrice();
}

// ===== COVER DESIGN FORM =====
function initCoverDesignForm() {
    const form = document.getElementById('coverDesignForm');
    if (!form) return;
    
    // DOM elements
    const packageRadios = document.querySelectorAll('#coverDesignForm input[name="package"]');
    const addonContainer = document.getElementById('addonsSelector');
    const sourceRadios = document.querySelectorAll('#coverDesignForm input[name="sourceFiles"]');
    const expandingFormatDetails = document.getElementById('expandingFormatDetails');
    const elementsPackDetails = document.getElementById('elementsPackDetails');
    const adaptationTypeRadios = document.querySelectorAll('#coverDesignForm input[name="adaptationType"]');
    
    // Store selected addons
    let selectedAddons = new Set();
    
    // Helper: check if special package is selected (typography only)
    function isSpecialPackage() {
        const selectedPackage = document.querySelector('#coverDesignForm input[name="package"]:checked');
        if (!selectedPackage) return false;
        return selectedPackage.value === 'typography-only';
    }
    
    // Rebuild add-ons without checkboxes
    function rebuildAddonsWithoutCheckboxes() {
        if (!addonContainer) return;
        
        const addonData = [
            { value: 'additional-formats', price: 50, name: 'Additional formats', description: 'Adapt a larger cover format to a smaller one, such as from hardback to paperback or ebook to audiobook.' },
            { value: 'expanding-format', price: 100, name: 'Expanding format', description: 'Ebook to print or paperback to hardback adaptation. Fade to colour €50, reflective/blur €100, expanding the image €150.' },
            { value: 'elements-pack', price: 150, name: 'Elements pack', description: 'Individual elements rendered and saved as separate files. Up to 50 elements in 2 formats for use in marketing and merch.' }
        ];
        
        addonContainer.innerHTML = '';
        addonContainer.className = 'service-selector';
        
        addonData.forEach(data => {
            const label = document.createElement('label');
            label.className = 'service-option addon-option';
            label.setAttribute('data-addon-value', data.value);
            label.setAttribute('data-price', data.price);
            label.style.cursor = 'pointer';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'service-name';
            nameSpan.innerText = data.name;
            
            const descP = document.createElement('p');
            descP.className = 'small-body';
            descP.innerText = data.description;
            
            const priceP = document.createElement('p');
            priceP.innerText = `+€${data.price}`;
            
            label.appendChild(nameSpan);
            label.appendChild(descP);
            label.appendChild(priceP);
            
            addonContainer.appendChild(label);
        });
    }
    
    function getAddonOptions() {
        return document.querySelectorAll('#addonsSelector .addon-option');
    }
    
    function getSelectedAddonsTotal() {
        let total = 0;
        selectedAddons.forEach(addonValue => {
            const addonOption = Array.from(getAddonOptions()).find(opt => opt.getAttribute('data-addon-value') === addonValue);
            if (addonOption) {
                let price = parseInt(addonOption.getAttribute('data-price') || 0);
                // Special handling for expanding format - depends on adaptation type
                if (addonValue === 'expanding-format') {
                    const selectedType = document.querySelector('#coverDesignForm input[name="adaptationType"]:checked');
                    if (selectedType) {
                        const typePrice = parseInt(selectedType.getAttribute('data-price') || 0);
                        price = typePrice;
                    }
                }
                total += price;
            }
        });
        return total;
    }
    
    function getSelectedAddonsList() {
        const addons = [];
        selectedAddons.forEach(addonValue => {
            const addonOption = Array.from(getAddonOptions()).find(opt => opt.getAttribute('data-addon-value') === addonValue);
            if (addonOption) {
                const nameSpan = addonOption.querySelector('.service-name');
                let name = nameSpan ? nameSpan.innerText : addonValue;
                if (addonValue === 'expanding-format') {
                    const selectedType = document.querySelector('#coverDesignForm input[name="adaptationType"]:checked');
                    if (selectedType) {
                        const typeLabel = selectedType.closest('.service-option')?.querySelector('.service-name')?.innerText;
                        if (typeLabel) name = `${name} (${typeLabel})`;
                    }
                }
                addons.push(name);
            }
        });
        return addons;
    }
    
    function updateAddonVisuals() {
        const addonOptionsList = getAddonOptions();
        addonOptionsList.forEach(option => {
            const addonValue = option.getAttribute('data-addon-value');
            if (selectedAddons.has(addonValue)) {
                option.classList.add('selected');
                option.style.borderColor = 'var(--accent)';
                option.style.backgroundColor = 'rgba(190, 0, 44, 0.1)';
            } else {
                option.classList.remove('selected');
                option.style.borderColor = '';
                option.style.backgroundColor = '';
            }
        });
    }
    
    function updateAddonDetailsVisibility() {
        const isExpandingFormatSelected = selectedAddons.has('expanding-format');
        const isElementsPackSelected = selectedAddons.has('elements-pack');
        
        if (expandingFormatDetails) {
            expandingFormatDetails.style.display = isExpandingFormatSelected ? 'block' : 'none';
        }
        if (elementsPackDetails) {
            elementsPackDetails.style.display = (isElementsPackSelected && !isSpecialPackage()) ? 'block' : 'none';
        }
        updateTotalPrice();
    }
    
    function setupAddonToggle() {
        const addonOptionsList = getAddonOptions();
        addonOptionsList.forEach(option => {
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            const addonValue = newOption.getAttribute('data-addon-value');
            
            newOption.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const hasPackageSelected = document.querySelector('#coverDesignForm input[name="package"]:checked');
                if (!hasPackageSelected) {
                    alert('Please select a package first before choosing add-ons.');
                    return;
                }
                
                // If special package is selected, prevent any add-on selection
                if (isSpecialPackage()) {
                    alert('Add-ons are not available with the Typography only package.');
                    return;
                }
                
                if (selectedAddons.has(addonValue)) {
                    selectedAddons.delete(addonValue);
                } else {
                    selectedAddons.add(addonValue);
                }
                
                updateAddonVisuals();
                updateAddonDetailsVisibility();
                updateTotalPrice();
            });
        });
    }
    
    function updateAddonsAvailability() {
        const special = isSpecialPackage();
        const addonOptionsList = getAddonOptions();
        
        addonOptionsList.forEach(option => {
            if (special) {
                option.style.opacity = '0.5';
                option.style.cursor = 'not-allowed';
                option.style.pointerEvents = 'none';
            } else {
                option.style.opacity = '1';
                option.style.cursor = 'pointer';
                option.style.pointerEvents = 'auto';
            }
        });
        
        // Clear all selected addons if special package is selected
        if (special && selectedAddons.size > 0) {
            selectedAddons.clear();
            updateAddonVisuals();
            updateAddonDetailsVisibility();
        }
        
        updateTotalPrice();
    }
    
    function updateTotalPrice() {
        const selectedPackage = document.querySelector('#coverDesignForm input[name="package"]:checked');
        if (!selectedPackage) return;
        
        const basePrice = parseInt(selectedPackage.getAttribute('data-price')) || 0;
        const addonsTotal = getSelectedAddonsTotal();
        
        const sourceRadio = document.querySelector('#coverDesignForm input[name="sourceFiles"]:checked');
        const sourceFee = sourceRadio && sourceRadio.value === 'yes' ? 100 : 0;
        
        const total = basePrice + addonsTotal + sourceFee;
        
        const breakdownDiv = document.getElementById('priceBreakdown');
        if (breakdownDiv) {
            let packageDisplayName = getPackageDisplayName(selectedPackage.value);
            let breakdownHtml = `<p><strong>Package:</strong> ${packageDisplayName} – €${basePrice}</p>`;
            
            const addonsList = getSelectedAddonsList();
            if (addonsList.length > 0) {
                breakdownHtml += `<p><strong>Add-ons:</strong> ${addonsList.join(', ')} – +€${addonsTotal}</p>`;
            }
            
            if (sourceFee > 0) {
                breakdownHtml += `<p><strong>Source files:</strong> +€${sourceFee}</p>`;
            }
            
            breakdownHtml += `<hr>`;
            breakdownDiv.innerHTML = breakdownHtml;
        }
        
        const totalDisplay = document.getElementById('totalEstimateDisplay');
        if (totalDisplay) {
            totalDisplay.innerHTML = `Total Estimate: €${total}`;
        }
    }
    
    function getPackageDisplayName(packageValue) {
        const names = {
            'photo-based': 'Photo-based',
            'symbol-cover': 'Symbol cover',
            'character-cover': 'Character cover',
            'typography-only': 'Typography only'
        };
        return names[packageValue] || packageValue;
    }
    
    function isValidUrl(url) {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // Set up adaptation type price attributes
    function setupAdaptationTypePrices() {
        const adaptationTypes = [
            { value: 'fade-to-colour', price: 50 },
            { value: 'reflective-blur', price: 100 },
            { value: 'expanding-image', price: 150 }
        ];
        
        adaptationTypes.forEach(type => {
            const radio = document.querySelector(`#coverDesignForm input[name="adaptationType"][value="${type.value}"]`);
            if (radio) {
                radio.setAttribute('data-price', type.price);
            }
        });
        
        // Add change listener for adaptation type
        adaptationTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                updateTotalPrice();
            });
        });
    }
    
    // Event listeners
    packageRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateAddonsAvailability();
            updateTotalPrice();
        });
    });
    
    sourceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateTotalPrice();
        });
    });
    
    // Form validation with URL validation for all link fields
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
            alert('Please provide your email address so I can respond to your inquiry.');
            if (emailField) emailField.focus();
            return;
        }
        
        const nameField = document.getElementById('clientName');
        if (!nameField || !nameField.value.trim()) {
            e.preventDefault();
            alert('Please provide your name or pen name.');
            if (nameField) nameField.focus();
            return;
        }
        
        const packageSelected = document.querySelector('#coverDesignForm input[name="package"]:checked');
        if (!packageSelected) {
            e.preventDefault();
            alert('Please select a package before submitting.');
            return;
        }
        
        // Validate all link fields
        const linkFields = ['inspirationLinks', 'imageLinks'];
        for (const fieldId of linkFields) {
            const field = document.getElementById(fieldId);
            if (field && field.value && !isValidUrl(field.value)) {
                e.preventDefault();
                const fieldLabel = fieldId === 'inspirationLinks' ? 'Inspiration / Reference Links' : 'Stock image / Reference image links';
                alert(`Please enter a valid URL for ${fieldLabel}.`);
                field.focus();
                return;
            }
        }
        
        // Add hidden fields for selected addons
        if (selectedAddons.size > 0) {
            const addonsList = Array.from(selectedAddons).join(', ');
            let existingInput = form.querySelector('input[name="selected_addons"]');
            if (existingInput) existingInput.remove();
            const addonsInput = document.createElement('input');
            addonsInput.type = 'hidden';
            addonsInput.name = 'selected_addons';
            addonsInput.value = addonsList;
            form.appendChild(addonsInput);
        }
        
        // Add adaptation type if expanding format selected
        if (selectedAddons.has('expanding-format')) {
            const selectedType = document.querySelector('#coverDesignForm input[name="adaptationType"]:checked');
            if (selectedType) {
                let existingType = form.querySelector('input[name="adaptation_type"]');
                if (existingType) existingType.remove();
                const typeInput = document.createElement('input');
                typeInput.type = 'hidden';
                typeInput.name = 'adaptation_type';
                typeInput.value = selectedType.value;
                form.appendChild(typeInput);
            }
            
            const adaptationDetails = document.getElementById('adaptationDetails');
            if (adaptationDetails && adaptationDetails.value) {
                let existingDetails = form.querySelector('input[name="adaptation_details"]');
                if (existingDetails) existingDetails.remove();
                const detailsInput = document.createElement('input');
                detailsInput.type = 'hidden';
                detailsInput.name = 'adaptation_details';
                detailsInput.value = adaptationDetails.value;
                form.appendChild(detailsInput);
            }
        }
        
        // Add elements pack details if selected
        if (selectedAddons.has('elements-pack')) {
            const elementsDesc = document.getElementById('elementsDescription');
            if (elementsDesc && elementsDesc.value) {
                let existingDesc = form.querySelector('input[name="elements_description"]');
                if (existingDesc) existingDesc.remove();
                const descInput = document.createElement('input');
                descInput.type = 'hidden';
                descInput.name = 'elements_description';
                descInput.value = elementsDesc.value;
                form.appendChild(descInput);
            }
            
            const elementsFormats = document.getElementById('elementsFormats');
            if (elementsFormats && elementsFormats.value) {
                let existingFormats = form.querySelector('input[name="elements_formats"]');
                if (existingFormats) existingFormats.remove();
                const formatsInput = document.createElement('input');
                formatsInput.type = 'hidden';
                formatsInput.name = 'elements_formats';
                formatsInput.value = elementsFormats.value;
                form.appendChild(formatsInput);
            }
        }
    });
    
    // Initialize
    rebuildAddonsWithoutCheckboxes();
    setupAddonToggle();
    setupAdaptationTypePrices();
    updateAddonsAvailability();
    updateTotalPrice();
}

// ===== AUTHOR BRAND FORM =====
function initAuthorBrandForm() {
    const form = document.getElementById('authorBrandForm');
    if (!form) return;
    
    // DOM elements
    const packageRadios = document.querySelectorAll('#authorBrandForm input[name="package"]');
    const addonContainer = document.getElementById('addonsSelector');
    const sourceRadios = document.querySelectorAll('#authorBrandForm input[name="sourceFiles"]');
    const additionalPagesDetails = document.getElementById('additionalPagesDetails');
    const customWebsiteDetails = document.getElementById('customWebsiteDetails');
    const personalDomainField = document.getElementById('personalDomainField');
    const websiteContentSection = document.getElementById('websiteContentSection');
    const pageCountInput = document.getElementById('pageCount');
    const pageDescriptionsContainer = document.getElementById('pageDescriptionsContainer');
    const domainNameInput = document.getElementById('domainName');
    
    // Store selected addons
    let selectedAddons = new Set();
    
    // Helper: check if logo suite package is selected
    function isLogoSuitepackage() {
        const selectedPackage = document.querySelector('#authorBrandForm input[name="package"]:checked');
        if (!selectedPackage) return false;
        return selectedPackage.value === 'logo-suite';
    }
    
    // Helper: check if website package is selected (one-page or multi-page)
    function isWebsitePackage() {
        const selectedPackage = document.querySelector('#authorBrandForm input[name="package"]:checked');
        if (!selectedPackage) return false;
        return selectedPackage.value === 'one-page-website' || selectedPackage.value === 'multi-page-website';
    }
    
    // Generate dynamic page description fields (starting from page 2)
    function generatePageDescriptionFields() {
        if (!pageDescriptionsContainer) return;
        
        const pageCount = parseInt(pageCountInput.value) || 1;
        pageDescriptionsContainer.innerHTML = '';
        
        for (let i = 1; i <= pageCount; i++) {
            const pageNumber = i + 1; // Start from page 2
            const pageDiv = document.createElement('div');
            pageDiv.className = 'form-group';
            pageDiv.style.marginBottom = 'var(--md)';
            
            const label = document.createElement('label');
            label.setAttribute('for', `pageDescription_${pageNumber}`);
            label.innerText = `Page ${pageNumber} description / content`;
            
            const textarea = document.createElement('textarea');
            textarea.id = `pageDescription_${pageNumber}`;
            textarea.name = `page_description_${pageNumber}`;
            textarea.className = 'form-textarea';
            textarea.rows = 4;
            textarea.placeholder = `Describe what should be on this page. Examples: About the author, Book series page, Contact form, Events, Blog, etc.`;
            
            pageDiv.appendChild(label);
            pageDiv.appendChild(textarea);
            pageDescriptionsContainer.appendChild(pageDiv);
        }
        
        // Add note about content consultation
        const noteDiv = document.createElement('div');
        noteDiv.className = 'form-group';
        const noteSpan = document.createElement('span');
        noteSpan.className = 'form-note';
        noteSpan.innerHTML = 'If you don\'t have content or ideas yet, we can discuss this in detail. I can provide a flow/map/structure first to help guide you.';
        noteDiv.appendChild(noteSpan);
        pageDescriptionsContainer.appendChild(noteDiv);
    }
    
    // Rebuild add-ons without checkboxes - ensure stacked layout
    function rebuildAddonsWithoutCheckboxes() {
        if (!addonContainer) return;
        
        const addonData = [
            { value: 'logo-suite', price: 200, name: 'Logo suite', description: 'Logo with colour palette and basic fonts, delivered in multiple formats to start your visual identity. (For website packages)' },
            { value: 'additional-pages', price: 50, name: 'Additional pages', description: 'Extra pages following the layout of an already created website. Expand your site as your career grows.' },
            { value: 'completely-custom', price: 5000, name: 'Completely custom', description: 'Built from scratch with custom structure, layouts, and pages. Starting at €5,000. Unique colours and functions tailored to your vision.' }
        ];
        
        addonContainer.innerHTML = '';
        addonContainer.className = 'service-selector';
        
        addonData.forEach(data => {
            const label = document.createElement('label');
            label.className = 'service-option addon-option';
            label.setAttribute('data-addon-value', data.value);
            label.setAttribute('data-price', data.price);
            label.style.cursor = 'pointer';
            label.style.display = 'flex';
            label.style.flexDirection = 'column';
            label.style.alignItems = 'center';
            label.style.textAlign = 'center';
            label.style.justifyContent = 'center';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'service-name';
            nameSpan.innerText = data.name;
            
            const descP = document.createElement('p');
            descP.className = 'small-body';
            descP.innerText = data.description;
            
            const priceP = document.createElement('p');
            priceP.innerText = data.value === 'additional-pages' ? `+€${data.price} each` : `+€${data.price}`;
            
            label.appendChild(nameSpan);
            label.appendChild(descP);
            label.appendChild(priceP);
            
            addonContainer.appendChild(label);
        });
    }
    
    function getAddonOptions() {
        return document.querySelectorAll('#addonsSelector .addon-option');
    }
    
    function getSelectedAddonsTotal() {
        let total = 0;
        selectedAddons.forEach(addonValue => {
            const addonOption = Array.from(getAddonOptions()).find(opt => opt.getAttribute('data-addon-value') === addonValue);
            if (addonOption) {
                let price = parseInt(addonOption.getAttribute('data-price') || 0);
                if (addonValue === 'additional-pages' && pageCountInput) {
                    const pageCount = parseInt(pageCountInput.value) || 1;
                    price = price * pageCount;
                }
                total += price;
            }
        });
        return total;
    }
    
    function getSelectedAddonsList() {
        const addons = [];
        selectedAddons.forEach(addonValue => {
            const addonOption = Array.from(getAddonOptions()).find(opt => opt.getAttribute('data-addon-value') === addonValue);
            if (addonOption) {
                const nameSpan = addonOption.querySelector('.service-name');
                let name = nameSpan ? nameSpan.innerText : addonValue;
                if (addonValue === 'additional-pages' && pageCountInput) {
                    const pageCount = parseInt(pageCountInput.value) || 1;
                    name = `${name} (${pageCount} page${pageCount > 1 ? 's' : ''})`;
                }
                addons.push(name);
            }
        });
        return addons;
    }
    
    function updateAddonVisuals() {
        const addonOptionsList = getAddonOptions();
        addonOptionsList.forEach(option => {
            const addonValue = option.getAttribute('data-addon-value');
            if (selectedAddons.has(addonValue)) {
                option.classList.add('selected');
                option.style.borderColor = 'var(--accent)';
                option.style.backgroundColor = 'rgba(190, 0, 44, 0.1)';
            } else {
                option.classList.remove('selected');
                option.style.borderColor = '';
                option.style.backgroundColor = '';
            }
        });
    }
    
    function updateAddonDetailsVisibility() {
        const isAdditionalPagesSelected = selectedAddons.has('additional-pages');
        const isCustomSelected = selectedAddons.has('completely-custom');
        const isWebsite = isWebsitePackage();
        
        if (additionalPagesDetails) {
            additionalPagesDetails.style.display = isAdditionalPagesSelected ? 'block' : 'none';
            if (isAdditionalPagesSelected) {
                generatePageDescriptionFields();
            }
        }
        if (customWebsiteDetails) {
            customWebsiteDetails.style.display = isCustomSelected ? 'block' : 'none';
        }
        if (websiteContentSection) {
            websiteContentSection.style.display = isWebsite ? 'block' : 'none';
        }
        if (personalDomainField) {
            personalDomainField.style.display = isWebsite ? 'block' : 'none';
        }
        updateTotalPrice();
    }
    
    function setupAddonToggle() {
        const addonOptionsList = getAddonOptions();
        addonOptionsList.forEach(option => {
            const newOption = option.cloneNode(true);
            option.parentNode.replaceChild(newOption, option);
            
            const addonValue = newOption.getAttribute('data-addon-value');
            
            newOption.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const hasPackageSelected = document.querySelector('#authorBrandForm input[name="package"]:checked');
                if (!hasPackageSelected) {
                    alert('Please select a package first before choosing add-ons.');
                    return;
                }
                
                // Logo suite package - no add-ons allowed
                if (isLogoSuitepackage()) {
                    alert('Add-ons are not available with the Logo suite package.');
                    return;
                }
                
                // For completely custom, clear all other selections and show note
                if (!selectedAddons.has(addonValue) && addonValue === 'completely-custom') {
                    // Clear all other addons if completely custom is being selected
                    if (selectedAddons.size > 0) {
                        selectedAddons.clear();
                        updateAddonVisuals();
                    }
                    // Regular alert with normal styling - removed the custom transparent styling
                    alert('Completely custom websites start at €5,000. After submitting this form, I will reach out to schedule a detailed consultation to discuss your specific needs and provide an accurate quote.');
                    selectedAddons.add(addonValue);
                } 
                // If selecting something else while completely custom is selected, prevent it
                else if (selectedAddons.has('completely-custom') && addonValue !== 'completely-custom') {
                    alert('Please deselect Completely custom first if you want to add other add-ons.');
                    return;
                }
                else {
                    if (selectedAddons.has(addonValue)) {
                        selectedAddons.delete(addonValue);
                    } else {
                        selectedAddons.add(addonValue);
                    }
                }
                
                updateAddonVisuals();
                updateAddonDetailsVisibility();
                updateTotalPrice();
            });
        });
    }
    
    function updateAddonsAvailability() {
        const isLogoSuite = isLogoSuitepackage();
        const isWebsite = isWebsitePackage();
        const addonOptionsList = getAddonOptions();
        
        addonOptionsList.forEach(option => {
            const addonValue = option.getAttribute('data-addon-value');
            
            // Logo suite package - no add-ons
            if (isLogoSuite) {
                option.style.opacity = '0.5';
                option.style.cursor = 'not-allowed';
                option.style.pointerEvents = 'none';
            }
            // Website packages - logo suite add-on becomes visible
            else if (isWebsite && addonValue === 'logo-suite') {
                option.style.opacity = '1';
                option.style.cursor = 'pointer';
                option.style.pointerEvents = 'auto';
                option.style.display = 'flex';
            }
            // Hide logo suite add-on for non-website packages
            else if (!isWebsite && addonValue === 'logo-suite') {
                option.style.display = 'none';
            }
            // All other add-ons available for non-logo-suite packages
            else {
                option.style.opacity = '1';
                option.style.cursor = 'pointer';
                option.style.pointerEvents = 'auto';
                option.style.display = 'flex';
            }
        });
        
        // Clear all addons if logo suite package is selected
        if (isLogoSuite && selectedAddons.size > 0) {
            selectedAddons.clear();
            updateAddonVisuals();
            updateAddonDetailsVisibility();
        }
        
        updateTotalPrice();
    }
    
    function updateTotalPrice() {
        const selectedPackage = document.querySelector('#authorBrandForm input[name="package"]:checked');
        if (!selectedPackage) return;
        
        let basePrice = parseInt(selectedPackage.getAttribute('data-price')) || 0;
        const addonsTotal = getSelectedAddonsTotal();
        
        // If completely custom is selected, remove the package price (replace with custom price)
        let effectiveBasePrice = basePrice;
        let customOverride = false;
        
        if (selectedAddons.has('completely-custom')) {
            // When completely custom is selected, the base price is replaced by the custom add-on
            // The package is effectively replaced, so we only show the custom price
            effectiveBasePrice = 0;
            customOverride = true;
        }
        
        // Add personal domain fee if website is selected and domain name is entered
        let personalDomainFee = 0;
        if (isWebsitePackage() && domainNameInput && domainNameInput.value.trim()) {
            personalDomainFee = 100;
        }
        
        const sourceRadio = document.querySelector('#authorBrandForm input[name="sourceFiles"]:checked');
        const sourceFee = sourceRadio && sourceRadio.value === 'yes' ? 100 : 0;
        
        const total = effectiveBasePrice + addonsTotal + personalDomainFee + sourceFee;
        
        const breakdownDiv = document.getElementById('priceBreakdown');
        if (breakdownDiv) {
            let packageDisplayName = getPackageDisplayName(selectedPackage.value);
            let breakdownHtml = '';
            
            if (customOverride) {
                // Show that custom replaces the package
                breakdownHtml = `<p><strong>Package replaced with:</strong> Completely custom website – €${addonsTotal}</p>`;
            } else {
                breakdownHtml = `<p><strong>Package:</strong> ${packageDisplayName} – €${basePrice}</p>`;
                
                const addonsList = getSelectedAddonsList();
                if (addonsList.length > 0 && !isLogoSuitepackage()) {
                    const nonCustomAddons = addonsList.filter(a => a !== 'Completely custom');
                    if (nonCustomAddons.length > 0) {
                        breakdownHtml += `<p><strong>Add-ons:</strong> ${nonCustomAddons.join(', ')} – +€${addonsTotal}</p>`;
                    }
                }
            }
            
            if (personalDomainFee > 0) {
                breakdownHtml += `<p><strong>Personal domain:</strong> ${domainNameInput.value}.khaosbooks.com – +€100</p>`;
            }
            
            if (sourceFee > 0) {
                breakdownHtml += `<p><strong>Source files (HTML, CSS, JS, design files):</strong> +€${sourceFee}</p>`;
            }
            
            breakdownHtml += `<hr>`;
            breakdownDiv.innerHTML = breakdownHtml;
        }
        
        const totalDisplay = document.getElementById('totalEstimateDisplay');
        if (totalDisplay) {
            if (selectedAddons.has('completely-custom')) {
                totalDisplay.innerHTML = `Total Estimate: €${total}`;
                const formNote = document.querySelector('#priceSummarySection .form-note');
                if (formNote) {
                    formNote.innerHTML = '*Final price confirmed after consultation. Completely custom websites require a detailed discussion for accurate pricing.';
                }
            } else {
                totalDisplay.innerHTML = `Total Estimate: €${total}`;
            }
        }
    }
    
    function getPackageDisplayName(packageValue) {
        const names = {
            'logo-suite': 'Logo suite',
            'one-page-website': 'One-page website',
            'multi-page-website': 'Multi-page website'
        };
        return names[packageValue] || packageValue;
    }
    
    function isValidUrl(url) {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    function isValidDomainName(domain) {
        if (!domain) return true;
        const domainRegex = /^[a-z0-9-]+$/;
        return domainRegex.test(domain);
    }
    
    // Event listeners
    if (pageCountInput) {
        pageCountInput.addEventListener('change', function() {
            if (this.value < 1) this.value = 1;
            generatePageDescriptionFields();
            updateTotalPrice();
        });
    }
    
    if (domainNameInput) {
        domainNameInput.addEventListener('input', function() {
            let value = this.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
            this.value = value;
            updateTotalPrice();
        });
    }
    
    packageRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateAddonsAvailability();
            updateTotalPrice();
        });
    });
    
    sourceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateTotalPrice();
        });
    });
    
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
            alert('Please provide your email address so I can respond to your inquiry.');
            if (emailField) emailField.focus();
            return;
        }
        
        const authorNameField = document.getElementById('authorName');
        if (!authorNameField || !authorNameField.value.trim()) {
            e.preventDefault();
            alert('Please provide your author name or pen name.');
            if (authorNameField) authorNameField.focus();
            return;
        }
        
        const packageSelected = document.querySelector('#authorBrandForm input[name="package"]:checked');
        if (!packageSelected) {
            e.preventDefault();
            alert('Please select a package before submitting.');
            return;
        }
        
        // Validate domain name if website package selected and domain entered
        if (isWebsitePackage() && domainNameInput && domainNameInput.value.trim()) {
            if (!isValidDomainName(domainNameInput.value.trim())) {
                e.preventDefault();
                alert('Domain name can only contain lowercase letters, numbers, and hyphens. No spaces or special characters.');
                if (domainNameInput) domainNameInput.focus();
                return;
            }
        }
        
        // Validate all link fields
        const linkFields = ['currentWebsite', 'inspirationLinks', 'existingMaterials', 'customInspiration'];
        for (const fieldId of linkFields) {
            const field = document.getElementById(fieldId);
            if (field && field.value && !isValidUrl(field.value)) {
                e.preventDefault();
                const fieldLabels = {
                    'currentWebsite': 'Current website',
                    'inspirationLinks': 'Inspiration / Reference Links',
                    'existingMaterials': 'Existing brand materials links',
                    'customInspiration': 'Custom website inspiration / examples'
                };
                alert(`Please enter a valid URL for ${fieldLabels[fieldId] || fieldId}.`);
                field.focus();
                return;
            }
        }
        
        // Add hidden fields for selected addons
        if (selectedAddons.size > 0) {
            const addonsList = Array.from(selectedAddons).join(', ');
            let existingInput = form.querySelector('input[name="selected_addons"]');
            if (existingInput) existingInput.remove();
            const addonsInput = document.createElement('input');
            addonsInput.type = 'hidden';
            addonsInput.name = 'selected_addons';
            addonsInput.value = addonsList;
            form.appendChild(addonsInput);
        }
        
        // Add personal domain if website package selected and domain entered
        if (isWebsitePackage() && domainNameInput && domainNameInput.value.trim()) {
            let existingDomain = form.querySelector('input[name="personal_domain"]');
            if (existingDomain) existingDomain.remove();
            const domainInput = document.createElement('input');
            domainInput.type = 'hidden';
            domainInput.name = 'personal_domain';
            domainInput.value = domainNameInput.value;
            form.appendChild(domainInput);
        }
        
        // Add additional pages details if selected
        if (selectedAddons.has('additional-pages')) {
            const pageCount = pageCountInput ? pageCountInput.value : 1;
            let existingCount = form.querySelector('input[name="additional_pages_count"]');
            if (existingCount) existingCount.remove();
            const countInput = document.createElement('input');
            countInput.type = 'hidden';
            countInput.name = 'additional_pages_count';
            countInput.value = pageCount;
            form.appendChild(countInput);
            
            // Collect all page descriptions (starting from page 2)
            const pageDescriptions = [];
            for (let i = 1; i <= pageCount; i++) {
                const pageNumber = i + 1;
                const pageDesc = document.getElementById(`pageDescription_${pageNumber}`);
                if (pageDesc && pageDesc.value) {
                    pageDescriptions.push(`Page ${pageNumber}: ${pageDesc.value}`);
                }
            }
            if (pageDescriptions.length > 0) {
                let existingDesc = form.querySelector('input[name="additional_pages_descriptions"]');
                if (existingDesc) existingDesc.remove();
                const descInput = document.createElement('input');
                descInput.type = 'hidden';
                descInput.name = 'additional_pages_descriptions';
                descInput.value = pageDescriptions.join(' | ');
                form.appendChild(descInput);
            }
        }
        
        // Add homepage content if website package
        if (isWebsitePackage()) {
            const homepageContent = document.getElementById('homepageContent');
            if (homepageContent && homepageContent.value) {
                let existingContent = form.querySelector('input[name="homepage_content"]');
                if (existingContent) existingContent.remove();
                const contentInput = document.createElement('input');
                contentInput.type = 'hidden';
                contentInput.name = 'homepage_content';
                contentInput.value = homepageContent.value;
                form.appendChild(contentInput);
            }
        }
        
        // Add custom website details if selected
        if (selectedAddons.has('completely-custom')) {
            const customFeatures = document.getElementById('customFeatures');
            if (customFeatures && customFeatures.value) {
                let existingFeatures = form.querySelector('input[name="custom_features"]');
                if (existingFeatures) existingFeatures.remove();
                const featuresInput = document.createElement('input');
                featuresInput.type = 'hidden';
                featuresInput.name = 'custom_features';
                featuresInput.value = customFeatures.value;
                form.appendChild(featuresInput);
            }
            
            const customInspiration = document.getElementById('customInspiration');
            if (customInspiration && customInspiration.value) {
                let existingInspiration = form.querySelector('input[name="custom_inspiration"]');
                if (existingInspiration) existingInspiration.remove();
                const inspirationInput = document.createElement('input');
                inspirationInput.type = 'hidden';
                inspirationInput.name = 'custom_inspiration';
                inspirationInput.value = customInspiration.value;
                form.appendChild(inspirationInput);
            }
            
            const customBudget = document.getElementById('customBudget');
            if (customBudget && customBudget.value) {
                let existingBudget = form.querySelector('input[name="custom_budget"]');
                if (existingBudget) existingBudget.remove();
                const budgetInput = document.createElement('input');
                budgetInput.type = 'hidden';
                budgetInput.name = 'custom_budget';
                budgetInput.value = customBudget.value;
                form.appendChild(budgetInput);
            }
        }
    });
    
    // Initialize
    rebuildAddonsWithoutCheckboxes();
    setupAddonToggle();
    updateAddonsAvailability();
    updateTotalPrice();
}

// ===== PUBLISHER SERVICES FORM =====
function initPublisherForm() {
    const form = document.getElementById('publisherForm');
    if (!form) return;
    
    // DOM elements
    const packageRadios = document.querySelectorAll('#publisherForm input[name="package"]');
    const publisherLogoCheckbox = document.getElementById('publisherLogo');
    const sourceRadios = document.querySelectorAll('#publisherForm input[name="sourceFiles"]');
    const mockupPackDetails = document.getElementById('mockupPackDetails');
    const socialMediaPackDetails = document.getElementById('socialMediaPackDetails');
    const shopFeatureDetails = document.getElementById('shopFeatureDetails');
    
    // Update package details visibility based on selected package
    function updatePackageDetailsVisibility() {
        const selectedPackage = document.querySelector('#publisherForm input[name="package"]:checked');
        
        if (mockupPackDetails) {
            mockupPackDetails.style.display = (selectedPackage && selectedPackage.value === 'mockup-pack') ? 'block' : 'none';
        }
        if (socialMediaPackDetails) {
            socialMediaPackDetails.style.display = (selectedPackage && selectedPackage.value === 'social-media-pack') ? 'block' : 'none';
        }
        if (shopFeatureDetails) {
            shopFeatureDetails.style.display = (selectedPackage && selectedPackage.value === 'shop-feature') ? 'block' : 'none';
        }
    }
    
    // Update total price with discount and source files
    function updateTotalPrice() {
        const selectedPackage = document.querySelector('#publisherForm input[name="package"]:checked');
        if (!selectedPackage) return;
        
        let basePrice = parseInt(selectedPackage.getAttribute('data-price')) || 0;
        const discountApplied = publisherLogoCheckbox && publisherLogoCheckbox.checked;
        
        const sourceRadio = document.querySelector('#publisherForm input[name="sourceFiles"]:checked');
        const sourceFee = sourceRadio && sourceRadio.value === 'yes' ? 50 : 0;
        
        let discountAmount = 0;
        let priceAfterDiscount = basePrice;
        
        if (discountApplied) {
            discountAmount = Math.round(basePrice * 0.1);
            priceAfterDiscount = basePrice - discountAmount;
        }
        
        const finalPrice = priceAfterDiscount + sourceFee;
        
        const breakdownDiv = document.getElementById('priceBreakdown');
        if (breakdownDiv) {
            let packageDisplayName = getPackageDisplayName(selectedPackage.value);
            let breakdownHtml = `<p><strong>Package:</strong> ${packageDisplayName} – €${basePrice}</p>`;
            
            if (discountApplied) {
                breakdownHtml += `<p><strong>Publisher logo discount (10%):</strong> –€${discountAmount}</p>`;
            }
            
            if (sourceFee > 0) {
                breakdownHtml += `<p><strong>Source files:</strong> +€${sourceFee}</p>`;
            }
            
            breakdownHtml += `<hr>`;
            breakdownDiv.innerHTML = breakdownHtml;
        }
        
        const totalDisplay = document.getElementById('totalEstimateDisplay');
        if (totalDisplay) {
            totalDisplay.innerHTML = `Total Estimate: €${finalPrice}`;
        }
    }
    
    function getPackageDisplayName(packageValue) {
        const names = {
            'mockup-pack': 'Mockup pack',
            'social-media-pack': 'Social media pack',
            'shop-feature': 'Shop feature'
        };
        return names[packageValue] || packageValue;
    }
    
    function isValidUrl(url) {
        if (!url) return true;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // Event listeners
    packageRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updatePackageDetailsVisibility();
            updateTotalPrice();
        });
    });
    
    if (publisherLogoCheckbox) {
        publisherLogoCheckbox.addEventListener('change', function() {
            updateTotalPrice();
        });
    }
    
    sourceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateTotalPrice();
        });
    });
    
    // Form validation
    form.addEventListener('submit', function(e) {
        const termsCheckbox = document.getElementById('termsAgreement');
        if (!termsCheckbox || !termsCheckbox.checked) {
            e.preventDefault();
            alert('Please agree to the terms before submitting.');
            if (termsCheckbox) termsCheckbox.focus();
            return;
        }
        
        const emailField = document.getElementById('clientEmail');
        if (!emailField || !emailField.value.trim()) {
            e.preventDefault();
            alert('Please provide your email address so I can respond to your inquiry.');
            if (emailField) emailField.focus();
            return;
        }
        
        const bookTitleField = document.getElementById('bookTitle');
        if (!bookTitleField || !bookTitleField.value.trim()) {
            e.preventDefault();
            alert('Please provide your book title.');
            if (bookTitleField) bookTitleField.focus();
            return;
        }
        
        const coverLinkField = document.getElementById('coverLink');
        if (!coverLinkField || !coverLinkField.value.trim()) {
            e.preventDefault();
            alert('Please provide a link to your cover file.');
            if (coverLinkField) coverLinkField.focus();
            return;
        }
        
        if (!isValidUrl(coverLinkField.value)) {
            e.preventDefault();
            alert('Please enter a valid URL for your cover file link.');
            coverLinkField.focus();
            return;
        }
        
        const packageSelected = document.querySelector('#publisherForm input[name="package"]:checked');
        if (!packageSelected) {
            e.preventDefault();
            alert('Please select a package before submitting.');
            return;
        }
        
        // Validate inspiration links
        const inspirationLinks = document.getElementById('inspirationLinks');
        if (inspirationLinks && inspirationLinks.value && !isValidUrl(inspirationLinks.value)) {
            e.preventDefault();
            alert('Please enter a valid URL for inspiration links.');
            inspirationLinks.focus();
            return;
        }
        
        // Validate buy link for shop feature
        if (packageSelected.value === 'shop-feature') {
            const buyLink = document.getElementById('buyLink');
            if (buyLink && buyLink.value && !isValidUrl(buyLink.value)) {
                e.preventDefault();
                alert('Please enter a valid URL for your purchase link.');
                buyLink.focus();
                return;
            }
        }
        
        // Add discount info
        if (publisherLogoCheckbox && publisherLogoCheckbox.checked) {
            let existingInput = form.querySelector('input[name="publisher_logo_discount"]');
            if (existingInput) existingInput.remove();
            const discountInput = document.createElement('input');
            discountInput.type = 'hidden';
            discountInput.name = 'publisher_logo_discount';
            discountInput.value = 'applied';
            form.appendChild(discountInput);
        }
        
        // Add source files info
        const sourceRadio = document.querySelector('#publisherForm input[name="sourceFiles"]:checked');
        if (sourceRadio && sourceRadio.value === 'yes') {
            let existingInput = form.querySelector('input[name="source_files"]');
            if (existingInput) existingInput.remove();
            const sourceInput = document.createElement('input');
            sourceInput.type = 'hidden';
            sourceInput.name = 'source_files';
            sourceInput.value = 'yes';
            form.appendChild(sourceInput);
        }
        
        // Add mockup pack details if selected
        if (packageSelected.value === 'mockup-pack') {
            const mockupType = document.querySelector('#publisherForm input[name="mockupType"]:checked');
            if (mockupType) {
                let existingType = form.querySelector('input[name="mockup_type"]');
                if (existingType) existingType.remove();
                const typeInput = document.createElement('input');
                typeInput.type = 'hidden';
                typeInput.name = 'mockup_type';
                typeInput.value = mockupType.value;
                form.appendChild(typeInput);
            }
            
            const mockupBackground = document.getElementById('mockupBackground');
            if (mockupBackground && mockupBackground.value) {
                let existingBg = form.querySelector('input[name="mockup_background"]');
                if (existingBg) existingBg.remove();
                const bgInput = document.createElement('input');
                bgInput.type = 'hidden';
                bgInput.name = 'mockup_background';
                bgInput.value = mockupBackground.value;
                form.appendChild(bgInput);
            }
            
            const mockupNotes = document.getElementById('mockupNotes');
            if (mockupNotes && mockupNotes.value) {
                let existingNotes = form.querySelector('input[name="mockup_notes"]');
                if (existingNotes) existingNotes.remove();
                const notesInput = document.createElement('input');
                notesInput.type = 'hidden';
                notesInput.name = 'mockup_notes';
                notesInput.value = mockupNotes.value;
                form.appendChild(notesInput);
            }
        }
        
        // Add social media pack details if selected
        if (packageSelected.value === 'social-media-pack') {
            const socialPlatforms = document.getElementById('socialPlatforms');
            if (socialPlatforms && socialPlatforms.value) {
                let existingPlatforms = form.querySelector('input[name="social_platforms"]');
                if (existingPlatforms) existingPlatforms.remove();
                const platformsInput = document.createElement('input');
                platformsInput.type = 'hidden';
                platformsInput.name = 'social_platforms';
                platformsInput.value = socialPlatforms.value;
                form.appendChild(platformsInput);
            }
            
            const trailerText = document.getElementById('trailerText');
            if (trailerText && trailerText.value) {
                let existingText = form.querySelector('input[name="trailer_text"]');
                if (existingText) existingText.remove();
                const textInput = document.createElement('input');
                textInput.type = 'hidden';
                textInput.name = 'trailer_text';
                textInput.value = trailerText.value;
                form.appendChild(textInput);
            }
            
            const arcBannerText = document.getElementById('arcBannerText');
            if (arcBannerText && arcBannerText.value) {
                let existingBanner = form.querySelector('input[name="arc_banner_text"]');
                if (existingBanner) existingBanner.remove();
                const bannerInput = document.createElement('input');
                bannerInput.type = 'hidden';
                bannerInput.name = 'arc_banner_text';
                bannerInput.value = arcBannerText.value;
                form.appendChild(bannerInput);
            }
            
            const socialNotes = document.getElementById('socialNotes');
            if (socialNotes && socialNotes.value) {
                let existingNotes = form.querySelector('input[name="social_notes"]');
                if (existingNotes) existingNotes.remove();
                const notesInput = document.createElement('input');
                notesInput.type = 'hidden';
                notesInput.name = 'social_notes';
                notesInput.value = socialNotes.value;
                form.appendChild(notesInput);
            }
        }
        
        // Add shop feature details if selected
        if (packageSelected.value === 'shop-feature') {
            const featuredText = document.getElementById('featuredText');
            if (featuredText && featuredText.value) {
                let existingText = form.querySelector('input[name="featured_text"]');
                if (existingText) existingText.remove();
                const textInput = document.createElement('input');
                textInput.type = 'hidden';
                textInput.name = 'featured_text';
                textInput.value = featuredText.value;
                form.appendChild(textInput);
            }
            
            const bookBlurb = document.getElementById('bookBlurb');
            if (bookBlurb && bookBlurb.value) {
                let existingBlurb = form.querySelector('input[name="book_blurb"]');
                if (existingBlurb) existingBlurb.remove();
                const blurbInput = document.createElement('input');
                blurbInput.type = 'hidden';
                blurbInput.name = 'book_blurb';
                blurbInput.value = bookBlurb.value;
                form.appendChild(blurbInput);
            }
            
            const buyLink = document.getElementById('buyLink');
            if (buyLink && buyLink.value) {
                let existingLink = form.querySelector('input[name="buy_link"]');
                if (existingLink) existingLink.remove();
                const linkInput = document.createElement('input');
                linkInput.type = 'hidden';
                linkInput.name = 'buy_link';
                linkInput.value = buyLink.value;
                form.appendChild(linkInput);
            }
            
            const featureNotes = document.getElementById('featureNotes');
            if (featureNotes && featureNotes.value) {
                let existingNotes = form.querySelector('input[name="feature_notes"]');
                if (existingNotes) existingNotes.remove();
                const notesInput = document.createElement('input');
                notesInput.type = 'hidden';
                notesInput.name = 'feature_notes';
                notesInput.value = featureNotes.value;
                form.appendChild(notesInput);
            }
        }
    });
    
    // Initialize
    updatePackageDetailsVisibility();
    updateTotalPrice();
}