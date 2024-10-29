const userModel = require('../models/userModel');

exports.getAllUsers = async () => {
    return await userModel.findAll();
};

exports.createUser = async (userData) => {
    return await userModel.create(userData);
};
