const fs = require('fs');
const path = require('path');
const Facture = require('../models/Facture');
const Etat = require('../models/Etat');
const Archive = require('../models/Archive');
const { where } = require('sequelize');

const archiveController = {
  archiver: async (req, res) => {
    try {
      //rècupére les facture et inclure son model etat filtrer par etat 
      const facturesCloturees = await Facture.findAll({
        include: [{ model: Etat, where: { etat: 'cloture' } }],
      });
      //crée un objet pour stocker les chemin d'archive par année
      const archivesByYear = {};
    //traité  chaque facture dans un boucle for
      for (const facture of facturesCloturees) {
        const etats = await facture.getEtats();
        //trouver les propieté etat cloturé dans l'objet etat
        const clotureEtat = etats.find(etat => etat.etat === 'cloture');
        
        //recupere l'année de l'etat cloture de son date 
        if (clotureEtat) {
          const anneeCloture = new Date(clotureEtat.date).getFullYear();
// créaction des répetoire par année         //cree un chemin avec l'année de l'etat si n'existe pas 
          if (!archivesByYear[anneeCloture]) {
            archivesByYear[anneeCloture] = {
              annee: anneeCloture,
              path: path.join(__dirname, '..', 'archives', `${anneeCloture}`),
            };
          }
        //cree un dossier selon le chemin si le dossier n'existe pas 
          const archiveDir = archivesByYear[anneeCloture].path;
          if (!fs.existsSync(archiveDir)) {
            fs.mkdirSync(archiveDir, { recursive: true });
          }

          const oldPath = path.join(__dirname, '..', facture.pathpdf);

          const newPath = path.join(archiveDir, `${facture.num_fact}.pdf`);

          try {
            if (fs.existsSync(oldPath)) {
              fs.copyFileSync(oldPath, newPath); // Copie du fichier
              console.log(`Déplacement réussi de ${oldPath} vers ${newPath}`);
            } else {
              console.error(`Le fichier ${oldPath} n'existe pas.`);
            }
          } catch (error) {
            console.error(`Erreur lors du déplacement de ${oldPath} vers ${newPath}:`, error);
          }
        }
      }

      for (const key in archivesByYear) {
        const archiveData = archivesByYear[key];
        /*const facturesArchiver = await Facture.findAll({
          include: [{ model: Etat, where: { etat: 'cloture' } }],
        });*/

        const [archive, created] = await Archive.findOrCreate({
          where: { annee: archiveData.annee },
          defaults: archiveData
        });

        await Promise.all(facturesCloturees.map(async (facture) => {
          facture.id = archive.id;
          await facture.save();
        }));
      }

      console.log('Archivage des factures terminé avec succès.');
      res.status(200).send('Archivage des factures terminé avec succès.');
    } catch (error) {
      console.error('Erreur lors de l\'archivage des factures :', error);
      res.status(500).send('Erreur lors de l\'archivage des factures.');
    }
  },

  //recuperer l'archive par année
getArchiveByYear: async (req, res) => {
    try {
      const { annee } = req.params; 
      const archive = await Archive.findOne({
        where: { annee: annee },
        include: { model: Facture }, 
      });

      if (!archive) {
        return res.status(404).json({ error: 'Archive non trouvé' });
      }

      res.json(archive);
    } catch (error) {
      console.error('Erreur lors de l\'accès des factures archivées :', error);
      res.status(500).send('Erreur lors de l\'accès des factures archivées.');
    }
  },
  getArchive: async (req, res) => {
    try {
      const archive = await Archive.findAll({
        include: { model: Facture }, 
      });
      res.json(archive);
    } catch (error) {
      console.error('Erreur lors de l\'accès des factures archivées :', error);
      res.status(500).send('Erreur lors de l\'accès des factures archivées.');
    }
  },

};

module.exports = archiveController;
