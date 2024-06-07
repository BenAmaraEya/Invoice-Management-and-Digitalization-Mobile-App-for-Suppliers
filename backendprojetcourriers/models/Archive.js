const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const Facture = require('./Facture');
const Archive = sequelize.define('Archive', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    annee:{
      type:DataTypes.INTEGER,
      allowNull: false,
    }
   
  });
Archive.hasMany(Facture, {foreignKey: 'id',onDelete: 'CASCADE' });

  module.exports = Archive;