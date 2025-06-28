const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const Quarto = require('./models/quarto');
const Hospede = require('./models/hospede');
const Reserva = require('./models/reserva');

const quartoRoutes = require('./routes/quartos');
const hospedeRoutes = require('./routes/hospedes');
const reservaRoutes = require('./routes/reservas');

const app = express();

app.use(bodyParser.json());

// Sincronizar modelos com o banco de dados
async function syncDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        await Quarto.sync();
        await Hospede.sync();
        await Reserva.sync();
        console.log('Modelos sincronizados com o banco de dados.');
    } catch (error) {
        console.error('Erro ao conectar ou sincronizar o banco:', error);
    }
}

// Rotas
app.use('/api/quartos', quartoRoutes);
app.use('/api/hospedes', hospedeRoutes);
app.use('/api/reservas', reservaRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.send('API de Gerenciamento de Hotel está funcionando!');
});

module.exports = { app, syncDatabase };
