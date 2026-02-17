# Configuration GitHub Pages avec Secrets

Ce guide explique comment configurer GitHub Pages avec un secret pour le Client ID Twitch.

## Étape 1 : Créer un secret GitHub

1. Allez sur votre repository GitHub : `https://github.com/vignemail1/twitch-hype-train-record`
2. Cliquez sur **Settings** (⛙️ Paramètres)
3. Dans le menu latéral gauche, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**
5. Remplissez :
   - **Name** : `TWITCH_CLIENT_ID`
   - **Secret** : Votre Client ID Twitch (ex: `abc123def456ghi789`)
6. Cliquez sur **Add secret**

## Étape 2 : Activer GitHub Pages

1. Toujours dans **Settings**, allez dans la section **Pages**
2. Sous **Source**, sélectionnez **GitHub Actions**
3. Sauvegardez

## Étape 3 : Déclencher le déploiement

Le workflow se déclenchera automatiquement :
- À chaque push sur la branche `main`
- Manuellement via l'onglet **Actions** → **Deploy to GitHub Pages** → **Run workflow**

## Étape 4 : Configurer l'URL de redirection Twitch

Une fois déployé, votre site sera disponible à :
```
https://vignemail1.github.io/twitch-hype-train-record/
```

Allez sur [Twitch Developer Console](https://dev.twitch.tv/console/apps) et ajoutez cette URL comme **OAuth Redirect URL** :
```
https://vignemail1.github.io/twitch-hype-train-record/
```

**Important** : N'oubliez pas le `/` à la fin !

## Vérification

1. Allez dans l'onglet **Actions** de votre repository
2. Vérifiez que le workflow "Deploy to GitHub Pages" s'exécute avec succès
3. Une fois terminé, visitez `https://vignemail1.github.io/twitch-hype-train-record/`
4. Le site devrait fonctionner avec votre Client ID configuré automatiquement

## Débogage

Si le déploiement échoue :
- Vérifiez que le secret `TWITCH_CLIENT_ID` est bien défini
- Consultez les logs dans l'onglet **Actions**
- Vérifiez que GitHub Pages est activé et configuré sur "GitHub Actions"

## Sécurité

- Le Client ID n'est **jamais** commité dans le repository
- Il est injecté automatiquement lors du build via GitHub Actions
- Les secrets GitHub sont chiffrés et sécurisés
