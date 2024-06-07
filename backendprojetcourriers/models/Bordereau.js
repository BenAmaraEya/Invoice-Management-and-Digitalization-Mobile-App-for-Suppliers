const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const Facture =require('./Facture');


const Bordereau = sequelize.define('Bordereau', {
    idB: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    nature: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
});

module.exports = Bordereau;
