const express = require('express');
const etatControlleur = require('../controller/etatController');
const router = express.Router();
router.post('/add/:idF',etatControlleur.add);
router.get('/etatFacture/:idF',etatControlleur.getEtatFacture);
module.exports = router;