// Clé API NewsAPI (à remplacer par votre clé)
// const API_KEY = 'votre_cle_api_ici';
// const BASE_URL = 'https://newsapi.org/v2/everything';

// Stockage en cache des articles
// let cacheArticles = [];
// let derniereMiseAJour = null;
// const DUREE_CACHE = 3600000; // 1 heure en millisecondes
// const NOMBRE_ARTICLES = 5;

// Mots-clés pour la recherche d'articles sur l'impression 3D
// const MOTS_CLES = [
//   '3D printing',
//   'impression 3D',
//   'additive manufacturing',
//   'fabrication additive'
// ].join(' OR ');

import { actualites } from '../data/actualites3d';
import { API_CONFIG } from '../config/api.config';

const BASE_URL = 'https://newsapi.org/v2/everything';

// Configuration du cache et des limites
const NOMBRE_ARTICLES = 5;
let cacheArticles = [];
let derniereMiseAJour = null;
const DUREE_CACHE = API_CONFIG.newsapi.requestInterval;

// Mots-clés pour la recherche d'articles sur l'impression 3D
const MOTS_CLES = [
  '3D printing',
  'impression 3D',
  'additive manufacturing',
  'fabrication additive'
].join(' OR ');

// Fonction pour déterminer la catégorie en fonction du contenu
const determinerCategorie = (titre, description) => {
  const contenu = (titre + ' ' + description).toLowerCase();
  
  if (contenu.includes('printer') || contenu.includes('imprimante')) {
    return 'Matériel';
  }
  if (contenu.includes('filament') || contenu.includes('resin')) {
    return 'Matériaux';
  }
  if (contenu.includes('medical') || contenu.includes('dental')) {
    return 'Médical';
  }
  if (contenu.includes('software') || contenu.includes('logiciel')) {
    return 'Logiciel';
  }
  return 'Actualité';
};

// Fonction pour formater les articles
const formaterArticles = (articles) => {
  return articles.map((article, index) => ({
    id: index + 1,
    titre: article.title,
    description: article.description || article.content || '',
    image: article.urlToImage || 'https://via.placeholder.com/400x300?text=Impression+3D',
    date: article.publishedAt,
    categorie: determinerCategorie(article.title, article.description || ''),
    source: article.source.name,
    lienSource: article.url
  }));
};

export const recupererActualites = async () => {
  try {
    // Vérifier si le cache est encore valide
    const maintenant = new Date().getTime();
    if (
      cacheArticles.length > 0 &&
      derniereMiseAJour &&
      maintenant - derniereMiseAJour < DUREE_CACHE
    ) {
      console.log('Utilisation du cache pour les actualités');
      return cacheArticles;
    }

    // Paramètres de la requête
    const params = new URLSearchParams({
      apiKey: API_CONFIG.newsapi.key,
      q: MOTS_CLES,
      language: 'fr',
      sortBy: 'publishedAt',
      pageSize: NOMBRE_ARTICLES
    });

    // Récupération des articles
    const reponse = await fetch(`${BASE_URL}?${params}`);
    
    if (!reponse.ok) {
      throw new Error(`Erreur API: ${reponse.status}`);
    }
    
    const donnees = await reponse.json();

    if (donnees.status !== 'ok') {
      throw new Error('Erreur lors de la récupération des actualités');
    }

    // Mise à jour du cache
    cacheArticles = formaterArticles(donnees.articles);
    derniereMiseAJour = maintenant;

    console.log('Articles mis à jour depuis l\'API');
    return cacheArticles;

  } catch (erreur) {
    console.error('Erreur lors de la récupération des actualités:', erreur);
    
    // En cas d'erreur, retourner le cache s'il existe, sinon les données statiques
    return cacheArticles.length > 0 ? cacheArticles : actualites;
  }
};
