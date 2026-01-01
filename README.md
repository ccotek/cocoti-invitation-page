# Cocoti Invite Page

Page web minimale pour les invitations de tontines via deep links.

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Port sur lequel le serveur Express écoute
# Par défaut: 3001
PORT=3001

# URL de l'API backend Cocoti
# Par défaut: http://localhost:8001/api/v1
# En production, utiliser: https://api.cocoti.com/api/v1
API_URL=http://localhost:8001/api/v1

# URL de redirection pour la racine (optionnel)
# Si configuré, accéder à http://localhost:3001/ redirigera vers cette URL
# Exemple: https://cocoti.com
ROOT_REDIRECT_URL=https://cocoti.com
```

## Démarrage

```bash
npm start
```

Le serveur démarre sur `http://localhost:3001` (ou le port configuré dans `.env`).

## Utilisation

### Épargnes Rotatives
Cette page est pour les projets nécessitant l'application mobile (épargnes rotatives).

Accédez à une page d'invitation d'épargne rotative via :
```
http://localhost:3001/invite/savings-circle/{id}
```

**Note:** L'ancienne URL `/invite/tontine/{id}` redirige automatiquement vers `/invite/savings-circle/{id}`.

**Note:** Les money pools (cagnottes) peuvent être rejoints directement via le web, donc ils n'utilisent pas cette page d'invitation.

### Ajouter un nouveau type de projet

La page est conçue pour être facilement extensible. Pour ajouter un nouveau type de projet, consultez le fichier `ADD_NEW_PROJECT_TYPE.md`.

### Multilingue
La langue est détectée automatiquement depuis le navigateur ou peut être forcée via le paramètre `lang` :
```
http://localhost:3001/invite/savings-circle/{tontineId}?lang=fr
http://localhost:3001/invite/savings-circle/{tontineId}?lang=en
```

Langues supportées : `fr` (français), `en` (anglais)

## Variables d'environnement

Les variables d'environnement sont chargées depuis le fichier `.env` grâce à `dotenv`.

- **PORT** : Port d'écoute du serveur (défaut: 3001)
- **API_URL** : URL de l'API backend (défaut: http://localhost:8001/api/v1)
- **ROOT_REDIRECT_URL** : URL de redirection pour la racine `/` (optionnel). Si configuré, accéder à la racine redirigera vers cette URL. Sinon, la page d'invitation par défaut sera servie.

## Configuration importante avant déploiement

### Configuration requise avant déploiement

#### Apple Team ID (iOS)

Le fichier `.well-known/apple-app-site-association` contient un placeholder `TEAMID.sn.cocoti.app`.

**⚠️ Vous DEVEZ remplacer `TEAMID` par votre vrai Apple Team ID avant le déploiement !**

Voir [APPLE_TEAM_ID.md](./APPLE_TEAM_ID.md) pour savoir comment trouver et configurer votre Team ID.

#### SHA-256 Certificate Fingerprint (Android)

Le fichier `.well-known/assetlinks.json` contient un placeholder `SHA256_FINGERPRINT_HERE`.

**⚠️ Vous DEVEZ remplacer cette valeur par le SHA-256 fingerprint de votre certificat Android avant le déploiement !**

Voir [ANDROID_CERTIFICATE.md](./ANDROID_CERTIFICATE.md) pour savoir comment obtenir et configurer votre fingerprint.

## Documentation complète

- [INVITATION_LINKS.md](./INVITATION_LINKS.md) : Format des liens et tous les scénarios
- [UNIVERSAL_LINKS_EXPLANATION.md](./UNIVERSAL_LINKS_EXPLANATION.md) : Comment fonctionnent les Universal Links
- [APPLE_TEAM_ID.md](./APPLE_TEAM_ID.md) : Comment trouver et configurer votre Apple Team ID (iOS)
- [ANDROID_CERTIFICATE.md](./ANDROID_CERTIFICATE.md) : Comment obtenir et configurer le SHA-256 fingerprint (Android)
