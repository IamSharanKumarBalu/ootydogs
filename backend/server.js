const app = require('./app');
const connectDatabase = require('./config/database');

connectDatabase();

// API status route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Backend API is Running!',
        version: '1.0.0',
        endpoints: {
            users: '/api/v1/register, /api/v1/login',
            products: '/api/v1/products',
            orders: '/api/v1/order/new',
            admin: '/api/v1/admin/*'
        }
    });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});

module.exports = app;
