// Charger les variables d'environnement depuis .env en premier
require('dotenv').config();

const express = require('express');
const path = require('path');
const axios = require('axios');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3001;
const API_URL = process.env.API_URL || 'http://localhost:8001/api/v1';
const ROOT_REDIRECT_URL = process.env.ROOT_REDIRECT_URL;
const ENVIRONMENT = process.env.ENVIRONMENT || 'production';
const IS_DEV = ENVIRONMENT === 'dev' || ENVIRONMENT === 'development';

// Log des variables d'environnement chargées (pour debug)
console.log('📋 Configuration:');
console.log(`   PORT: ${PORT}`);
console.log(`   API_URL: ${API_URL}`);
console.log(`   ROOT_REDIRECT_URL: ${ROOT_REDIRECT_URL || '(non configuré)'}`);
console.log(`   ENVIRONMENT: ${ENVIRONMENT} (${IS_DEV ? 'mode test' : 'mode production'})`);

// Route pour la racine : rediriger vers l'URL configurée
app.get('/', (req, res) => {
  if (ROOT_REDIRECT_URL) {
    console.log(`Redirecting root to: ${ROOT_REDIRECT_URL}`);
    return res.redirect(301, ROOT_REDIRECT_URL);
  }
  // Si pas de redirection configurée, servir la page d'invitation par défaut
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Mapping entre l'URL publique et la clé interne
// L'URL publique peut être différente de la clé utilisée en interne
// URL canonique publique: "tontine"
// Les anciennes URLs restent supportées pour compatibilité
const PROJECT_TYPE_MAPPING = {
  tontine: 'tontine',
  'savings-circle': 'tontine',
  savings_circle: 'tontine',
  'serving-circle': 'tontine',
  serving_circle: 'tontine'
};

// Configuration des endpoints API par type de projet (utilise les clés internes)
// Pour ajouter un nouveau type, ajoutez simplement une entrée ici
const PROJECT_API_CONFIG = {
  tontine: {
    apiPath: '/tontines', // Chemin dans l'API backend
    publicApiPath: '/tontines', // Chemin pour l'endpoint public (sans auth)
    usePublicEndpoint: true, // Utiliser l'endpoint public /{id}/public
    dataMapper: (data) => ({
      name: data?.name || null,
      members: data?.members || null, // Note: l'endpoint public retourne "members" au lieu de "current_participants_count"
      cycles: data?.cycles || null // Note: l'endpoint public retourne "cycles" au lieu de "available_cycles"
    })
  }
  // Exemple pour ajouter un nouveau type:
  // 'nouveau-projet': {
  //   apiPath: '/nouveaux-projets',
  //   dataMapper: (data) => ({
  //     name: data?.name || null,
  //     members: data?.members_count || null,
  //     customField: data?.custom_field || null
  //   })
  // }
};

// Fonction pour convertir l'URL publique en clé interne
function getInternalProjectType(publicType) {
  return PROJECT_TYPE_MAPPING[publicType] || publicType;
}

// Fonction pour nettoyer un ID (enlever les préfixes comme "id:" ou "ObjectId(")
function cleanProjectId(id) {
  if (!id) return id;
  // Enlever les préfixes courants (id:, ObjectId(, etc.)
  return id.replace(/^(id:|ObjectId\()?/i, '').replace(/\)$/, '');
}

// Fonction helper pour vérifier si un projet existe
async function checkProjectExists(projectType, id) {
  try {
    const config = PROJECT_API_CONFIG[projectType];
    if (!config) {
      return false;
    }
    
    // Nettoyer l'ID avant de faire l'appel API
    const cleanId = cleanProjectId(id);
    
    const response = await axios.get(`${API_URL}${config.apiPath}/${cleanId}`, {
      timeout: 5000,
      validateStatus: (status) => status < 500 // Ne pas throw pour 404, seulement pour erreurs serveur
    });
    
    // Si 404, le projet n'existe pas
    if (response.status === 404) {
      return false;
    }
    
    // Si 200, le projet existe
    return response.status === 200;
  } catch (error) {
    // En cas d'erreur réseau ou autre, on considère que le projet n'existe pas
    if (error.response && error.response.status === 404) {
      return false;
    }
    // Pour les autres erreurs (auth, timeout, etc.), on retourne null pour indiquer l'incertitude
    return null;
  }
}

// Route pour générer le QR code
// Format: /qr/:projectType/:id
app.get('/qr/:projectType/:id', async (req, res) => {
  try {
    let { projectType, id } = req.params;
    
    // Nettoyer l'ID s'il contient un préfixe
    id = cleanProjectId(id);
    
    // Construire l'URL complète de l'invitation
    const protocol = req.protocol;
    const host = req.get('host');
    const inviteUrl = `${protocol}://${host}/invite/${projectType}/${id}`;
    
    console.log(`Generating QR code for: ${inviteUrl}`);
    
    // Générer le QR code en PNG (noir et blanc)
    console.log('Generating QR code...');
    
    const qrCodeBuffer = await QRCode.toBuffer(inviteUrl, {
      type: 'png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000', // Noir
        light: '#ffffff' // Blanc
      },
      errorCorrectionLevel: 'H'
    });
    
    console.log('QR code generated successfully');
    
    // Envoyer l'image avec headers pour éviter le cache pendant le développement
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // Pas de cache pour tester
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(qrCodeBuffer);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).send('Error generating QR code');
  }
});

