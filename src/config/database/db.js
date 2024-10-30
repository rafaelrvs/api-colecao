require('dotenv/config.js')

module.exports = {
    inventory:{
        username: process.env.USER_DB2,
        password: process.env.PASSWORD_DB2,
        database: process.env.DATABASE_DB2,
        host: process.env.HOST_DB2,
        port: process.env.PORT_DB2,
        dialect: process.env.DIALECT_DB2

    }

}