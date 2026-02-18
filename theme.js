// Gestion du thème clair/sombre
(function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    const html = document.documentElement;
    
    // Vérifier si un thème est stocké, sinon utiliser le mode sombre par défaut
    const savedTheme = localStorage.getItem('theme');
    const currentTheme = savedTheme || 'dark';
    
    // Appliquer le thème au chargement
    html.setAttribute('data-theme', currentTheme);
    updateIcon(currentTheme);
    
    // Écouter les clics sur le bouton
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon(newTheme);
    });
    
    // Mettre à jour l'icône selon le thème
    function updateIcon(theme) {
        if (theme === 'dark') {
            themeIcon.textContent = '🌙'; // Lune pour mode sombre actif
        } else {
            themeIcon.textContent = '☀️'; // Soleil pour mode clair actif
        }
    }
})();