const { app, syncDatabase } = require('../src/app');

let isDbSynced = false;

module.exports = async (req, res) => {
    if (!isDbSynced) {
        await syncDatabase();
        isDbSynced = true;
    }

    return app(req, res); // handler padrão da Vercel
};
