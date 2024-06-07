const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const Etat = sequelize.define('Etat', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    etat: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Attente"
    },
    date:{
      type:DataTypes.DATEONLY,
      allowNull: false,
    }
   
  });
  
  module.exports = Etat;