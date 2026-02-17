// Configuration Twitch OAuth
const CONFIG = {
    clientId: 'YOUR_TWITCH_CLIENT_ID', // À remplacer par votre Client ID
    redirectUri: window.location.origin + window.location.pathname.replace(/\/$/, '') + '/',
    scopes: ['channel:read:hype_train'],
    apiBaseUrl: 'https://api.twitch.tv/helix'
};

// Classe pour gérer l'authentification Twitch
class TwitchAuth {
    constructor() {
        this.accessToken = null;
        this.userId = null;
        this.userInfo = null;
    }

    // Vérifie si l'utilisateur est connecté
    isAuthenticated() {
        return this.accessToken !== null;
    }

    // Lance le processus d'authentification OAuth
    login() {
        const params = new URLSearchParams({
            client_id: CONFIG.clientId,
            redirect_uri: CONFIG.redirectUri,
            response_type: 'token',
            scope: CONFIG.scopes.join(' ')
        });
        
        console.log('Redirect URI:', CONFIG.redirectUri);
        console.log('OAuth URL:', `https://id.twitch.tv/oauth2/authorize?${params.toString()}`);
        
        window.location.href = `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
    }

    // Récupère le token depuis l'URL après redirection
    handleCallback() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const accessToken = params.get('access_token');
        if (accessToken) {
            this.accessToken = accessToken;
            localStorage.setItem('twitch_access_token', accessToken);
            
            // Nettoie l'URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
        }
        
        // Tente de récupérer depuis le localStorage
        const storedToken = localStorage.getItem('twitch_access_token');
        if (storedToken) {
            this.accessToken = storedToken;
            return true;
        }
        
        return false;
    }

    // Valide le token et récupère les informations utilisateur
    async validateToken() {
        if (!this.accessToken) return false;

        try {
            const response = await fetch('https://id.twitch.tv/oauth2/validate', {
                headers: {
                    'Authorization': `OAuth ${this.accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Token invalide');
            }

            const data = await response.json();
            this.userId = data.user_id;
            return true;
        } catch (error) {
            console.error('Erreur de validation du token:', error);
            this.logout();
            return false;
        }
    }

    // Récupère les informations de l'utilisateur connecté
    async getUserInfo() {
        if (!this.accessToken || !this.userId) return null;

        try {
            const response = await fetch(`${CONFIG.apiBaseUrl}/users?id=${this.userId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Client-Id': CONFIG.clientId
                }
            });

            if (!response.ok) {
                throw new Error('Impossible de récupérer les informations utilisateur');
            }

            const data = await response.json();
            this.userInfo = data.data[0];
            return this.userInfo;
        } catch (error) {
            console.error('Erreur lors de la récupération des infos utilisateur:', error);
            return null;
        }
    }

    // Déconnexion et nettoyage
    logout() {
        this.accessToken = null;
        this.userId = null;
        this.userInfo = null;
        localStorage.removeItem('twitch_access_token');
        sessionStorage.clear();
        window.location.reload();
    }
}

// Classe pour gérer les appels API Hype Train
class HypeTrainAPI {
    constructor(auth) {
        this.auth = auth;
    }

    // Récupère le statut du Hype Train (nouvel endpoint)
    async getHypeTrainStatus() {
        if (!this.auth.isAuthenticated() || !this.auth.userId) {
            throw new Error('Non authentifié');
        }

        try {
            const response = await fetch(
                `${CONFIG.apiBaseUrl}/hypetrain/status?broadcaster_id=${this.auth.userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.auth.accessToken}`,
                        'Client-Id': CONFIG.clientId
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur API');
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération du Hype Train:', error);
            throw error;
        }
    }
}

// Classe pour gérer l'interface utilisateur
class UI {
    constructor() {
        this.elements = {
            loginSection: document.getElementById('login-section'),
            userSection: document.getElementById('user-section'),
            currentTrainSection: document.getElementById('current-train-section'),
            recordsSection: document.getElementById('records-section'),
            errorSection: document.getElementById('error-section'),
            loadingSection: document.getElementById('loading-section'),
            loginBtn: document.getElementById('login-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            userAvatar: document.getElementById('user-avatar'),
            userName: document.getElementById('user-name'),
            userLogin: document.getElementById('user-login'),
            currentTrainContent: document.getElementById('current-train-content'),
            allTimeHigh: document.getElementById('all-time-high'),
            allTimeHighDate: document.getElementById('all-time-high-date'),
            sharedAllTimeHigh: document.getElementById('shared-all-time-high'),
            sharedAllTimeHighDate: document.getElementById('shared-all-time-high-date'),
            errorMessage: document.getElementById('error-message')
        };
    }

    // Affiche la section de connexion
    showLoginSection() {
        this.hideAll();
        this.elements.loginSection.classList.remove('hidden');
    }

    // Affiche les sections authentifiées
    showAuthenticatedSections() {
        this.hideAll();
        this.elements.userSection.classList.remove('hidden');
        this.elements.currentTrainSection.classList.remove('hidden');
        this.elements.recordsSection.classList.remove('hidden');
    }

    // Affiche le chargement
    showLoading() {
        this.elements.loadingSection.classList.remove('hidden');
    }

    // Cache le chargement
    hideLoading() {
        this.elements.loadingSection.classList.add('hidden');
    }

    // Affiche une erreur
    showError(message) {
        this.elements.errorSection.classList.remove('hidden');
        this.elements.errorMessage.textContent = message;
    }

    // Cache toutes les sections
    hideAll() {
        Object.values(this.elements).forEach(element => {
            if (element && element.classList) {
                element.classList.add('hidden');
            }
        });
    }

    // Affiche les informations utilisateur
    displayUserInfo(userInfo) {
        this.elements.userAvatar.src = userInfo.profile_image_url;
        this.elements.userName.textContent = userInfo.display_name;
        this.elements.userLogin.textContent = `@${userInfo.login}`;
    }

    // Affiche les données du Hype Train avec la nouvelle structure API
    displayHypeTrainData(statusData) {
        if (!statusData || statusData.length === 0) {
            this.elements.currentTrainContent.innerHTML = '<p class="text-muted">Aucun Hype Train récent</p>';
            this.elements.allTimeHigh.textContent = 'Aucune donnée';
            this.elements.sharedAllTimeHigh.textContent = 'Aucune donnée';
            return;
        }

        const hypeTrainData = statusData[0];
        
        // Vérifie si un Hype Train est en cours
        const isActive = hypeTrainData.expires_at && new Date(hypeTrainData.expires_at) > new Date();
        
        if (isActive) {
            this.displayCurrentTrain(hypeTrainData);
        } else {
            this.displayLastTrain(hypeTrainData);
        }

        // Affiche les records
        if (hypeTrainData.level !== undefined) {
            const level = hypeTrainData.level || 1;
            const goal = hypeTrainData.goal || 0;
            const progress = hypeTrainData.progress || 0;
            
            this.elements.allTimeHigh.textContent = `Niveau ${level} - ${progress}/${goal} points`;
            this.elements.allTimeHighDate.textContent = `Dernière mise à jour: ${new Date(hypeTrainData.started_at || Date.now()).toLocaleString('fr-FR')}`;
        }

        // Note: L'API ne fournit pas directement shared_all_time_high
        this.elements.sharedAllTimeHigh.textContent = 'Niveau maximum atteint';
        this.elements.sharedAllTimeHighDate.textContent = 'Données agrégées non disponibles via l\'API actuelle';
    }

    // Affiche le train en cours (nouvelle structure API)
    displayCurrentTrain(data) {
        const expiresAt = new Date(data.expires_at);
        const timeRemaining = Math.floor((expiresAt - new Date()) / 1000);

        this.elements.currentTrainContent.innerHTML = `
            <div class="current-train active">
                <div class="train-header">
                    <span class="badge badge-success">EN COURS</span>
                    <span class="train-time">⏱️ ${this.formatTime(timeRemaining)} restantes</span>
                </div>
                <div class="train-stats">
                    <div class="stat">
                        <span class="stat-label">Niveau</span>
                        <span class="stat-value">${data.level}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Progression</span>
                        <span class="stat-value">${data.progress}/${data.goal}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Contributeurs</span>
                        <span class="stat-value">${data.top_contributions?.length || 0}</span>
                    </div>
                </div>
                ${this.renderProgressBar(data.progress, data.goal)}
            </div>
        `;
    }

    // Affiche le dernier train terminé (nouvelle structure API)
    displayLastTrain(data) {
        this.elements.currentTrainContent.innerHTML = `
            <div class="current-train completed">
                <div class="train-header">
                    <span class="badge badge-secondary">TERMINÉ</span>
                    <span class="train-time">${new Date(data.ended_at || data.started_at).toLocaleString('fr-FR')}</span>
                </div>
                <div class="train-stats">
                    <div class="stat">
                        <span class="stat-label">Niveau atteint</span>
                        <span class="stat-value">${data.level}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Points finaux</span>
                        <span class="stat-value">${data.progress || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Génère une barre de progression
    renderProgressBar(progress, goal) {
        const percentage = Math.min((progress / goal) * 100, 100);
        return `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <p class="progress-text">${percentage.toFixed(1)}% complété</p>
        `;
    }

    // Formate le temps en minutes et secondes
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    }
}

// Application principale
class App {
    constructor() {
        this.auth = new TwitchAuth();
        this.api = new HypeTrainAPI(this.auth);
        this.ui = new UI();
        this.init();
    }

    async init() {
        console.log('Initialisation de l\'application...');
        console.log('Client ID configuré:', CONFIG.clientId !== 'YOUR_TWITCH_CLIENT_ID');
        console.log('Redirect URI:', CONFIG.redirectUri);

        // Gestion des événements
        this.ui.elements.loginBtn.addEventListener('click', () => {
            console.log('Bouton de connexion cliqué');
            if (CONFIG.clientId === 'YOUR_TWITCH_CLIENT_ID') {
                this.ui.showError('Erreur de configuration: Client ID Twitch non défini. Veuillez modifier app.js et remplacer YOUR_TWITCH_CLIENT_ID par votre Client ID.');
                return;
            }
            this.auth.login();
        });
        
        this.ui.elements.logoutBtn.addEventListener('click', () => this.auth.logout());

        // Vérifie l'authentification
        if (this.auth.handleCallback()) {
            console.log('Token trouvé, authentification en cours...');
            await this.handleAuthenticated();
        } else {
            console.log('Pas de token, affichage de la page de connexion');
            this.ui.showLoginSection();
        }
    }

    async handleAuthenticated() {
        this.ui.showLoading();

        try {
            // Valide le token
            const isValid = await this.auth.validateToken();
            if (!isValid) {
                throw new Error('Token invalide');
            }

            // Récupère les informations utilisateur
            const userInfo = await this.auth.getUserInfo();
            if (!userInfo) {
                throw new Error('Impossible de récupérer les informations utilisateur');
            }

            // Affiche les sections authentifiées
            this.ui.showAuthenticatedSections();
            this.ui.displayUserInfo(userInfo);

            // Récupère les données Hype Train (nouvel endpoint)
            const statusData = await this.api.getHypeTrainStatus();
            this.ui.displayHypeTrainData(statusData);

            this.ui.hideLoading();
        } catch (error) {
            console.error('Erreur:', error);
            this.ui.hideLoading();
            this.ui.showError(`Erreur: ${error.message}`);
            
            // Déconnexion en cas d'erreur d'authentification
            setTimeout(() => this.auth.logout(), 3000);
        }
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, démarrage de l\'application...');
    new App();
});