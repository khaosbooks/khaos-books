// MailerLite Form Submission
document.getElementById('custom-newsletter-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const form = this;
    const successMsg = document.getElementById('form-success');
    
    // Submit to MailerLite
    fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // Hide form and show success
            form.style.display = 'none';
            successMsg.style.display = 'block';
            form.reset();
            
            // Trigger MailerLite tracking
            if (typeof ml_account !== 'undefined') {
                ml_account('webforms', '1455211', 'dZ4kMi', 'show');
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Initialize MailerLite (keep this at bottom of file)
(function(w,d,e,u,f,l,n){
    w[f]=w[f]||function(){(w[f].q=w[f].q||[]).push(arguments);};
    l=d.createElement(e);l.async=1;l.src=u;
    n=d.getElementsByTagName(e)[0];n.parentNode.insertBefore(l,n);
})(window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
ml('account', '1455211');