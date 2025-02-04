# Gestionnaire de fichiers STL

Application web pour gérer et visualiser vos fichiers STL d'impression 3D.

## 🚀 Fonctionnalités

- 📁 Gestion des fichiers STL
- 🔍 Visualisation 3D interactive
- 📊 Métadonnées et statistiques
- 📰 Actualités de l'impression 3D en direct
- 🎨 Interface moderne avec Tailwind CSS
- 🌙 Mode sombre automatique

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- Un navigateur moderne

## 🛠️ Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/Eloura74/fileStlGestion.git
cd fileStlGestion
```

2. Installez les dépendances :
```bash
npm install
```

3. Configurez les variables d'environnement :
```bash
cp .env.example .env
```
Puis modifiez le fichier `.env` avec vos propres valeurs :
- `VITE_NEWSAPI_KEY` : Votre clé API pour NewsAPI (obtenir une clé sur [NewsAPI.org](https://newsapi.org))

4. Démarrez l'application en mode développement :
```bash
npm run dev
```

## 🔄 Flux d'actualités

Le composant d'actualités utilise l'API NewsAPI pour afficher les dernières nouvelles de l'impression 3D.

### Configuration

1. Créez un compte sur [NewsAPI.org](https://newsapi.org)
2. Obtenez votre clé API
3. Ajoutez la clé dans votre fichier `.env` :
```env
VITE_NEWSAPI_KEY=votre_clé_api_ici
```

### Fonctionnement

- Affiche 5 articles à la fois
- Mise à jour automatique toutes les 4 heures
- Système de cache pour respecter la limite de requêtes
- Catégorisation automatique des articles
- Navigation fluide avec transitions

## 🎯 Utilisation

1. Déposez vos fichiers STL dans le dossier `stl-files/`
2. L'application générera automatiquement les métadonnées
3. Visualisez et gérez vos fichiers via l'interface web
4. Consultez les dernières actualités du monde de l'impression 3D

## 🔧 Configuration avancée

### Limites API

Le service d'actualités est configuré pour :
- Maximum 90 requêtes par jour
- 5 articles par requête
- Mise à jour toutes les 4 heures
- Cache local pour optimiser les performances

### Personnalisation

Modifiez `src/config/api.config.js` pour ajuster :
- `maxRequestsPerDay` : Limite quotidienne de requêtes
- `requestInterval` : Intervalle entre les mises à jour

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [Three.js](https://threejs.org/) pour la visualisation 3D
- [NewsAPI](https://newsapi.org/) pour les flux d'actualités
- [Tailwind CSS](https://tailwindcss.com/) pour le style
- La communauté open source
