const Services = require('../Services.js');
const {inventory } = require('../../models/index.js')
const { Op } = require('sequelize');
const { validate: isUuid } = require('uuid');
const uuid = require('uuid')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelizeInventory } = require('../models/index.js');



class Usuario_Services extends Services{
    async pegaUsuarioPorId_Services(id){
        const usuario = await inventory.usuario.findOne({
            where: {id: id},
            include: [
                {
                    model: om.Role,
                    as: 'usuario_roles',
                    attributes: ['id', 'nome', 'descricao'],
                    through: { attributes: [] } // Exclui os atributos da tabela de junção
                },
                {
                    model: inventory.Permissao,
                    as: 'usuario_permissoes',
                    attributes: ['id', 'nome', 'descricao'],
                    through: { attributes: [] } // Exclui os atributos da tabela de junção
                },
                {
                    model: inventory.Clientes_usuarios,
                    as: 'usuario_clientes',
                    attributes: [
                        'codcli',
                        'nome',
                        'email',           // Novo campo para o contato do cliente
                        'telefone',        // Novo campo para o telefone do cliente
                        'rg',              // RG para clientes pessoa física
                        'interesse',       // Tipo de interesse (ex.: compra, troca, avaliação)
                        'localizacao'      // Cidade ou país do cliente
                    ]
                },
                {
                    model: inventory.Colecao_usuarios,
                    as: 'usuario_colecoes',
                    attributes: [
                        'codigo',          // Identificador único do carrinho
                        'nome',            // Nome ou modelo do carrinho
                        'cor',             // Cor do carrinho
                        'escala',          // Escala do carrinho (ex.: 1:64)
                        'ano',             // Ano de fabricação
                        'fabricante',      // Fabricante do carrinho (ex.: Hot Wheels)
                        'largura',         // Largura do carrinho
                        'altura',          // Altura do carrinho
                        'peso',            // Peso do carrinho
                        'material',        // Material principal (ex.: metal)
                        'estado',          // Estado de conservação
                        'descricao'        // Descrição detalhada
                    ]
                }
            ]
            

        })
        if(usuario === null){
            console.log('registro não encontrado na base de dados');
            return {status:false, usuario: usuario};
        }else{
            console.log('registro foi encontrado na base de dados');
            return {status:true, usuario: usuario};
        }

}

async pegaUsuarioPorEmail_Services(email){
    const retorno = await inventory.Usuario.findOne({where: {email: email}})
    if(retorno === null){
        console.log('email não encontrado na base de dados');
        return {status:false, retorno: retorno};
    }else{
        console.log('email foi encontrado na base de dados');
        return {status:true, retorno: retorno};
    }

}
async validaSenhaUsuario_Services(email, senha){
    const retorno = await inventory.Usuario.findAll({
        attributes:['id','nome','email'],
        where: {email: email}
    });

    if(retorno === null){
        console.log('E-mail não encontrado na base de dados');
        return {status:false, retorno: retorno};
    }

    const pwd = await inventory.Usuario.findAll({
        attributes:['senha'],
        where: {email: email}
    });
    const senhaDB = pwd[0].dataValues.senha;
    const checkSenha = await bcrypt.compare(senha, senhaDB);
    if(!checkSenha) return {status:false, message:"usuario ou senha incorreto!"};

    try {
        const secret = process.env.SECRET_LOGIN;
        let token=''
        const TokenExpirationTime = '1d'
        if(checkSenha){
        token = jwt.sign({
            id: retorno[0].dataValues.id,
            nome: retorno[0].dataValues.nome,
            email: retorno[0].dataValues.email,
        },secret,{ expiresIn: TokenExpirationTime }
        )}

        return {message:"Autentiação realizada com sucesso",token, status:true}
    } catch (e) {
        console.log(e);
        return { status:false, error: e.message };
    }
}
async cadastraUsuario_Services(bodyReq) {
    const transaction = await sequelizeInventory.transaction(); // Inicia a transação
    try {
        // Valida se os role_id são UUIDs válidos
        if (!bodyReq.roles_id.every(id => isUuid(id))) {
            return { status: false, message: 'Um ou mais roles_id são inválidos.' };
        }

        // Valida se os permissao_id são UUIDs válidos
        if (!bodyReq.permissoes_id.every(id => isUuid(id))) {
            return { status: false, message: 'Um ou mais permissoes_id são inválidos.' };
        }

        // Verifica se role_id existe no banco de dados
        const roles = await inventory.Role.findAll({
            where: {
                id: {
                    [Op.in]: bodyReq.roles_id
                }
            },
            transaction
        });

        if (roles.length !== bodyReq.roles_id.length) {
            return { status: false, message: 'Uma ou mais roles não foram encontradas.' };
        }

        // Verifica se permissao_id existe no banco de dados
        const permissoes = await inventory.Permissao.findAll({
            where: {
                id: {
                    [Op.in]: bodyReq.permissoes_id
                }
            },
            transaction
        });

        if (permissoes.length !== bodyReq.permissoes_id.length) {
            return { status: false, message: 'Uma ou mais permissões não foram encontradas.' };
        }

        // Cria o usuário dentro da transação
        const usuario = await inventory.Usuario.create({ id: uuid.v4(), ...bodyReq }, { transaction });

        if(usuario === null){
            console.log('usuario nao cadastrado');
            await transaction.rollback(); // Faz o rollback caso o usuário não seja criado
            return {status:false};
        }

        // Adiciona roles ao usuário
        await usuario.addUsuario_roles(bodyReq.roles_id, { transaction });

        // Adiciona permissoes ao usuário
        await usuario.addUsuario_permissoes(bodyReq.permissoes_id, { transaction });

        // Cria coleções e as associa ao usuário
        if (bodyReq.colecao && Array.isArray(bodyReq.colecao)) {
            for (const colecao of bodyReq.colecao) {
                const novaColecao = await inventory.Colecao_usuarios.create({
                    usuario_id: usuario.id,  // Adicionando a referência do usuário criado
                    codigo: colecao.codigo,
                    descricao: colecao.descricao
                }, { transaction });
                await usuario.addUsuario_colecoes(novaColecao.id, { transaction });
            }
        }

        // Cria clientes e os associa ao usuário
        if (bodyReq.clientes && Array.isArray(bodyReq.clientes)) {
            for (const cliente of bodyReq.clientes) {
                const novoCliente = await inventory.Clientes_usuarios.create({
                    usuario_id: usuario.id,  // Adicionando a referência do usuário criado
                    codcli: cliente.codcli,
                    nome: cliente.nome,
                    cnpj: cliente.cnpj,
                    rg: cliente.rg
                }, { transaction });
                await usuario.addUsuario_clientes(novoCliente.id, { transaction });
            }
        }

        // Se tudo deu certo, commit na transação
        await transaction.commit();
        console.log('usuario cadastrado com sucesso');
        return { status: true };

    } catch (e) {
        await transaction.rollback(); // Faz o rollback caso ocorra qualquer erro
        console.error('Erro na associação', e);
        return { status: false, message: 'Erro na associação', error: e.message };
    }finally {
        if (!transaction.finished) await transaction.rollback(); // Assegura que a transação seja finalizada
    }

}
async deletaUsuarioPorId_Services(id){
    return inventory.Usuario.destroy({ where: { id: id } });
}



}
module.exports = Usuario_Services