const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Quarto = require('./quarto');
const Hospede = require('./hospede');

const Reserva = sequelize.define('Reserva',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        dataEntrada: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        dataSaida: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('ATIVA', 'CANCELADA', 'CONCLUIDA'),
            allowNull: false,
            defaultValue: 'ATIVA',
        },
    }, {
        timestamps: false,
    }
);

Reserva.belongsTo(Quarto, { foreignKey: 'quartoId' });
Reserva.belongsTo(Hospede, { foreignKey: 'hospedeId' });

module.exports = Reserva;