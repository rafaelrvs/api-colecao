const express = require('express');
const { sequelizeInventory } = require('./config/config.js');
    const routes = require('./routes/index.js')
    const app = express()
    routes(app)
    sequelizeInventory.authenticate()
    .then(() => {
        console.log('Conexão com o banco estabelecida com sucesso');
    })
    .catch((err) => {
        console.error('Não foi possível se conectar com o banco', err);
    });
module.exports = app;