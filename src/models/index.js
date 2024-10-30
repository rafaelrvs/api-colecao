'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const dbConfig = require(__dirname + '/../config/database/db.js');
const db = {};


const sequelizeInventory = new SequelizeSequelize(dbConfig.inventory.database, dbConfig.inventory.username, dbConfig.inventory.password)

const initializeModels = (sequelizeInstance, dirname) => {
    const models = {};
    fs
      .readdirSync(dirname)
      .filter(file => {
        return (
          file.indexOf('.') !== 0 &&
          file !== basename &&
          file.slice(-3) === '.js' &&
          file.indexOf('.test.js') === -1
        );
      })
      .forEach(file => {
        const model = require(path.join(dirname, file))(sequelizeInstance, Sequelize.DataTypes);
        models[model.name] = model;
      });
  
    Object.keys(models).forEach(modelName => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });
  
    return models;
  };
  
const modelInventory = initializeModels(sequelizeInventory,__dirname)
db.sequelizeInventory = modelInventory
db.Sequelize = Sequelize;


module.exports = db;