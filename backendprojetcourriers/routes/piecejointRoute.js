const express = require('express');
const router = express.Router();
const piecejointController = require('../controller/PiecesJointeController');

router.post('/addpiece', piecejointController.addpiecejoint);
router.put('/updatepiece/:idF',piecejointController.updatepiecejoint);

module.exports = router;
