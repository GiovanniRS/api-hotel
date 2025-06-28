const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quarto = sequelize.define('Quarto',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        numero: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        tipo: {
            type: DataTypes.ENUM('SIMPLES', 'DUPLO', 'SUITE'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('DISPONIVEL', 'OCUPADO', 'MANUTENCAO'),
            allowNull: false,
            defaultValue: 'DISPONIVEL',
        },
        precoDiaria: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
    },{
        timestamps: false,
    }
);

module.exports = Quarto;