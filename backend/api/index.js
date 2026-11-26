const app = require('../app');
const connectDatabase = require('../config/database');

// Middleware: ensure DB is connected before every request
app.use(async (req, res, next) => {
    try {
        await connectDatabase();
        next();
    } catch (err) {
        res.status(503).json({ success: false, message: 'Database unavailable' });
    }
});

module.exports = app;
