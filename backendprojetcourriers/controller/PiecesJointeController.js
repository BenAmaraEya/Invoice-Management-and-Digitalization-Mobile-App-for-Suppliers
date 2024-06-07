const Pieces_jointe = require('../models/PiecesJointe');
const Facture = require('../models/Facture');
const { authenticateToken } = require('../utils/jwt');
authorize = authenticateToken(['fournisseur','bof']);
piecejointController = {
    addpiecejoint:[authorize, async (req, res) => {
        try {
            const { piece_name, idFacture } = req.body; 
            const facture = await Facture.findByPk(idFacture);
            if (!facture) {
                return res.status(404).json({ error: 'Facture non existante' });
            }

            const newPiecesJointes = await Promise.all(piece_name.map(async (pieceName) => {
                return await Pieces_jointe.create({ piece_name: pieceName });
            }));

            await facture.addPieces_jointes(newPiecesJointes);

            res.json({ success: true, message: 'Pieces jointes enregistrer avec succée' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'erreur interne de serveur' });
        }
    }],

updatepiecejoint: [/*authorize,*/ async (req, res) => {
    try {
        const { piece_name } = req.body;
        const { idF } = req.params;
        const facture = await Facture.findOne({ where: { idF: idF } });
        if (!facture) {
            return res.status(404).json({ error: 'Facture non existante' });
        }

        if (!piece_name || !Array.isArray(piece_name) || piece_name.length === 0) {
            return res.status(400).json({ error: ' piece_name de format Invalide' });
        }

        // mettre a jour piece jointe
        const existingPiecesJointes = await facture.getPieces_jointes();
        const updatedPiecesJointes = await Promise.all(existingPiecesJointes.map(async (piece) => {
            if (piece_name.includes(piece.piece_name)) {
                return piece; 
            } else {
                await piece.destroy(); 
                return null;
            }
        }));

        // cree une nouvelle piece joint
        const newPiecesJointes = await Promise.all(piece_name.map(async (pieceName) => {
            if (!existingPiecesJointes.some(piece => piece.piece_name === pieceName)) {
                return await Pieces_jointe.create({ piece_name: pieceName });
            }
        }));

        // filter les piece joint et modifier mettre a jour les association
        const finalPiecesJointes = updatedPiecesJointes.filter(piece => piece !== null);
        await facture.setPieces_jointes([...finalPiecesJointes, ...newPiecesJointes]);

        res.json({ success: true, message: 'Piece jointe mise a jour avec succée' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'erreur interne de serveur' });
    }
}]};

module.exports = piecejointController;