// Endpoint proxy générique pour récupérer les infos d'un projet
app.get('/api/:projectType/:id', async (req, res) => {
  try {
    let { projectType: publicType, id } = req.params;
    
    console.log(`Received request: /api/${publicType}/${id}`);
    console.log(`Raw ID from params: ${id}`);
    
    // Nettoyer l'ID s'il contient un préfixe
    id = cleanProjectId(id);
    console.log(`Cleaned ID: ${id}`);
    const projectType = getInternalProjectType(publicType); // Convertir l'URL publique en clé interne
    const config = PROJECT_API_CONFIG[projectType];
    
    if (!config) {
      return res.status(404).json({
        name: null,
        members: null,
        cycles: null,
        error: `Project type "${publicType}" is not supported`
      });
    }
    
    console.log(`Fetching ${projectType} data for ID: ${id} (public type: ${publicType})`);
    console.log(`Cleaned ID: ${id}`);
    
    try {
      // Utiliser l'endpoint public si disponible, sinon l'endpoint normal
      const endpointPath = config.usePublicEndpoint && config.publicApiPath
        ? `${config.publicApiPath}/${id}/public`
        : `${config.apiPath}/${id}`;
      
      const fullUrl = `${API_URL}${endpointPath}`;
      console.log(`Calling API: ${fullUrl}`);
      
      const response = await axios.get(fullUrl, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      console.log(`API response status: ${response.status}`);
      console.log(`API response data:`, JSON.stringify(response.data, null, 2));
      
      // Si le projet n'existe pas (404), rediriger en production
      if (response.status === 404) {
        if (!IS_DEV && ROOT_REDIRECT_URL) {
          console.log(`Project ${projectType}/${id} not found, redirecting to ROOT_REDIRECT_URL`);
          return res.redirect(301, ROOT_REDIRECT_URL);
        }
        return res.status(404).json({
          name: null,
          members: null,
          cycles: null,
          error: 'Project not found'
        });
      }
      
      console.log(`${projectType} data fetched successfully`);
      console.log('Raw API response:', JSON.stringify(response.data, null, 2));
      const mappedData = config.dataMapper(response.data);
      console.log('Mapped data:', JSON.stringify(mappedData, null, 2));
      res.json(mappedData);
    } catch (apiError) {
      // Si c'est une erreur 404, rediriger en production
      if (apiError.response && apiError.response.status === 404) {
        if (!IS_DEV && ROOT_REDIRECT_URL) {
          console.log(`Project ${projectType}/${id} not found (API error), redirecting to ROOT_REDIRECT_URL`);
          return res.redirect(301, ROOT_REDIRECT_URL);
        }
        return res.status(404).json({
          name: null,
          members: null,
          cycles: null,
          error: 'Project not found'
        });
      }
      
      console.log('API call failed (likely auth required):', apiError.message);
      res.json({
        name: null,
        members: null,
        cycles: null,
        error: 'Authentication required'
      });
    }
  } catch (error) {
    console.error(`Error in /api/${req.params.projectType}/:id:`, error);
    res.json({ 
      name: null,
      members: null,
      cycles: null,
      error: error.message 
    });
  }
});

// Route générique pour les invitations
// Format: /invite/{projectType}/{id}
// Pour ajouter un nouveau type, ajoutez simplement les traductions dans translations.js
app.get('/invite/:projectType/:id', async (req, res) => {
  let { projectType, id } = req.params;
  
  // Nettoyer l'ID s'il contient un préfixe
  id = cleanProjectId(id);
  
  // Rediriger les anciennes URLs vers l'URL canonique "tontine"
  if (projectType === 'savings-circle' || projectType === 'savings_circle' || projectType === 'serving-circle' || projectType === 'serving_circle') {
    return res.redirect(301, `/invite/tontine/${id}`);
  }
  
  // Vérifier que le type est supporté
  const internalType = getInternalProjectType(projectType);
  if (!PROJECT_API_CONFIG[internalType]) {
    // Type de projet non supporté : rediriger en production
    if (!IS_DEV && ROOT_REDIRECT_URL) {
      console.log(`Project type "${projectType}" not supported, redirecting to ROOT_REDIRECT_URL`);
      return res.redirect(301, ROOT_REDIRECT_URL);
    }
    return res.status(404).send('Project type not found');
  }
  
  // Vérifier si le projet existe (en production seulement)
  if (!IS_DEV && ROOT_REDIRECT_URL) {
    const projectExists = await checkProjectExists(internalType, id);
    if (projectExists === false) {
      // Le projet n'existe pas : rediriger
      console.log(`Project ${projectType}/${id} not found, redirecting to ROOT_REDIRECT_URL`);
      return res.redirect(301, ROOT_REDIRECT_URL);
    }
    // Si projectExists === null, on ne peut pas vérifier (erreur API), on laisse passer
  }
  
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route pour servir les fichiers .well-known
app.get('/.well-known/apple-app-site-association', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'public', '.well-known', 'apple-app-site-association'));
});

