const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // Onde o arquivo do banco de dados será salvo
    logging: false, // Desabilita logs de SQL no console
});

module.exports = sequelize;