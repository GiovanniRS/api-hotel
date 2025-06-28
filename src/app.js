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
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Sincronizar modelos com o banco de dados
async function syncDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        
        // Sincroniza os modelos. `force: true` irá recriar as tabelas (cuidado em produção!)
        // Para desenvolvimento inicial, pode ser útil. Em produção, use migrações.
        await Quarto.sync();
        await Hospede.sync();
        await Reserva.sync(); // Garanta que Reserva.sync() seja chamado APÓS Quarto e Hospede
        console.log('Modelos sincronizados com o banco de dados.');
    } catch (error) {
        console.error('Não foi possível conectar ou sincronizar o banco de dados:', error);
    }
}

// Usar as rotas
app.use('/api/quartos', quartoRoutes);
app.use('/api/hospedes', hospedeRoutes);
app.use('/api/reservas', reservaRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.send('API de Gerenciamento de Hotel está funcionando!');
});

// Iniciar o servidor após sincronizar o banco de dados
syncDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
});