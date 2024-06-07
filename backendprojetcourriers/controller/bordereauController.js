const express = require('express');
const Bordereau = require('../models/Bordereau');
const Facture = require('../models/Facture');
const { Sequelize } = require('sequelize');
const { authenticateToken } = require('../utils/jwt');
authorizePersonnelbof = authenticateToken(['bof']);

const bordereauController = {
getAllBordereau: async (req, res) => {
    try {
        const bordereaux = await Bordereau.findAll();
        res.status(200).json({ bordereaux });
    } catch (error) {
        console.error('Erreur de recupértion de bordereaux:', error);
        res.status(500).json({ message: 'erreur interne de serveur' });
    }
},
getBordereauById:async(req,res)=>{
const {idB}=req.params;

try{
    const bordereau =await Bordereau.findByPk(idB);
    return res.status(200).json({ bordereau });
}catch(error) {
    console.error('Erreur de recupération de factures associé:', error);
    return res.status(500).json({ message: "erreur interne de serveur" });
}
},
getFacturesByBordereauId: async (req, res) => {
    const { idB } = req.params;

    try {
        const bordereau = await Bordereau.findByPk(idB);

        if (!bordereau) {
            return res.status(404).json({ message: "Bordereau non trouvé" });
        }

        // Get the nature and date from the bordereau
        const { nature ,date} = bordereau;

        // Recherche des factures associées à ce bordereau par sa nature et sa date
        const factures = await Facture.findAll({ where: { nature,datereception: date } });

        return res.status(200).json({ factures });
    } catch (error) {
        console.error('Error de recupération de factures associé:', error);
        return res.status(500).json({ message: "erreur interne de serveur" });
    }
}};

module.exports =bordereauController ;
