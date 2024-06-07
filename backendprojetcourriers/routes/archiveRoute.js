const express = require('express');
const archiveControlleur = require('../controller/archiveControlleur');
const router = express.Router();
router.post('/archiver',archiveControlleur.archiver);
router.get('/listArchive/:annee',archiveControlleur.getArchiveByYear);
router.get('/',archiveControlleur.getArchive);

module.exports = router;