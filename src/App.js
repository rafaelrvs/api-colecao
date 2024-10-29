const express = require('express');
const app = express();

// Middleware para processar JSON
app.use(express.json());

// Exemplo de rota
app.get('/', (req, res) => {
    res.send('API funcionando!');
});

module.exports = app;
