// Traductions pour la page d'invitation
// Note: Cette page est uniquement pour les projets nécessitant l'app mobile (tontines, etc.)
// Les money pools peuvent être rejoints via le web, donc pas besoin de cette page
const translations = {
  fr: {
    // Clé interne (utilisée pour l'API, pas pour l'URL publique)
    tontine: {
      badge: "Tontine",
      title: "Rejoignez cette tontine",
      subtitle: "Téléchargez l'application Cocoti pour participer à cette tontine et gérer vos contributions en toute sécurité.",
      defaultName: "Tontine",
      loading: "Chargement...",
      download: "Télécharger l'application",
      downloadIOS: "Télécharger sur l'App Store",
      downloadAndroid: "Télécharger sur Google Play",
      statMembers: "Membres actifs",
      statCycles: "Cycles restants",
      qrLabel: "Scannez ce code avec votre téléphone"
    },
    // URL publique "savings-circle"
    'savings-circle': {
      badge: "Tontine",
      title: "Rejoignez cette tontine",
      subtitle: "Téléchargez l'application Cocoti pour participer à cette tontine et gérer vos contributions en toute sécurité.",
      defaultName: "Tontine",
      loading: "Chargement...",
      download: "Télécharger l'application",
      downloadIOS: "Télécharger sur l'App Store",
      downloadAndroid: "Télécharger sur Google Play",
      statMembers: "Membres actifs",
      statCycles: "Cycles restants",
      qrLabel: "Scannez ce code avec votre téléphone"
    },
    'savings_circle': {
      badge: "Tontine",
      title: "Rejoignez cette tontine",
      subtitle: "Téléchargez l'application Cocoti pour participer à cette tontine et gérer vos contributions en toute sécurité.",
      defaultName: "Tontine",
      loading: "Chargement...",
      download: "Télécharger l'application",
      downloadIOS: "Télécharger sur l'App Store",
      downloadAndroid: "Télécharger sur Google Play",
      statMembers: "Membres actifs",
      statCycles: "Cycles restants",
      qrLabel: "Scannez ce code avec votre téléphone"
    }
  },
  en: {
    // Clé interne (utilisée pour l'API, pas pour l'URL publique)
    tontine: {
      badge: "Tontine",
      title: "Join this tontine",
      subtitle: "Download the Cocoti app to participate in this tontine and manage your contributions securely.",
      defaultName: "Tontine",
      loading: "Loading...",
      download: "Download the app",
      downloadIOS: "Download on the App Store",
      downloadAndroid: "Download on Google Play",
      statMembers: "Active members",
      statCycles: "Remaining cycles",
      qrLabel: "Scan this code with your phone"
    },
    // URL publique "savings-circle"
    'savings-circle': {
      badge: "Tontine",
      title: "Join this tontine",
      subtitle: "Download the Cocoti app to participate in this tontine and manage your contributions securely.",
      defaultName: "Tontine",
      loading: "Loading...",
      download: "Download the app",
      downloadIOS: "Download on the App Store",
      downloadAndroid: "Download on Google Play",
      statMembers: "Active members",
      statCycles: "Remaining cycles",
      qrLabel: "Scan this code with your phone"
    },
    'savings_circle': {
      badge: "Tontine",
      title: "Join this tontine",
      subtitle: "Download the Cocoti app to participate in this tontine and manage your contributions securely.",
      defaultName: "Tontine",
      loading: "Loading...",
      download: "Download the app",
      downloadIOS: "Download on the App Store",
      downloadAndroid: "Download on Google Play",
      statMembers: "Active members",
      statCycles: "Remaining cycles",
      qrLabel: "Scan this code with your phone"
    }
  }
};

// Fonction pour obtenir la langue depuis l'URL ou le navigateur
function getLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang') || urlParams.get('l');
  
  if (lang && (lang === 'fr' || lang === 'en')) {
    return lang;
  }
  
  // Détecter depuis le navigateur
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  const detectedLang = browserLang.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  
  // Log pour debug
  console.log('Browser language:', browserLang, '→ Detected:', detectedLang);
  
  return detectedLang;
}

// Fonction pour obtenir les traductions
// Supporte automatiquement tous les types définis dans translations
function getTranslations(lang, projectType) {
  const normalizedProjectTypeMap = {
    'serving-circle': 'tontine',
    serving_circle: 'tontine',
    'savings-circle': 'tontine',
    savings_circle: 'tontine'
  };

  const normalizedProjectType = normalizedProjectTypeMap[projectType] || projectType;

  if (!projectType) {
    console.warn('No project type provided');
    // Fallback sur tontine
    return translations[lang]?.tontine || translations.en?.tontine;
  }
  
  // Vérifier si le type existe dans les traductions pour la langue demandée
  if (translations[lang] && translations[lang][normalizedProjectType]) {
    return translations[lang][normalizedProjectType];
  }
  
  // Fallback sur l'anglais si la langue n'existe pas
  if (translations.en && translations.en[normalizedProjectType]) {
    console.warn(`Translation for "${normalizedProjectType}" not found in "${lang}", using English`);
    return translations.en[normalizedProjectType];
  }
  
  // Fallback sur tontine si le type n'existe pas
  console.warn(`Project type "${normalizedProjectType}" not found in translations, using "tontine" as fallback`);
  return translations[lang]?.tontine || translations.en?.tontine;
}

// Liste des types de projets supportés
function getSupportedProjectTypes() {
  return Object.keys(translations.fr || translations.en || {});
}

