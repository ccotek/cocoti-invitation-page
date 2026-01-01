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
