const express = require('express');
const router = express.Router();
const reclamationController = require('../controller/reclamationController');

module.exports = (io) => {
 
  router.post('/envoyer/:iderp', reclamationController.envoyer);
  //router.get('/new/count', reclamationController.getNewReclamationsCount); // Corrected method name
  router.get('/', reclamationController.getAll);
router.get('/:id',reclamationController.getbyid);
router.delete('/:id', reclamationController.deleteReclamation);
router.get('/fournisseur/:iderp',reclamationController.getReclamationBySupplierId);
  // Pass the io instance to the controller
  reclamationController.setIo(io);

  return router;
};
