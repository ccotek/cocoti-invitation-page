// Charger les variables d'environnement depuis .env en premier
require('dotenv').config();

const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const API_URL = process.env.API_URL || 'http://localhost:8001/api/v1';
const ROOT_REDIRECT_URL = process.env.ROOT_REDIRECT_URL;

// Log des variables d'environnement chargées (pour debug)
console.log('📋 Configuration:');
console.log(`   PORT: ${PORT}`);
console.log(`   API_URL: ${API_URL}`);
console.log(`   ROOT_REDIRECT_URL: ${ROOT_REDIRECT_URL || '(non configuré)'}`);

// Route pour la racine : rediriger vers l'URL configurée
app.get('/', (req, res) => {
  if (ROOT_REDIRECT_URL) {
    console.log(`Redirecting root to: ${ROOT_REDIRECT_URL}`);
    return res.redirect(301, ROOT_REDIRECT_URL);
  }
  // Si pas de redirection configurée, servir la page d'invitation par défaut
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Mapping entre l'URL publique et la clé interne
// L'URL publique peut être différente de la clé utilisée en interne
// Note: "tontine" n'est plus utilisé publiquement, seulement "savings-circle"
const PROJECT_TYPE_MAPPING = {
  'savings-circle': 'tontine', // URL publique → clé interne
  'savings_circle': 'tontine' // Alternative avec underscore
};

// Configuration des endpoints API par type de projet (utilise les clés internes)
// Pour ajouter un nouveau type, ajoutez simplement une entrée ici
const PROJECT_API_CONFIG = {
  tontine: {
    apiPath: '/tontines', // Chemin dans l'API backend
    dataMapper: (data) => ({
      name: data?.name || null,
      members: data?.current_participants_count || null,
      cycles: data?.available_cycles || null
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

// Endpoint proxy générique pour récupérer les infos d'un projet
app.get('/api/:projectType/:id', async (req, res) => {
  try {
    const { projectType: publicType, id } = req.params;
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
    
    try {
      const response = await axios.get(`${API_URL}${config.apiPath}/${id}`, {
        timeout: 5000,
      });
      
      console.log(`${projectType} data fetched successfully`);
      res.json(config.dataMapper(response.data));
    } catch (apiError) {
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
app.get('/invite/:projectType/:id', (req, res) => {
  const { projectType } = req.params;
  
  // Rediriger les anciennes URLs "tontine" vers "savings-circle"
  if (projectType === 'tontine') {
    const { id } = req.params;
    return res.redirect(301, `/invite/savings-circle/${id}`);
  }
  
  // Vérifier que le type est supporté
  const internalType = getInternalProjectType(projectType);
  if (!PROJECT_API_CONFIG[internalType]) {
    return res.status(404).send('Project type not found');
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

app.listen(PORT, () => {
  console.log(`🚀 Serveur d'invitation démarré sur le port ${PORT}`);
  console.log(`📱 Visitez http://localhost:${PORT}/invite/savings-circle/test123 pour tester`);
  console.log(`ℹ️  Note: Cette page est uniquement pour les projets nécessitant l'app mobile`);
});
