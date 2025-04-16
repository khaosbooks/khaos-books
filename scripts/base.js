document.getElementById('custom-newsletter-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const form = this;
    const successMsg = document.getElementById('form-success');
    
    // First trigger MailerLite's native submission
    if (typeof ml_account !== 'undefined') {
        ml_account('webforms', '1455211', 'dZ4kMi', 'submit');
    }
    
    // Then do our custom handling
    fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            form.style.display = 'none';
            successMsg.style.display = 'block';
            form.reset();
            
            // Show success tracking
            if (typeof ml_account !== 'undefined') {
                ml_account('webforms', '1455211', 'dZ4kMi', 'show');
            }
        } else {
            throw new Error('Network response was not ok');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback: Submit form normally if JS fails
        form.removeEventListener('submit');
        form.submit();
    });
});