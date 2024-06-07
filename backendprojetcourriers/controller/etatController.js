const Facture = require('../models/Facture');
const Etat = require('../models/Etat');
const archiveController = require('../controller/archiveControlleur');
const fs = require('fs');

const etatController ={
  
  add: async (req,res) =>{
    try {
        const { etat } = req.body;  
          const idF = req.params.idF;
        
        const facture = await Facture.findOne({ where: { idF: idF }, include:{
          model:Etat
        } });
        if (!facture) {
          return res.status(404).json({ error: 'facture non trouvé' });
        }
        console.log(facture)

    // Vérifier si la facture a déjà cet état
    const existingEtat = facture.Etats.find(item => item.etat === etat);
    if(existingEtat){
        return res.status(400).json({ error: 'La facture est déjà à cet état' });
      }
      

      // Vérifier si la facture a déjà cet état
  
      const etats = await Etat.create({ etat, idF: idF, date: new Date});
        
        if (etat === 'cloture') {
          await archiveController.archiver(req, res);
        }
       
        console.log(`etat facture ${facture.num_fact} ajouter avec succée`);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création de la Etat' });
      }
},
    getEtatFacture: async (req,res) =>{
    try {
       const idF = req.params.idF;
       const facture = await Facture.findOne({ where: { idF: idF } });

       if (!facture) {
        return res.status(404).json({ error: 'facture non trouvé' });
      }
        const etats = await Etat.findAll({where: {
            idF:idF
        }});
        res.json(etats);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des Etats' });
      }
    }

};

module.exports = etatController;  