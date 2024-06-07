const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: 'gestioncourrier',
  dialect: 'mysql',
  username: 'root',
  host: '127.0.0.1',
  port: 3306,
  models: [__dirname + '/models'],
  logging: false,
  timezone: '+01:00',
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('La connexion à la base de données a été établie avec succès.');
    await sequelize.sync({ alter: true });
    console.log('La base de données est prête.');
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données :', error);
  }
};

module.exports = { connectDB, sequelize };
