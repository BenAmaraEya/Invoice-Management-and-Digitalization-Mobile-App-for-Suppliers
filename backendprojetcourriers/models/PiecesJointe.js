const { DataTypes } = require('sequelize');
const  {sequelize}  = require('../database');
const Pieces_jointe = sequelize.define('Pieces_jointe', {
id:{
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
},
piece_name:{
    type: DataTypes.STRING,
    allowNull:false
},

});

module.exports = Pieces_jointe;