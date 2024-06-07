const { spawn } = require('child_process');
const fs = require('fs');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const Facture = require('../models/Facture');
const pdfPoppler = require('pdf-poppler');
const Bordereau =require('../models/Bordereau');
const Pieces_jointe = require('../models/PiecesJointe');
const Etat = require('../models/Etat');
const { authenticateToken } = require('../utils/jwt');
authorizeSupplier = authenticateToken(['fournisseur']);
authorizePersonnelbof = authenticateToken(['bof']);
authorizePersonnelFiscaliste = authenticateToken(['personnelfiscalite']);
authorizeAgent = authenticateToken(['agentTresorerie']);
authorizePersonnel = authenticateToken(['personnelfiscalite','bof','agentTresorerie']);
authorize = authenticateToken(['fournisseur','bof']);
const Excel = require('exceljs');
require('../AutoBordereaux');
const path = require('path');
const { where } = require('sequelize');
const { Sequelize } = require('sequelize');
let io;
const { Op } = require('sequelize');
const pdfkit = require('pdfkit');
const  {sequelize}  = require('../database');
const synaptic = require('synaptic');
const Reclamation = require('../models/Reclamation');


// définit la configuration de Multer pour le téléchargement de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // specifier la destination de fichier et comment doit etre nommé
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // utilise le nom original de fichier 
  }
});
//creation d'instance multer 
const upload = multer({ storage: storage }).single('factureFile');


