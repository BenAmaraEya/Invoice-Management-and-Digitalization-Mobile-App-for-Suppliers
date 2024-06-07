const express = require('express');
const bordereauController = require('../controller/bordereauController');
const router = express.Router();

router.get('/',bordereauController.getAllBordereau);
router.get('/:idB/factures',bordereauController.getFacturesByBordereauId);
router.get('/:idB',bordereauController.getBordereauById);
module.exports = router;