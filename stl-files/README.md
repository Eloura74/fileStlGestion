# Dossier STL-Files

Ce dossier contient tous les fichiers STL et leurs métadonnées associées pour le projet de gestion de fichiers 3D.

## Structure du dossier

```
stl-files/
├── *.STL, *.stl         # Fichiers STL (modèles 3D)
└── *.metadata.json      # Fichiers de métadonnées associés
```

## Format des métadonnées

Chaque fichier STL a un fichier de métadonnées JSON associé avec le même nom. Par exemple :
- `modele.stl`
- `modele.metadata.json`

Le fichier de métadonnées contient les informations suivantes :
```json
{
    "nom": "Nom du modèle",
    "description": "Description du modèle",
    "dimensions": {
        "x": 0,
        "y": 0,
        "z": 0
    },
    "dateCreation": "YYYY-MM-DD",
    "auteur": "Nom de l'auteur",
    "parametresImpression": {
        "temperature": 0,
        "vitesse": 0,
        "remplissage": 0
    }
}
```

## Note importante
Ce dossier est ignoré par Git (.gitignore) pour éviter de surcharger le dépôt avec des fichiers binaires volumineux. Assurez-vous de sauvegarder vos fichiers STL et métadonnées ailleurs.
