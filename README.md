# 🚂 Twitch Hype Train Records

Application web permettant aux streameurs Twitch de consulter l'historique de leurs Hype Trains via l'API Helix de Twitch.

## ✨ Fonctionnalités

- **Authentification Twitch OAuth** : Connexion sécurisée via votre compte Twitch
- **Train en cours** : Visualisation en temps réel du Hype Train actif
- **Statistiques** : Affichage des records all-time high
- **Interface responsive** : Compatible desktop et mobile
- **Déconnexion sécurisée** : Nettoyage complet du cache et des tokens

## 🚀 Déploiement

### Prérequis

1. Créer une application Twitch sur le [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Configurer l'URL de redirection OAuth :
   - Pour GitHub Pages : `https://[votre-username].github.io/twitch-hype-train-record/`
   - Pour Vercel : `https://[votre-projet].vercel.app/`
   - Pour le développement local : `http://localhost:8000/`

### Configuration

1. Récupérez votre **Client ID** depuis la console Twitch
2. Créez un fichier `config.js` à partir du template :

```bash
cp config.template.js config.js
```

3. Éditez `config.js` et remplacez `YOUR_TWITCH_CLIENT_ID` par votre Client ID :

```javascript
window.TWITCH_CONFIG = {
    clientId: 'votre_client_id_ici'
};
```

**Important** : Le fichier `config.js` est ignoré par Git (dans `.gitignore`) pour éviter de commettre vos secrets.

### Déploiement sur GitHub Pages

#### Option 1 : Avec GitHub Secrets (recommandé)

1. Allez dans **Settings** → **Secrets and variables** → **Actions**
2. Ajoutez un nouveau secret `TWITCH_CLIENT_ID` avec votre Client ID
3. Le workflow CI/CD générera automatiquement le fichier `config.js` au déploiement

#### Option 2 : Manuellement

1. Créez une branche `gh-pages`
2. Ajoutez-y votre fichier `config.js` avec le Client ID
3. Configurez GitHub Pages pour utiliser la branche `gh-pages`

### Déploiement sur Vercel

1. Importez le repository sur [Vercel](https://vercel.com)
2. Ajoutez une variable d'environnement `TWITCH_CLIENT_ID`
3. Créez un script de build qui génère `config.js` :

```json
{
  "scripts": {
    "build": "echo 'window.TWITCH_CONFIG={clientId:\"'$TWITCH_CLIENT_ID'\"};' > config.js"
  }
}
```

4. Déployez

### Développement local

```bash
# Clonez le repository
git clone https://github.com/vignemail1/twitch-hype-train-record.git
cd twitch-hype-train-record

# Créez votre fichier de configuration
cp config.template.js config.js
# Éditez config.js et ajoutez votre Client ID

# Lancez un serveur HTTP local
python3 -m http.server 8000
# ou
npx serve

# Ouvrez http://localhost:8000 dans votre navigateur
```

## 📋 API Twitch utilisée

- **Endpoint** : `GET https://api.twitch.tv/helix/hypetrain/status`
- **Scope requis** : `channel:read:hype_train`
- **Documentation** : [Twitch API Reference](https://dev.twitch.tv/docs/api/reference#get-hype-train-status)

## 🔒 Sécurité

- Utilisation de l'**OAuth Implicit Flow** adapté aux applications statiques
- Les tokens sont stockés uniquement dans le localStorage du navigateur
- Aucune donnée n'est envoyée à un serveur tiers
- Le Client ID est chargé depuis un fichier de configuration séparé (non commité)
- Le Client Secret n'est pas nécessaire pour ce type d'authentification

## 🛠️ Technologies

- HTML5
- CSS3 (avec variables CSS et animations)
- JavaScript Vanilla (ES6+)
- Twitch API Helix
- OAuth 2.0

## 👾 Structure du projet

```
twitch-hype-train-record/
├── index.html           # Page principale
├── app.js               # Logique applicative
├── styles.css           # Styles
├── config.template.js   # Template de configuration
├── config.example.js    # Exemple de configuration
├── config.js            # Configuration locale (ignoré par Git)
├── .gitignore           # Fichiers ignorés
└── README.md            # Documentation
```

## 📝 TODO

- [ ] Mise en place du CI/CD avec GitHub Actions
- [ ] Historique complet des Hype Trains
- [ ] Graphiques de statistiques
- [ ] Export des données en CSV
- [ ] Mode sombre/clair
- [ ] Support multilingue

## 📄 Licence

MIT

## 👤 Auteur

vignemail1

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

Développé avec ❤️ et l'API Twitch Helix