const generateExcel = async (factures) => {
  // Création d'un nouveau classeur Excel
  const workbook = new Excel.Workbook();
  // Ajout d'une feuille de calcul au classeur avec le nom 'Factures'
  const worksheet = workbook.addWorksheet('Factures');
  // Définition des en-têtes pour le fichier Excel
  worksheet.columns = [
    { header: 'Facture ID', key: 'idF', width: 10 },
    { header: 'Numéro Facture', key: 'num_fact', width: 20 },
    { header: 'Facture Name', key: 'factname', width: 30 },
    { header: 'Montant', key: 'montant', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Numéro PO', key: 'num_po', width: 20 },
    { header: 'Date Facture', key: 'date_fact', width: 20 }
    
  ];

  // Ajout des données au fichier Excel
  factures.forEach((facture) => {
    worksheet.addRow({
      idF: facture.idF,
      num_fact: facture.num_fact,
      factname: facture.factname,
      montant: facture.montant,
      status: facture.status,
      num_po: facture.num_po,
      date_fact: facture.date_fact
      
    });
  });

  // Génération du tampon (buffer) du fichier Excel
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

//créer et entrainer un reseau de neurons pour  
async function trainNeuralNetwork() {
  try {
    // definir l'architecture 
    const perceptron = new synaptic.Architect.Perceptron(1, 3, 1);

    //Definir les données a entrainer
    const trainingData = [
      { input: [0], output: [0] },
      { input: [0.5], output: [0.5] },
      { input: [1], output: [1] }
    ];

    // entaine le reseau de neurons
    const trainer = new synaptic.Trainer(perceptron);
    trainer.train(trainingData);

    
    return perceptron;
  } catch (error) {
    console.error('erreur lors de entrainement de reseau des neurons', error);
    throw error;
  }
}

async function collectAndAnalyzeData() {
  try {
    //recuper tous les factures
    const allFactures = await Facture.findAll();

    //recuper les reclamations
   
 //calculer le nombre total de factures

const allReclamation = await Reclamation.findAll();
    // Calculate the total number of invoices

    const totalFactures = allFactures.length;

    // compter le nombre des factures traiter
    const treatedFactures = allFactures.filter(facture => facture.status !== 'Attente').length;
    
 


    // compter les nombres des factures par leurs status

    const numReclamations = allReclamation.filter(reclamation => reclamation.lue === false).length;
    const numReclamationsLue = allReclamation.filter(reclamation => reclamation.lue === true).length;

    // Count the number of invoices by their status

    let NBFValide = 0;
    let NBFpaye = 0;
    let NBFAttente = 0;
    let NBFrejete = 0;

    allFactures.forEach((facture) => {
      if (facture.status.toLowerCase().includes('validé')) {
        NBFValide++;
      } else if (facture.status === 'Payé') {
        NBFpaye++;
      } else if (facture.status === 'Attente') {
        NBFAttente++;
      } else if (facture.status.toLowerCase().includes('rejeté')) {
        NBFrejete++;
      }
    });

    // Retorne les donnée analyser
    return {
      totalFactures,
      treatedFactures,
      numReclamations,
      numReclamationsLue,
      NBFValide,
      NBFpaye,
      NBFAttente,
      NBFrejete
    };
  } catch (error) {
    console.error('erruer de collection et analyse de données:', error);
    throw error;
  }
}



async function generateReportFromData(analyzedData, neuralNetwork) {
  try {
    const allFactures = await Facture.findAll();
   
    const treatedFactures = allFactures.filter(facture => facture.status !== 'Attente').length;

   
    const totalFactures = allFactures.length;
    const percentageTreated = treatedFactures / totalFactures;
    // utilisation de reseau de neurones pour la prediction de la perfermance de personnel 
    const prediction = neuralNetwork.activate([percentageTreated])[0];
    const personnelPerformance = prediction > 0.5 ? 'Bien' : 'Besoin amélioration';
    const {
     
      
      numReclamations,
      numReclamationsLue,
      NBFValide,
      NBFpaye,
      NBFAttente,
      NBFrejete
    } = await collectAndAnalyzeData();
   
    // genérer le contenue de rapport
    const reportContent = `
                                                        Rapport 

      Introduction :
Ce rapport offre une analyse approfondie de la situation financière actuelle de l'entreprise, mettant en lumière le traitement des factures, ainsi que les réclamations en cours et résolues.

Résumé des Données :

Total des Factures : ${totalFactures} : Nombre total de factures enregistrées dans le système.
Factures Traitées : ${treatedFactures} : Nombre de factures traitées et enregistrées comme traitées dans le système.
Factures Validées : ${NBFValide} : Nombre de factures validées pour le paiement.
Factures Payées : ${NBFpaye} : Nombre de factures pour lesquelles le paiement a été effectué.
Factures en Attente : ${NBFAttente} : Nombre de factures en attente de validation ou de paiement.
Factures Rejetées : ${NBFrejete} : Nombre de factures rejetées en raison d'erreurs ou d'incohérences.
Réclamations en Cours : ${numReclamations} : Nombre total de réclamations actuellement en cours de traitement.
<<<<<<< HEAD
Réclamations Résolues : ${numReclamationsLue} : Nombre total de réclamations qui ont été lue par bureau d'ordre.
=======
Réclamations Résolues : ${numReclamationsLue} : Nombre total de réclamations qui ont été lue par bureau d'ordre.

La Performance du Personnel : ${personnelPerformance} : Évaluation de la performance du personnel impliqué dans le processus de gestion des factures et des réclamations.
Analyse des Réclamations :
Les réclamations en cours représentent un défi majeur pour l'entreprise, nécessitant une intervention immédiate pour éviter les litiges avec les fournisseurs. Un nombre élevé de réclamations en cours peut indiquer des problèmes dans le processus de traitement des factures ou des erreurs dans les transactions.

Conclusion :
En résumé, ce rapport met en évidence les principaux défis rencontrés par l'entreprise dans la gestion des factures et des réclamations. Il souligne l'importance de l'amélioration des processus internes pour garantir un traitement rapide et efficace des factures, ainsi que la résolution rapide des réclamations afin de maintenir de bonnes relations avec les fournisseurs et d'assurer la stabilité financière de l'entreprise.

   Merci pour votre attention
    `;


    return reportContent;
  } catch (error) {
    console.error('Erreur de generation de rapport :', error);
    throw error;
  }
}
async function generatePDF(reportContent) {
  try {
    return new Promise((resolve, reject) => {
      // Crée un document pdf 
      const doc = new pdfkit();

      // Stocker le pdf dans le memoire 
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        console.log('PDF generer avec succée');
        
        resolve(pdfData);
      });

      
      doc.fontSize(12);
      doc.text(reportContent);

     
      doc.end();
    });
  } catch (error) {
    console.error('Erreur de generation de rapport', error);
    throw error;
  }
}
const factureController = {
  upload: [authorize, async (req, res) => {
    // Appel de l'upload qui est l'instance de multer
    upload(req, res, err => {
      if (err) {
        return res.status(400).json({ message: 'erreur de telechargement ', error: err });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'aucun fichier téléchargé' });
      }
      console.log(req.file);
      console.log(req.file.originalname);
      // Convertir PDF en image
      const pdfFilePath = req.file.path;
      const outputImagePath = './uploads/';
      pdfPoppler.convert(pdfFilePath, { format: 'png', out_dir: outputImagePath, prefix: 'uploads' })
        .then(() => {
          // Reconnaissance optique des caractères (OCR)
          Tesseract.recognize(`${outputImagePath}uploads-1.png`, 'fra', {
            logger: m => console.log(m)
          }).then(({ data: { text } }) => {
            // Extraire les informations nécessaires de l'OCR
            const extractedInfo = extractInfoFromOCR(text);

            Facture.findOne({ where: { num_fact: extractedInfo.num_fact } }).then(facture => {
              if (!facture) {
                // Renvoyer les informations au client pour leur validation
                res.json({ success: true, extractedInfo });
              } else {
                // Le numéro de facture existe déjà, afficher un message d'erreur
                res.status(400).json({ message: 'facture deja existe' });
              }
            }).catch(err => {
              console.error(err);
              res.status(500).json({ message: 'erreur de recuperation de facture', error: err });
            });
          }).catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Erreur ORC', error: err });
          });
        }).catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Erreur de conversion de pdf a image ', error: err });
        });
    });
  }],


  save: [authorize,async (req, res) => {
    const { factname, devise, nature, objet, num_po, datereception, num_fact, montant, date_fact,pathpdf } = req.body;
    const iderp = req.params.iderp;

    try {
       

        // Créer une facture
        const facture = await Facture.create({
            iderp,
            factname,
            devise,
            nature,
            objet,
            num_po,
            datereception,
            num_fact,
            date_fact,
            montant,
            pathpdf
        });

         //trouver ou crée un bordereau associé
         const [bordereau, created] = await Bordereau.findOrCreate({
          where: { nature, date: datereception },
      });
        // Associer la facture avec un bordereau
        await facture.setBordereau(bordereau);

        const { idF } = facture;
        await Etat.create({idF: idF,date:new Date() });
        res.json({ success: true, facture: { ...facture.toJSON(), idF } });
        console.log('facture enregistrer avec succée.');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur denregistrement ', error: error });
    }
}],


  deleteFacture:[authorize,async (req, res) => {
    try {
        const { fournisseurId, factureId } = req.params;
        const facture = await Facture.findOne({ where: { idF: factureId, iderp: fournisseurId } });
        if (!facture) {
            return res.status(404).json({ message: 'facture non existante ' });
        } 
        if (facture.pathpdf) {
            fs.unlinkSync(facture.pathpdf);
           
        }
        await facture.destroy();
        res.json({ success: true, message: 'Facture supprimer avec succée' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur de suppression', error: error });
    }
},
  ],


getFactureById: async (req, res) => {
    try {
      const { idF } = req.params;
      const facture = await Facture.findOne({ where: { idF: idF },
         include: [{ model: Pieces_jointe, as: 'Pieces_jointes'} , {model:Etat}] });

      if (!facture) {
        return res.status(404).json({ message: 'Facture non trouvé ' });
      }

      res.json({ success: true, facture });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur de recuperation de facture par id', error: error });
    }
  },


getAllFacture: async (req, res) => {
    try {
      const factures = await Facture.findAll({ include: { model: Pieces_jointe, as: 'Pieces_jointes' } });
      res.json({ success: true, factures });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur de recuperation de facture', error: error });
    }
  },
   
getFactureBySupplierId: async (req, res) => {
    try {
        const { iderp } = req.params;
        const factures = await Facture.findAll({ where: { iderp } , include: [{ model: Pieces_jointe, as: 'Pieces_jointes'} , {model:Etat}] });

        if (!factures || factures.length === 0) {
            return res.status(404).json({ message: 'non facture trouvé avec ce fournisseurid' });
        }

        res.json({ success: true, factures });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur de recuperation de facture par fournisseurid', error: error });
    }
},


ExportFacturetoExcel:[authorizeSupplier,async (req, res) => {
  try {
      
      const factures = req.body.factures; 

      
      const excelBuffer = await generateExcel(factures);

   
      res.status(200)
          .attachment('factures.xlsx')
          .send(excelBuffer);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur de generation de fichier excel', error: error });
  }
}],


getNbrFacturesByStatus: async (req, res) => {
  try {
    // Récupérer les données des factures de fournisseur
    const { iderp } = req.params;
    const factures = await Facture.findAll({ where: { iderp } });
    
    
    // Initialiser les compteurs pour chaque catégorie de factures
    let NBFValide = 0;
    let NBFpaye = 0;
    let NBFAttente = 0;
    let NBFrejete = 0;

    // Compter le nombre de factures dans chaque catégorie
    factures.forEach((facture) => {
      if (facture.status.toLowerCase().includes('validé')) {
        NBFValide++;
      } else if (facture.status === 'Payé') {
        NBFpaye++;
      } else if (facture.status === 'Attente') {
        NBFAttente++;
      } else if (facture.status.toLowerCase().includes('rejeté')) {
        NBFrejete++;
      }
    });

    // Retourner les nombres de factures dans chaque catégorie
    return res.status(200).json({
      NBFValide,
      NBFpaye,
      NBFAttente,
      NBFrejete
    });
  } catch (error) {
    console.error('erreur de recuperation des factures:', error);
    return res.status(500).json({ error: 'erreur interne de serveur' });
  }
},


viewFacturePDF: async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);

   
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filePath);
  } catch (error) {
    console.error('erreur d overture de fichier pdf :', error);
    res.status(500).json({ message: 'erreur d overture de fichier pdf :', error: error });
  }
},


