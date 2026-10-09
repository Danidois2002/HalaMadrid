/* Adresse de l'API (dossier api/ du dépôt, hébergée sur Render).
   Vide : le site fonctionne seul, avec js/data.js et le stockage du navigateur (mode démo sans serveur). */
const API_URL = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://localhost:3000'
  : 'https://halamadrid-api.onrender.com';
