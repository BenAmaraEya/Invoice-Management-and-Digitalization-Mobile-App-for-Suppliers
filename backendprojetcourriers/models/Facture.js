const { DataTypes, Sequelize } = require('sequelize');
const  {sequelize}  = require('../database');
const Pieces_jointe = require('./PiecesJointe');
const Bordereau= require ('./Bordereau');
const Etat = require('./Etat');
const Fournisseur = require('./Fournisseur');
const Facture = sequelize.define('Facture', {
idF:{
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
},
date_fact:{
    type: DataTypes.DATEONLY,
    allowNull:false
},
num_fact:{
    type: DataTypes.STRING,
    allowNull:false
},
factname:{
    type : DataTypes.STRING,
    allowNull:false
},
montant:{
    type: DataTypes.FLOAT,
    allowNull:false
},
devise:{
    type: DataTypes.STRING,
    allowNull:false
},
nature:{
    type :  DataTypes.STRING,
    allowNull:false
},
status:{
    type: DataTypes.STRING,
    defaultValue: "Attente"
},
objet:{
    type: DataTypes.STRING,
    allowNull:false
},
datereception:{
    type: DataTypes.DATEONLY,

},
/*iderp:{
    type:Sequelize.INTEGER,
    references:{
        model:Fournisseur,
        key:"iderp"
    }
},*/
num_po:{
type: DataTypes.STRING
},
pathpdf:{
    type: DataTypes.STRING,
    
},
});
Facture.hasMany(Pieces_jointe, { as: 'Pieces_jointes', foreignKey: 'idFacture',onDelete: 'CASCADE' });
Facture.belongsTo(Bordereau, { foreignKey: 'idB' });
Facture.hasMany(Etat, {foreignKey: 'idF',onDelete: 'CASCADE' });
/*Facture.belongsTo(Fournisseur, {
    foreignKey: 'iderp',
     // Specify the alias for the association
    onDelete: 'CASCADE'
});

/*Facture.associate=()=>{
    Facture.belongsTo(Fournisseur,{foreignKey:'iderp'})
}*/
module.exports = Facture;