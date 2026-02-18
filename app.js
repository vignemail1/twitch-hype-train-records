// Configuration Twitch OAuth
// Le Client ID est désormais chargé depuis config.js
const CONFIG = {
    clientId: window.TWITCH_CONFIG?.clientId || null,
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
            const url = `${CONFIG.apiBaseUrl}/hypetrain/status?broadcaster_id=${this.auth.userId}`;
            console.log('🚂 Appel API Hype Train:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.auth.accessToken}`,
                    'Client-Id': CONFIG.clientId
                }
            });

            console.log('📊 Statut réponse:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erreur API:', errorData);
                throw new Error(errorData.message || 'Erreur API');
            }

            const data = await response.json();
            console.log('✅ Données Hype Train reçues:', data);
            console.log('📦 Nombre d\'événements:', data.data?.length || 0);
            
            if (data.data && data.data.length > 0) {
                console.log('🎉 Premier événement:', data.data[0]);
            }
            
            return data.data;
        } catch (error) {
            console.error('💥 Erreur lors de la récupération du Hype Train:', error);
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
        
        // Liste des sections à gérer pour l'affichage/masquage
        this.sections = [
            this.elements.loginSection,
            this.elements.userSection,
            this.elements.currentTrainSection,
            this.elements.recordsSection,
            this.elements.errorSection,
            this.elements.loadingSection
        ];
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

    // Cache toutes les sections (mais pas les éléments enfants comme les boutons)
    hideAll() {
        this.sections.forEach(section => {
            if (section) {
                section.classList.add('hidden');
            }
        });
    }

    // Affiche les informations utilisateur
    displayUserInfo(userInfo) {
        this.elements.userAvatar.src = userInfo.profile_image_url;
        this.elements.userName.textContent = userInfo.display_name;
        this.elements.userLogin.textContent = `@${userInfo.login}`;
    }

    // Affiche les données du Hype Train avec la structure API correcte
    displayHypeTrainData(statusData) {
        console.log('🎨 Affichage des données Hype Train:', statusData);
        
        if (!statusData || statusData.length === 0) {
            console.log('ℹ️ Aucune donnée Hype Train disponible');
            this.elements.currentTrainContent.innerHTML = `
                <div class="info-box">
                    <p class="text-muted">ℹ️ Aucun Hype Train récent</p>
                    <p class="text-small">L'API Twitch ne retourne que les Hype Trains en cours ou très récents. L'historique complet n'est pas disponible via cette API.</p>
                </div>
            `;
            this.elements.allTimeHigh.textContent = 'Aucune donnée disponible';
            this.elements.allTimeHighDate.textContent = '';
            this.elements.sharedAllTimeHigh.textContent = 'Aucune donnée disponible';
            this.elements.sharedAllTimeHighDate.textContent = 'L\'API ne fournit que les données des Hype Trains actifs ou récents';
            return;
        }

        const hypeTrainData = statusData[0];
        console.log('📊 Premier Hype Train:', hypeTrainData);
        
        // La structure correcte: data[0].current, data[0].all_time_high, data[0].shared_all_time_high
        const current = hypeTrainData.current;
        const allTimeHigh = hypeTrainData.all_time_high;
        const sharedAllTimeHigh = hypeTrainData.shared_all_time_high;
        
        // Vérifie si un Hype Train est en cours
        if (current) {
            const isActive = current.expires_at && new Date(current.expires_at) > new Date();
            console.log('⏰ Hype Train actif?', isActive);
            
            if (isActive) {
                this.displayCurrentTrain(current);
            } else {
                this.displayLastTrain(current);
            }
        } else {
            this.elements.currentTrainContent.innerHTML = '<p class="text-muted">Aucun Hype Train en cours</p>';
        }

        // Affiche les records all-time high
        if (allTimeHigh) {
            this.elements.allTimeHigh.textContent = `Niveau ${allTimeHigh.level} - ${allTimeHigh.total} points`;
            this.elements.allTimeHighDate.textContent = allTimeHigh.achieved_at 
                ? `Atteint le: ${new Date(allTimeHigh.achieved_at).toLocaleString('fr-FR')}`
                : 'Date inconnue';
        } else {
            this.elements.allTimeHigh.textContent = 'Aucun record personnel';
            this.elements.allTimeHighDate.textContent = '';
        }

        // Affiche les records shared all-time high
        if (sharedAllTimeHigh) {
            this.elements.sharedAllTimeHigh.textContent = `Niveau ${sharedAllTimeHigh.level} - ${sharedAllTimeHigh.total} points`;
            this.elements.sharedAllTimeHighDate.textContent = sharedAllTimeHigh.achieved_at 
                ? `Atteint le: ${new Date(sharedAllTimeHigh.achieved_at).toLocaleString('fr-FR')}`
                : 'Date inconnue';
        } else {
            this.elements.sharedAllTimeHigh.textContent = 'Aucun record partagé';
            this.elements.sharedAllTimeHighDate.textContent = '';
        }
    }

    // Affiche le train en cours
    displayCurrentTrain(current) {
        const expiresAt = new Date(current.expires_at);
        const timeRemaining = Math.floor((expiresAt - new Date()) / 1000);

        // Affiche les top contributeurs
        const contributorsHTML = current.top_contributions && current.top_contributions.length > 0
            ? `
                <div class="contributors">
                    <h4>🌟 Top Contributeurs</h4>
                    <ul>
                        ${current.top_contributions.map(contrib => `
                            <li>
                                <strong>${contrib.user_name}</strong>: ${contrib.total} ${contrib.type === 'bits' ? 'bits' : 'subs'}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `
            : '';

        this.elements.currentTrainContent.innerHTML = `
            <div class="current-train active">
                <div class="train-header">
                    <span class="badge badge-success">EN COURS</span>
                    <span class="train-time">⏱️ ${this.formatTime(timeRemaining)} restantes</span>
                </div>
                <div class="train-stats">
                    <div class="stat">
                        <span class="stat-label">Niveau</span>
                        <span class="stat-value">${current.level}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Progression</span>
                        <span class="stat-value">${current.progress}/${current.goal}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total</span>
                        <span class="stat-value">${current.total} points</span>
                    </div>
                </div>
                ${this.renderProgressBar(current.progress, current.goal)}
                ${contributorsHTML}
            </div>
        `;
    }

    // Affiche le dernier train terminé
    displayLastTrain(current) {
        this.elements.currentTrainContent.innerHTML = `
            <div class="current-train completed">
                <div class="train-header">
                    <span class="badge badge-secondary">TERMINÉ</span>
                    <span class="train-time">${new Date(current.started_at).toLocaleString('fr-FR')}</span>
                </div>
                <div class="train-stats">
                    <div class="stat">
                        <span class="stat-label">Niveau atteint</span>
                        <span class="stat-value">${current.level}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Points totaux</span>
                        <span class="stat-value">${current.total}</span>
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
        console.log('🚀 Initialisation de l\'application...');
        console.log('🔑 Client ID configuré:', !!CONFIG.clientId);
        console.log('🔗 Redirect URI:', CONFIG.redirectUri);

        // Gestion des événements
        this.ui.elements.loginBtn.addEventListener('click', () => {
            console.log('🖱️ Bouton de connexion cliqué');
            if (!CONFIG.clientId) {
                this.ui.showError('Erreur de configuration: Client ID Twitch non défini. Veuillez créer un fichier config.js à partir de config.template.js et y ajouter votre Client ID.');
                return;
            }
            this.auth.login();
        });
        
        this.ui.elements.logoutBtn.addEventListener('click', () => this.auth.logout());

        // Vérifie l'authentification
        if (this.auth.handleCallback()) {
            console.log('🎫 Token trouvé, authentification en cours...');
            await this.handleAuthenticated();
        } else {
            console.log('🔐 Pas de token, affichage de la page de connexion');
            this.ui.showLoginSection();
        }
    }

    async handleAuthenticated() {
        this.ui.showLoading();

        try {
            // Valide le token
            console.log('✅ Validation du token...');
            const isValid = await this.auth.validateToken();
            if (!isValid) {
                throw new Error('Token invalide');
            }

            // Récupère les informations utilisateur
            console.log('👤 Récupération des infos utilisateur...');
            const userInfo = await this.auth.getUserInfo();
            if (!userInfo) {
                throw new Error('Impossible de récupérer les informations utilisateur');
            }
            console.log('✅ Utilisateur:', userInfo.display_name);

            // Affiche les sections authentifiées
            this.ui.showAuthenticatedSections();
            this.ui.displayUserInfo(userInfo);

            // Récupère les données Hype Train (nouvel endpoint)
            console.log('🚂 Récupération des données Hype Train...');
            const statusData = await this.api.getHypeTrainStatus();
            this.ui.displayHypeTrainData(statusData);

            this.ui.hideLoading();
            console.log('✅ Application initialisée avec succès!');
        } catch (error) {
            console.error('💥 Erreur:', error);
            this.ui.hideLoading();
            this.ui.showError(`Erreur: ${error.message}`);
            
            // Déconnexion en cas d'erreur d'authentification
            setTimeout(() => this.auth.logout(), 3000);
        }
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM chargé, démarrage de l\'application...');
    new App();
});