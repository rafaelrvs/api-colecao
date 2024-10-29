require('dotenv').config();

const app = require('./src/app');

const PORT = process.env.PORT || 3333;
const http = require('http');

// Criação do servidor HTTP
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Servidor de aplicação ligado na porta ${PORT}`);
});
