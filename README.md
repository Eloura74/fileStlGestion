# Plateforme de Gestion de Modèles 3D

Cette application web permet de gérer et visualiser vos fichiers STL stockés localement.

## Fonctionnalités

- Visualisation des fichiers STL dans un dossier local
- Filtrage par catégorie (figurine, jeux, décoration, technique)
- Filtrage par matériau (filament, résine)
- Filtrage par statut (à faire, fait)
- Recherche par nom
- Modification des métadonnées des fichiers
- Interface moderne et responsive

## Installation

1. Cloner le dépôt
2. Installer les dépendances :
```bash
npm install
```

## Configuration

1. Modifier le chemin par défaut des fichiers STL dans `src/App.jsx` si nécessaire
2. Configurer le port du serveur dans `src/server/index.js` si nécessaire

## Démarrage

1. Démarrer le serveur backend :
```bash
npm run server
```

2. Démarrer l'application frontend :
```bash
npm run dev
```

## Technologies utilisées

- React
- Vite
- Tailwind CSS
- Express
- Three.js
- React Three Fiber
