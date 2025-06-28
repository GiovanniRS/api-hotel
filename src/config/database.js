const { Sequelize } = require('sequelize');

// Use uma variável de ambiente para a string de conexão
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("DATABASE_URL não definida. Usando SQLite localmente.");
  // Conexão SQLite para desenvolvimento local
  module.exports = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
    logging: false, // Desabilita logs SQL no console
  });
} else {
  // Conexão para PostgreSQL em produção
  module.exports = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
  });
}