app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'public', '.well-known', 'assetlinks.json'));
});

// Servir les fichiers statiques (après toutes les routes spécifiques)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware 404 : rediriger toutes les URLs inexistantes vers ROOT_REDIRECT_URL
app.use((req, res, next) => {
  // En mode dev, ne pas rediriger
  if (IS_DEV) {
    console.log(`404 - Mode dev, pas de redirection pour: ${req.path}`);
    return res.status(404).send('Page not found (mode dev)');
  }
  
  // Si ROOT_REDIRECT_URL est configuré, rediriger
  if (ROOT_REDIRECT_URL) {
    console.log(`404 - Redirecting ${req.path} to: ${ROOT_REDIRECT_URL}`);
    return res.redirect(301, ROOT_REDIRECT_URL);
  }
  // Sinon, renvoyer une erreur 404 classique
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur d'invitation démarré sur le port ${PORT}`);
  console.log(`📱 Visitez http://localhost:${PORT}/invite/tontine/test123 pour tester`);
  console.log(`ℹ️  Note: Cette page est uniquement pour les projets nécessitant l'app mobile`);
  if (ROOT_REDIRECT_URL) {
    console.log(`🔄 Redirection 404 activée vers: ${ROOT_REDIRECT_URL}`);
    if (IS_DEV) {
      console.log(`⚠️  Mode dev: les redirections sont désactivées pour les tests`);
    }
  }
});