updateFacture :[authorize, async (req, res) => {
  try {
    const { idF } = req.params;

    const facture = await Facture.findOne({ where: { idF } });
    if (!facture) {
      return res.status(404).json({ message: 'Facture non trouvé' });
    }
    const { pathpdf: newFilePath, ...factureData } = req.body;

  
        const oldFilePath = facture.pathpdf; 

      // Mettre à jour les autres données de la facture
      await Facture.update({ pathpdf: newFilePath,status: "Attente", ...factureData }, { where: { idF } }); 

      if (newFilePath !== oldFilePath) {
        fs.unlinkSync(oldFilePath); // Supprimez l'ancien fichier PDF
      }

    res.json({ message: 'Facture mise a jour avec succée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}],


getFacturesStatistique: async (req, res) => {
  try {
    //compter le facture par nature 
    const  nbFactureParNature = await Facture.count({
      attributes: ['nature'], 
      group: ['nature'] 
    });
    const nbFactureParType=await Facture.count();
    // Compter toutes les factures
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); 
    
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0); 
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59); 
    
    const nbFactureRecuHier = await Facture.count({ 
      where: { 
        createdAt: { 
          [Sequelize.Op.between]: [startOfYesterday, endOfYesterday] 
        } 
      } 
    }); // Compter les factures reçues au cours des dernières 24 heures
    // Ajuster la requête suivante en fonction de votre modèle de données
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const nbFactureMoisEnCours = await Facture.count({ 
      where: { 
        createdAt: { 
          [Sequelize.Op.gte]: startOfMonth 
        } 
      } 
    }); // Compter les factures créées dans le mois en cours
    // Envoyer les statistiques en tant que réponse JSON
    res.json({
      nbFactureParNature,
      nbFactureParType,
      nbFactureRecuHier,
      nbFactureMoisEnCours
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de facturation:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
},


validerDocument:[authorizePersonnelbof, async (req,res) =>{
  try{
const {idF} = req.params;
const facture = await Facture.findByPk(idF);
if(!facture){
  return res.status(404).json({ message: 'Facture non existante' });
}
if(facture.status== 'Attente'){
  const dateVerifi = new Date().toISOString().slice(0, 10);
  const validStatut = `courrier validé par BOF, date de vérification : ${dateVerifi}`;
await Facture.update({ status: validStatut,}, { where: { idF } });
await Etat.create({ etat:validStatut, idF: idF, date: dateVerifi });
factureController.sendNotificationToSupplier(validStatut,facture.num_fact);

}
else {
  console.log("Le courrier a déjà été examiné.")
}
} catch(error){
  res.status(500).json({ message: 'Erreur interne du serveur' });
}
}],


validerFiscalité:[authorizePersonnelFiscaliste, async (req,res) =>{
  try{
  const {idF} = req.params;
  const facture = await Facture.findByPk(idF);
  if(!facture){
    return res.status(404).json({ message: 'Facture non existante' });}
    const dateVerifi = new Date().toISOString().slice(0, 10);
  const validStatut = `courrier validé par Personnel fiscalité, date de vérification : ${dateVerifi}`;
  await Facture.update({ status: validStatut,}, { where: { idF } });
  await Etat.create({ etat:validStatut, idF: idF, date: dateVerifi });
  factureController.sendNotificationToSupplier(validStatut,facture.num_fact);

} catch(error){
  res.status(500).json({ message: 'Erreur interne du serveur' });
}
  }],


validerBudget:[authorizeAgent,async (req,res) =>{
  try{
    const {idF} = req.params;
    const facture = await Facture.findByPk(idF);
    if(!facture){
      return res.status(404).json({ message: 'Facture non existante' });}
      const dateVerifi = new Date().toISOString().slice(0, 10);
    const validStatut = `courrier validé par Agent Trésorerie, date de vérification : ${dateVerifi}`;
    await Facture.update({ status: validStatut,}, { where: { idF } });
    await Etat.create({ etat:validStatut, idF: idF, date: dateVerifi });
    factureController.sendNotificationToSupplier(validStatut,facture.num_fact);

  } catch(error){
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
    }],


 rejeterCourriers : [authorizePersonnel,async (req, res) => {
      try {
        const { idF } = req.params;
        const { motifRejete } = req.body;
       
        const facture = await Facture.findByPk(idF);
        
        if (!facture) {
          return res.status(404).json({ message: 'Facture non existante' });
        }
    
        
        const dateVerifi = new Date().toISOString().slice(0, 10);
        const motifRejeteAvecDate = `rejeté ${motifRejete}, date de vérification : ${dateVerifi}`;
        await facture.update({ status: motifRejeteAvecDate });
        await Etat.create({ etat:motifRejete, idF: idF, date: dateVerifi });
        factureController.sendNotificationToSupplier(motifRejeteAvecDate,facture.num_fact);
       
        res.json({ message: 'la status est mis a jour avec succée' });
      } catch (error) {
        // If an error occurs, return a 500 internal server error
        console.error('Erreur dans rejeterCourriers:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
      }
    }],

/*rechercheParNumFact: async (req, res) => {
      try {
          const { num_fact } = req.query; 
          const factures = await Facture.findOne({
              where: {
                num_fact: num_fact
              },
              include: { model: Pieces_jointe, as: 'Pieces_jointes' }
          });
          console.log(factures);
          res.json(factures);
      } catch (error) {
          console.error(error);
          res.status(500).send('Erreur de serveur');
      }
  },
recherchePardate: async (req, res) => {
    try {
        const { datereception } = req.query; 
        const factures = await Facture.findAll({
            where: {
              datereception: datereception
            },
            include: { model: Pieces_jointe, as: 'Pieces_jointes' }
        });
        console.log(factures);
        res.json(factures);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur de serveur');
    }
},*/


rechercheFacture: async (req, res) => {
  try {
      const { num_fact, datereception } = req.query;
      let whereClause = {};
      // filter les resultats des parametres fournir
      if (num_fact && datereception) {
           
          whereClause = {
              num_fact: num_fact,
              datereception: datereception
          };
      } else if (num_fact) {
          
          whereClause = { num_fact: num_fact };
      } else if (datereception) {
          
          whereClause = { datereception: datereception };
      }

      const facture = await Facture.findOne({
          where: whereClause,
          include: { model: Pieces_jointe, as: 'Pieces_jointes' }
      });

     
      res.json(facture);
  } catch (error) {
      console.error(error);
      res.status(500).send('Erreur interne du serveur');
  }
},
//compte les factures traiter chaque jour de mois courrant
FactureTraiteParMois: async (req, res) => {
  try {
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Determine le debut et la fin de mois courrant 
    const debutdeMois = new Date(currentYear, currentMonth, 1);
    const finduMois = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // compter les factures traitées pour chaque jour du mois en cours
    const facturetraiterparjour = await Facture.findAll({
      attributes: [
        [sequelize.fn('date', sequelize.col('updatedAt')), 'date'],
        [sequelize.fn('count', sequelize.col('*')), 'count']
      ],
      where: {
        updatedAt: {
          [Sequelize.Op.between]: [debutdeMois, finduMois]
        },
        status: {
          [Sequelize.Op.not]: 'Attente'
        }
      },
      group: [sequelize.fn('date', sequelize.col('updatedAt'))]
    });

   
    const factures = facturetraiterparjour.map(item => ({
      date: item.get('date'),
      count: item.get('count')
    }));

    
    res.json({ factures });
  } catch (error) {
    console.error('Error calculating processed invoices for the current month:', error);
    res.status(500).json({ error: 'An error occurred while calculating processed invoices for the current month.' });
  }
},

genererRapports: async (req, res) => {
  try {
    // entrainement de reseau de neurones
    console.log('entrainement de reseau de neurones...');
    const neuralNetwork = await trainNeuralNetwork();

    // collection et analyse de donnée
    console.log(' collection et analyse de donnée..');
    const analyzedData = await collectAndAnalyzeData();
    console.log('donnée analysé:', analyzedData);

    // generation de rapport 
    console.log('generation de rapport ...');
    const reportContent = await generateReportFromData(analyzedData, neuralNetwork);

    
    const pdfData = await generatePDF(reportContent);

    console.log('rapport generer avec succée.');

   
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    res.send(pdfData); 
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
},


sendNotificationToSupplier: (statuts, num) => {
  io.emit('newStatuts', { statuts, num });
},
setIo: (socketIo) => {
  io = socketIo;
}   
};
// Fonction pour extraire les information de l'ORC
function extractInfoFromOCR(text) {
    
  const num_factRegex = /(?:N°\s*facture|Numéro\s*facture|Facture\s*N°|N°\s*facture|Numéro\s*de\s*facture)\s*(\d+)/i;
    const dateFactRegex = /(?:Date\s*:\s*|Date\s*de\s*facture\s*:\s*)(\w+)/i;
    const montantRegex = /(?:Montant\s*Total\s*TTC\s*|Montant\s*:\s*)(\d+(\.\d{1,2})?)/i;
  
    
    const num_factMatch = text.match(num_factRegex);
    const dateFactMatch = text.match(dateFactRegex);
    const montantMatch = text.match(montantRegex);
  
   
    const num_fact = num_factMatch ? num_factMatch[1] : null;
    const date_fact= dateFactMatch ? dateFactMatch[1] : null;
    const montant= montantMatch ? parseFloat(montantMatch[1]) : null
   
    console.log(text);
    return { num_fact, date_fact, montant };
    
  }
  

module.exports = factureController;