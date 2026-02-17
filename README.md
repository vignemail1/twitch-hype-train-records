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
2. Modifiez le fichier `app.js` et remplacez `YOUR_TWITCH_CLIENT_ID` par votre Client ID :

```javascript
const CONFIG = {
    clientId: 'votre_client_id_ici',
    // ...
};
```

### Déploiement sur GitHub Pages

1. Allez dans les paramètres du repository
2. Section **Pages** → Source : `main` branch
3. Sauvegardez et attendez le déploiement

### Déploiement sur Vercel

1. Importez le repository sur [Vercel](https://vercel.com)
2. Configurez le Client ID dans les variables d'environnement (optionnel pour une future amélioration)
3. Déployez

### Développement local

```bash
# Clonez le repository
git clone https://github.com/vignemail1/twitch-hype-train-record.git
cd twitch-hype-train-record

# Lancez un serveur HTTP local
python3 -m http.server 8000
# ou
npx serve

# Ouvrez http://localhost:8000 dans votre navigateur
```

## 📋 API Twitch utilisée

- **Endpoint** : `GET https://api.twitch.tv/helix/hypetrain/events`
- **Scope requis** : `channel:read:hype_train`
- **Documentation** : [Twitch API Reference](https://dev.twitch.tv/docs/api/reference#get-hype-train-events)

## 🔒 Sécurité

- Utilisation de l'**OAuth Implicit Flow** adapté aux applications statiques
- Les tokens sont stockés uniquement dans le localStorage du navigateur
- Aucune donnée n'est envoyée à un serveur tiers
- Le Client Secret n'est pas nécessaire pour ce type d'authentification

## 🛠️ Technologies

- HTML5
- CSS3 (avec variables CSS et animations)
- JavaScript Vanilla (ES6+)
- Twitch API Helix
- OAuth 2.0

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