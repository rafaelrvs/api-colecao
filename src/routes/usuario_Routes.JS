const {Router} = require('express');
const checkTokenLogin = require('../../../middlewares/checkTokenLogin.js');
const Usuario_Controller = require('../../controllers/Usuario_Controller.js')

const usuario_controller = new Usuario_Controller();
const route = Router()

route.get('/api/usuario/:id', checkTokenLogin, (req,res)=> usuario_controller.pegaUsuarioPorId_Controller(req,res))
route.post('/api/usuario/register',checkTokenLogin, (req,res)=> usuario_controller.registerUsuario_Controller(req,res))
route.post('/api/usuario/login',(req,res)=>{ usuario_controller.loginUsuario_Controller(req,res)});
route.delete('/api/usuario/:id', checkTokenLogin,(req,res)=>{ usuario_controller.deletaUsuarioPorId_Controller(req,res)});



module.exports=route