// db.js
require('dotenv').config(); // Carrega as variáveis do arquivo .env
const { Sequelize } = require('sequelize');
const { sequelizeInventory } = require('./config/db'); // Ajuste o caminho conforme necessário

// Configuração do banco de dados usando variáveis de ambiente
const dbConfig = {
  inventory: {
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // Porta padrão para MySQL
    dialect: process.env.DB_DIALECT ,
  }
};

// Criação da instância Sequelize com as configurações
const sequelizeInventory = new Sequelize(
  dbConfig.inventory.database,
  dbConfig.inventory.username,
  dbConfig.inventory.password,
  {
    host: dbConfig.inventory.host,
    port: dbConfig.inventory.port,
    dialect: dbConfig.inventory.dialect,
  }
);

// Teste de conexão (opcional)
sequelizeInventory.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  })
  .catch(err => {
    console.error('Erro ao conectar com o banco de dados:', err);
  });

module.exports = {
  sequelizeInventory
};
