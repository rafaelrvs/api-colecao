require('dotenv').config();

const app = require("./src/app.js")

const PORT = 3333

app.listen(PORT,()=>{
    console.log("Servidor de aplicação ligado na porta"+PORT);
    
})