const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hospede = sequelize.define('Hospede',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        documento: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        telefone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
    }, {
        timestamps: false,
    }
);

module.exports = Hospede;