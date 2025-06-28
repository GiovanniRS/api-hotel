const { app, syncDatabase } = require('../src/app');

module.exports = async (req, res) => {
  await syncDatabase(); // você pode deixar isso só para o primeiro uso
  app(req, res); // delega a requisição para o Express
};
