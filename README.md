# Gestion STL V2 - Gestionnaire de Fichiers 3D

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

<div align="center">
  <img src="./src/assets/logo.png" alt="Logo Gestion STL V2" width="200"/>
  <h3>Une Solution Moderne pour la Gestion de vos Fichiers STL</h3>
</div>

---

<details open>
<summary><h2>📚 Table des Matières</h2></summary>

- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [💡 Fonctionnalités](#-fonctionnalités)
- [⚙️ Installation Détaillée](#️-installation-détaillée)
- [🏗️ Architecture du Projet](#️-architecture-du-projet)
- [📡 API Reference](#-api-reference)
- [🛠️ Guide de Développement](#️-guide-de-développement)
- [🔍 Visualisation 3D](#-visualisation-3d)
- [🐛 Dépannage](#-dépannage)
- [📦 Mises à Jour](#-mises-à-jour)

</details>

## 🚀 Démarrage Rapide

```bash
# Cloner le projet
git clone https://github.com/votre-repo/Gestion-Stl-V2.git

# Installer les dépendances
cd fileStlGestion
npm install

# Démarrer les serveurs (dans deux terminaux différents)
npm run dev        # Frontend - http://localhost:5173
node server.js     # Backend  - http://localhost:5000
```

## 💡 Fonctionnalités

<details open>
<summary><b>Caractéristiques Principales</b></summary>

- 📁 **Gestion de Fichiers STL**
  - Upload de fichiers STL
  - Prévisualisation 3D interactive
  - Organisation par catégories
  - Système de tags

- 🔍 **Recherche Avancée**
  - Filtrage par type
  - Filtrage par catégorie
  - Recherche par date
  - Recherche textuelle

- 👁️ **Visualisation**
  - Rendu 3D temps réel avec Three.js
  - Rotation et zoom
  - Contrôles intuitifs
  - Mode plein écran

- 📊 **Gestion des Métadonnées**
  - Description des modèles
  - Historique des modifications
  - Tags personnalisés
  - Catégorisation

</details>

## ⚙️ Installation Détaillée

<details open>
<summary><b>Prérequis</b></summary>

- Node.js >= 18.0.0
- npm >= 8.0.0
- Git
- Navigateur moderne (Chrome, Firefox, Edge)

</details>

<details open>
<summary><b>Configuration de l'Environnement</b></summary>

1. **Installation des Dépendances Frontend**
```bash
npm install @react-three/drei@9.121.4 @react-three/fiber@8.17.14 
npm install three@0.173.0 @types/three@0.173.0
npm install tailwindcss@4.0.6 @tailwindcss/vite@4.0.6
npm install framer-motion@12.4.2 react-icons@5.4.0
```

2. **Installation des Dépendances Backend**
```bash
npm install express@4.21.2 cors@2.8.5
npm install date-fns@4.1.0 path@0.12.7
```

3. **Configuration de Tailwind**
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#007AFF",
        secondary: "#6B7280",
      },
    },
  },
  plugins: [],
};
```

</details>

## 🏗️ Architecture du Projet

<details open>
<summary><b>Structure des Dossiers</b></summary>

```
fileStlGestion/
├── src/
│   ├── components/
│   │   ├── filter/          # Composants de filtrage
│   │   ├── modeles/         # Gestion des modèles 3D
│   │   ├── previewSTL/      # Visualisation 3D
│   │   └── recents/         # Fichiers récents
│   ├── server/
│   │   ├── controllers/     # Logique métier
│   │   ├── routes/          # Routes API
│   │   └── data/           # Stockage des métadonnées
│   ├── types/              # Types TypeScript
│   └── api/                # Services API
├── public/                 # Fichiers statiques
└── dist/                  # Build de production
```

</details>

## 📡 API Reference

<details open>
<summary><b>Routes Backend</b></summary>

### Gestion des Fichiers STL

```typescript
// Récupération des fichiers
GET /api/stl/files
Response: Modele[]

// Upload d'un fichier
POST /api/stl/upload
Body: FormData {
  file: File,
  metadata: {
    type: string,
    categorie: string,
    description: string,
    tags: string[]
  }
}

// Mise à jour des métadonnées
PUT /api/stl/:id
Body: {
  type?: string,
  categorie?: string,
  description?: string,
  tags?: string[]
}

// Suppression
DELETE /api/stl/:id
```

</details>

## 🛠️ Guide de Développement

<details open>
<summary><b>Bonnes Pratiques</b></summary>

### 1. Structure des Composants

```typescript
// src/components/modeles/ModeleCard.tsx
import React from 'react';
import { Modele } from '../../types/Modele';

interface Props {
  modele: Modele;
  onUpdate: (id: string, data: Partial<Modele>) => void;
}

const ModeleCard: React.FC<Props> = ({ modele, onUpdate }) => {
  // Implementation...
};
```

### 2. Gestion d'État

```typescript
// Utilisation des hooks React
const [modeles, setModeles] = useState<Modele[]>([]);
const [filtres, setFiltres] = useState<Filtres>({
  type: '',
  categorie: '',
  dateDebut: null,
  dateFin: null,
});
```

### 3. Styles Tailwind

```tsx
// Exemple de composant stylisé
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
    <div className="p-4 space-y-2">
      <h3 className="text-lg font-semibold text-gray-800">
        {modele.fileName}
      </h3>
    </div>
  </div>
</div>
```

</details>

## 🔍 Visualisation 3D

<details open>
<summary><b>Configuration Three.js</b></summary>

```typescript
// src/components/previewSTL/PreviewSTL.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';

const PreviewSTL: React.FC<{ url: string }> = ({ url }) => {
  return (
    <Canvas>
      <Stage environment="city" intensity={0.6}>
        <STLModel url={url} />
      </Stage>
      <OrbitControls autoRotate />
    </Canvas>
  );
};
```

</details>

## 🐛 Dépannage

<details open>
<summary><b>Problèmes Courants</b></summary>

### 1. Erreurs CORS
```javascript
// server.js
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));
```

### 2. Problèmes de Chargement 3D
- Vérifiez que le fichier STL est valide
- Assurez-vous que Three.js est correctement initialisé
- Vérifiez les logs de la console pour les erreurs WebGL

### 3. Problèmes de Performance
- Optimisez la taille des fichiers STL
- Utilisez la compression gzip
- Implémentez le lazy loading pour les modèles

</details>

## 📦 Mises à Jour

<details open>
<summary><b>Journal des Modifications</b></summary>

### Version 2.0.0 (Actuelle)
- ✨ Nouvelle interface utilisateur avec Tailwind CSS
- 🔄 Système de filtrage amélioré
- 🎨 Prévisualisation 3D optimisée
- 📱 Support responsive complet

### Prochaines Fonctionnalités
- [ ] Export vers différents formats
- [ ] Système de versions pour les fichiers
- [ ] Interface d'administration
- [ ] Support multi-utilisateurs

</details>

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez notre guide de contribution pour plus de détails.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

<div align="center">
  <p>Développé avec ❤️ par l'équipe Gestion STL V2</p>
  <p>Pour toute question ou support : <a href="mailto:support@gestionstl.com">support@gestionstl.com</a></p>
</div>
