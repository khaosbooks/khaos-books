// ===== HEAD CONTENT =====
function loadHeadContent() {
    const headContent = `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Forum&family=Jost:wght@400;500;700&display=swap" rel="stylesheet">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="styles/base.css">
        <style type="text/css">@import url("https://assets.mlcdn.com/fonts.css?version=1744283");</style>
    `;
    document.head.insertAdjacentHTML('beforeend', headContent);
    injectFavicons();
}

// ===== FAVICONS =====
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

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadHeadContent();
    loadComponents();
});


// ===== HIDE CTA TEXT ON FORM SUBMIT
document.addEventListener('ml-subscribe-event', function(event) {
    if (event.detail.formId === '24885190') { // Your form ID
        const introText = document.getElementById('formIntroText');
        if (introText) introText.style.display = 'none';
    }
});