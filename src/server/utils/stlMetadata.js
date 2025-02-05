const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

class GestionSTL {
    constructor(dossierStl, dossierSource = null) {
        this.dossierStl = dossierStl;
        this.dossierSource = dossierSource;
        this.dossierMetadata = path.join(dossierStl, 'metadata');
        this.dossierSourceMetadata = dossierSource ? path.join(dossierSource, 'metadata') : null;
        
        if (!fsSync.existsSync(this.dossierMetadata)) {
            fsSync.mkdirSync(this.dossierMetadata, { recursive: true });
        }
        if (this.dossierSourceMetadata && !fsSync.existsSync(this.dossierSourceMetadata)) {
            fsSync.mkdirSync(this.dossierSourceMetadata, { recursive: true });
        }
    }

    async listeFichiersStl() {
        const fichiers = await fs.readdir(this.dossierStl);
        return fichiers.filter(fichier => fichier.toLowerCase().endsWith('.stl'));
    }

    async creerMetadata(nomFichier) {
        const cheminStl = path.join(this.dossierStl, nomFichier);
        const stats = await fs.stat(cheminStl);

        const metadata = {
            nom: nomFichier,
            taille_bytes: stats.size,
            date_modification: stats.mtime.toISOString(),
            description: '',
            categorie: '',
            theme: 'autre',
            tags: [],
            auteur: '',
            date_creation: new Date().toISOString(),
            parametres_impression: {
                materiau: '',
                epaisseur_couche: '',
                remplissage: '',
                support: false
            }
        };

        const nomJson = `${path.parse(nomFichier).name}.json`;
        const cheminJson = path.join(this.dossierMetadata, nomJson);
        
        await fs.writeFile(cheminJson, JSON.stringify(metadata, null, 4), 'utf-8');

        // Si un dossier source est défini, créer aussi les métadonnées là-bas
        if (this.dossierSourceMetadata) {
            const cheminSourceJson = path.join(this.dossierSourceMetadata, nomJson);
            await fs.writeFile(cheminSourceJson, JSON.stringify(metadata, null, 4), 'utf-8');
        }

        return metadata;
    }

    async mettreAJourMetadata(nomFichier, nouvellesDonnees) {
        const nomJson = `${path.parse(nomFichier).name}.json`;
        const cheminJson = path.join(this.dossierMetadata, nomJson);
        const cheminSourceJson = this.dossierSourceMetadata 
            ? path.join(this.dossierSourceMetadata, nomJson)
            : null;
        
        try {
            // Lire les métadonnées existantes
            let metadata = {};
            if (fsSync.existsSync(cheminJson)) {
                const contenu = await fs.readFile(cheminJson, 'utf-8');
                metadata = JSON.parse(contenu);
            }

            // Mettre à jour les métadonnées
            const metadataMaj = {
                ...metadata,
                ...nouvellesDonnees,
                date_modification: new Date().toISOString()
            };

            // Sauvegarder dans le dossier de l'application
            await fs.writeFile(cheminJson, JSON.stringify(metadataMaj, null, 4), 'utf-8');

            // Sauvegarder dans le dossier source si défini
            if (cheminSourceJson) {
                await fs.writeFile(cheminSourceJson, JSON.stringify(metadataMaj, null, 4), 'utf-8');
            }

            return true;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour des métadonnées pour ${nomFichier}:`, error);
            return false;
        }
    }

    async initialiserTousLesFichiers() {
        const fichiers = await this.listeFichiersStl();
        for (const fichier of fichiers) {
            const nomJson = `${path.parse(fichier).name}.json`;
            const cheminJson = path.join(this.dossierMetadata, nomJson);
            const cheminSourceJson = this.dossierSourceMetadata 
                ? path.join(this.dossierSourceMetadata, nomJson)
                : null;
            
            if (!fsSync.existsSync(cheminJson) || (cheminSourceJson && !fsSync.existsSync(cheminSourceJson))) {
                await this.creerMetadata(fichier);
                console.log(`Métadonnées créées pour : ${fichier}`);
            }
        }
    }

    async getMetadata(nomFichier) {
        const nomJson = `${path.parse(nomFichier).name}.json`;
        const cheminJson = path.join(this.dossierMetadata, nomJson);
        
        try {
            if (fsSync.existsSync(cheminJson)) {
                const contenu = await fs.readFile(cheminJson, 'utf-8');
                return JSON.parse(contenu);
            }
            return null;
        } catch (error) {
            console.error(`Erreur lors de la lecture des métadonnées pour ${nomFichier}:`, error);
            return null;
        }
    }

    async synchroniserMetadonnees() {
        try {
            const fichiers = await this.listeFichiersStl();
            for (const fichier of fichiers) {
                const nomJson = `${path.parse(fichier).name}.json`;
                const cheminJson = path.join(this.dossierMetadata, nomJson);
                const cheminSourceJson = this.dossierSourceMetadata 
                    ? path.join(this.dossierSourceMetadata, nomJson)
                    : null;

                if (fsSync.existsSync(cheminJson) && cheminSourceJson) {
                    const metadata = await this.getMetadata(fichier);
                    await fs.writeFile(cheminSourceJson, JSON.stringify(metadata, null, 4), 'utf-8');
                }
            }
            return true;
        } catch (error) {
            console.error('Erreur lors de la synchronisation des métadonnées:', error);
            return false;
        }
    }
}

module.exports = GestionSTL;
