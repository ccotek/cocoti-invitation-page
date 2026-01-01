// Traductions pour la page d'invitation
// Note: Cette page est uniquement pour les projets nécessitant l'app mobile (tontines, etc.)
// Les money pools peuvent être rejoints via le web, donc pas besoin de cette page
const translations = {
  fr: {
    // Clé interne (utilisée pour l'API, pas pour l'URL publique)
    tontine: {
      badge: "Épargne Rotative",
      title: "Rejoignez cette épargne rotative",
      subtitle: "Téléchargez l'application Cocoti pour participer à cette épargne rotative et gérer vos contributions en toute sécurité.",
      defaultName: "Épargne Rotative",
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
      badge: "Épargne Rotative",
      title: "Rejoignez cette épargne rotative",
      subtitle: "Téléchargez l'application Cocoti pour participer à cette épargne rotative et gérer vos contributions en toute sécurité.",
      defaultName: "Épargne Rotative",
      loading: "Chargement...",
      download: "Télécharger l'application",
      downloadIOS: "Télécharger sur l'App Store",
      downloadAndroid: "Télécharger sur Google Play",
      statMembers: "Membres actifs",
      statCycles: "Cycles restants",
      qrLabel: "Scannez ce code avec votre téléphone"
    },
    'savings_circle': {
      badge: "Épargne Rotative",
      title: "Rejoignez cette épargne rotative",
      subtitle: "Téléchargez l'application Cocoti pour participer à cette épargne rotative et gérer vos contributions en toute sécurité.",
      defaultName: "Épargne Rotative",
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
      badge: "Savings Circle",
      title: "Join this savings circle",
      subtitle: "Download the Cocoti app to participate in this savings circle and manage your contributions securely.",
      defaultName: "Savings Circle",
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
      badge: "Savings Circle",
      title: "Join this savings circle",
      subtitle: "Download the Cocoti app to participate in this savings circle and manage your contributions securely.",
      defaultName: "Savings Circle",
      loading: "Loading...",
      download: "Download the app",
      downloadIOS: "Download on the App Store",
      downloadAndroid: "Download on Google Play",
      statMembers: "Active members",
      statCycles: "Remaining cycles",
      qrLabel: "Scan this code with your phone"
    },
    'savings_circle': {
      badge: "Savings Circle",
      title: "Join this savings circle",
      subtitle: "Download the Cocoti app to participate in this savings circle and manage your contributions securely.",
      defaultName: "Savings Circle",
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
  if (!projectType) {
    console.warn('No project type provided');
    // Fallback sur savings-circle (URL publique) au lieu de tontine
    return translations[lang]?.['savings-circle'] || translations.en?.['savings-circle'];
  }
  
  // Vérifier si le type existe dans les traductions pour la langue demandée
  if (translations[lang] && translations[lang][projectType]) {
    return translations[lang][projectType];
  }
  
  // Fallback sur l'anglais si la langue n'existe pas
  if (translations.en && translations.en[projectType]) {
    console.warn(`Translation for "${projectType}" not found in "${lang}", using English`);
    return translations.en[projectType];
  }
  
  // Fallback sur savings-circle (URL publique) si le type n'existe pas
  console.warn(`Project type "${projectType}" not found in translations, using "savings-circle" as fallback`);
  return translations[lang]?.['savings-circle'] || translations.en?.['savings-circle'];
}

// Liste des types de projets supportés
function getSupportedProjectTypes() {
  return Object.keys(translations.fr || translations.en || {});
}

