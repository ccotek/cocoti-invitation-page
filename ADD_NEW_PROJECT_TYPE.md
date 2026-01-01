# Comment ajouter un nouveau type de projet

Ce guide explique comment ajouter facilement un nouveau type de projet à la page d'invitation.

## Étapes

### 1. Ajouter les traductions

Éditez `public/translations.js` et ajoutez les traductions pour votre nouveau type :

```javascript
const translations = {
  fr: {
    tontine: { /* ... */ },
    'nouveau-projet': {  // ← Ajoutez ici
      badge: "Nouveau Projet",
      title: "Rejoignez ce nouveau projet",
      subtitle: "Téléchargez l'application Cocoti...",
      defaultName: "Nouveau Projet",
      loading: "Chargement...",
      download: "Télécharger l'application",
      downloadIOS: "Télécharger sur l'App Store",
      downloadAndroid: "Télécharger sur Google Play",
      statMembers: "Membres actifs",
      statCycles: "Cycles restants", // ou autres stats
      qrLabel: "Scannez ce code avec votre téléphone"
    }
  },
  en: {
    tontine: { /* ... */ },
    'nouveau-projet': {  // ← Ajoutez ici aussi
      badge: "New Project",
      title: "Join this new project",
      // ... traductions en anglais
    }
  }
};
```

### 2. Configurer l'endpoint API

Éditez `server.js` et ajoutez la configuration dans `PROJECT_API_CONFIG` :

```javascript
const PROJECT_API_CONFIG = {
  tontine: { /* ... */ },
  'nouveau-projet': {  // ← Ajoutez ici
    apiPath: '/nouveaux-projets', // Chemin dans votre API backend
    dataMapper: (data) => ({
      name: data?.name || null,
      members: data?.members_count || null,
      cycles: data?.available_cycles || null,
      // Ajoutez d'autres champs selon vos besoins
    })
  }
};
```

### 3. C'est tout !

La route `/invite/nouveau-projet/{id}` fonctionnera automatiquement.

## Exemple d'utilisation

```
http://localhost:3001/invite/nouveau-projet/123
http://localhost:3001/invite/nouveau-projet/123?lang=en
```

## Notes importantes

- Le `projectType` dans l'URL doit correspondre exactement à la clé dans `translations.js`
- Le `apiPath` doit correspondre au chemin dans votre API backend
- Le `dataMapper` transforme les données de l'API pour correspondre au format attendu par le frontend
- Les stats affichées dépendent de ce que vous retournez dans `dataMapper`

