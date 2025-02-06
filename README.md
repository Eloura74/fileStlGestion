# 🎨 Gestionnaire de fichiers STL
<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)
![Licence](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg?style=for-the-badge)

*Une application web moderne pour gérer et visualiser vos fichiers STL d'impression 3D*

[🚀 Fonctionnalités](#-fonctionnalités) •
[📋 Prérequis](#-prérequis) •
[🛠️ Installation](#️-installation) •
[📖 Documentation](#-documentation) •
[🤝 Contribution](#-contribution)

</div>

---

## ✨ Aperçu

Le Gestionnaire de fichiers STL est une application web moderne qui vous permet de :
- 🎯 Visualiser vos modèles 3D directement dans le navigateur
- 📁 Organiser votre bibliothèque de fichiers STL
- 📊 Suivre vos statistiques d'impression
- 🔍 Rechercher rapidement vos modèles
- 📱 Interface responsive adaptée à tous les écrans

## 🚀 Fonctionnalités

### 📁 Gestion des Fichiers
- ✨ Visualisation 3D interactive avec contrôles intuitifs
- 📑 Organisation par catégories et tags
- 🏷️ Système de métadonnées avancé
- 🔍 Recherche rapide et filtrage

### 🎨 Interface Utilisateur
- 🌓 Mode sombre/clair automatique
- 📱 Design responsive (mobile, tablette, desktop)
- ⚡ Navigation fluide et rapide
- 🎯 Interface utilisateur intuitive

### 📊 Statistiques et Suivi
- 📈 Suivi des impressions
- 📊 Statistiques d'utilisation
- 🕒 Historique des modifications
- 📉 Analyse des temps d'impression

### 🔄 Actualités
- 📰 Flux d'actualités de l'impression 3D en direct
- 🌐 Intégration avec NewsAPI
- 🎯 Articles pertinents et ciblés
- 🔄 Mise à jour automatique

## 📋 Prérequis

| Logiciel | Version minimale | Description |
|----------|-----------------|-------------|
| Node.js | v16.0.0 | Environnement d'exécution |
| npm/yarn | dernière version | Gestionnaire de paquets |
| Navigateur | Chrome/Firefox/Edge récent | Pour l'interface utilisateur |

## 🛠️ Installation

### 1️⃣ Cloner le dépôt

```bash
# Cloner le dépôt
git clone https://github.com/Eloura74/fileStlGestion.git

# Accéder au dossier
cd fileStlGestion
```

### 2️⃣ Installation des dépendances

<details>
<summary>📦 Installation à la racine</summary>

```bash
npm install
```
</details>

<details>
<summary>📦 Installation du serveur</summary>

```bash
cd src/server
npm install
cd ../..
```
</details>

### 3️⃣ Configuration

#### 📝 Création du fichier .env

Créez un fichier `.env` à la racine du projet :

```env
# API Key pour les actualités
VITE_NEWSAPI_KEY=votre_clé_api_ici

# Chemin des fichiers STL (Backend)
BASE_WATCH_DIRS="C:/Users/votre_nom/Documents/fichiers3d"

# Chemin des fichiers STL (Frontend)
VITE_BASE_WATCH_DIRS="C:/Users/votre_nom/Documents/fichiers3d"
```

#### ⚙️ Points importants
- 🔑 Obtenir une clé API sur [NewsAPI.org](https://newsapi.org)
- 📁 Utiliser des slashes normaux (`/`) dans les chemins
- 🎯 Les deux variables `*WATCH_DIRS` doivent être identiques

### 4️⃣ Lancement de l'application

#### 🖥️ Démarrer le Backend

```bash
# Dans le dossier src/server
cd src/server
npm run dev

# Le serveur démarre sur http://localhost:3001
```

#### 🌐 Démarrer le Frontend

```bash
# Dans un nouveau terminal, à la racine
npm run dev

# L'application démarre sur http://localhost:5173
```

## 📖 Documentation

### 🔧 Architecture

```
fileStlGestion/
├── src/
│   ├── components/     # Composants React
│   ├── pages/         # Pages de l'application
│   ├── hooks/         # Hooks personnalisés
│   ├── contexts/      # Contextes React
│   └── server/        # Serveur Express
├── public/            # Fichiers statiques
└── .env              # Configuration
```

### 🌐 Points d'accès

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| Frontend | http://localhost:5173 | 5173 | Interface utilisateur |
| Backend | http://localhost:3001 | 3001 | API REST |
| API Docs | http://localhost:3001/api-docs | 3001 | Documentation Swagger |

### 📡 API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/models` | GET | Liste tous les modèles |
| `/api/models/:id` | GET | Détails d'un modèle |
| `/api/models/:id` | PUT | Met à jour un modèle |
| `/api/models/:id` | DELETE | Supprime un modèle |

## 🚨 Dépannage

### 🔍 Problèmes courants

<details>
<summary>📁 Les fichiers STL ne s'affichent pas</summary>

1. Vérifiez les chemins dans `.env`
2. Assurez-vous que le backend est lancé
3. Vérifiez les logs du serveur
4. Testez l'accès aux fichiers manuellement
</details>

<details>
<summary>📰 Les actualités ne s'affichent pas</summary>

1. Vérifiez votre clé NewsAPI
2. Contrôlez la variable `VITE_NEWSAPI_KEY`
3. Vérifiez la console du navigateur
4. Testez l'API directement
</details>

<details>
<summary>🌐 Erreurs de connexion</summary>

1. Vérifiez que les ports 3001 et 5173 sont libres
2. Redémarrez les serveurs
3. Vérifiez votre pare-feu
4. Testez avec `curl` ou Postman
</details>

## 🔧 Personnalisation

### 🎨 Thèmes
- Modifiez `tailwind.config.js` pour personnaliser les couleurs
- Ajustez les styles dans `src/styles`
- Créez vos propres thèmes dans `themes/`

### ⚙️ Configuration
- Modifiez les paramètres dans `src/config/`
- Ajustez les limites d'API dans `api.config.js`
- Personnalisez les filtres dans `filters.config.js`

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment participer :

1. 🍴 Forkez le projet
2. 🌿 Créez une branche (`git checkout -b feature/AmazingFeature`)
3. 💾 Committez vos changements (`git commit -m 'Add: Amazing Feature'`)
4. 📤 Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. 🔄 Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [Three.js](https://threejs.org/) - Visualisation 3D
- [React](https://reactjs.org/) - Interface utilisateur
- [Tailwind CSS](https://tailwindcss.com/) - Styles
- [NewsAPI](https://newsapi.org/) - Flux d'actualités
- [Vite](https://vitejs.dev/) - Build tool
- [Express](https://expressjs.com/) - Serveur backend

---

<div align="center">

Développé avec ❤️ par [Eloura74](https://github.com/Eloura74)

</div>
