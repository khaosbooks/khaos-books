// Wait for MailerLite to load
function waitForML() {
    if (typeof ml_account === 'undefined') {
        setTimeout(waitForML, 100);
    } else {
        initForm();
    }
}

function initForm() {
    const form = document.getElementById('custom-newsletter-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Trigger MailerLite's native processing FIRST
        ml_account('webforms', '1455211', form.dataset.code, 'submit');
        
        // Then handle UI changes
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
            if (response.ok) {
                form.style.display = 'none';
                document.getElementById('form-success').style.display = 'block';
                ml_account('webforms', '1455211', form.dataset.code, 'show');
            }
        })
        .catch(() => {
            // Fallback: Submit normally if fetch fails
            form.submit();
        });
    });
}

// Start the process
waitForML();