const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const errorMiddleware = require('./middlewares/error');

const app = express();

const path = require('path');
// configver
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, 'config/config.env') });
}

// CORS Configuration
const cors = require('cors');

// CORS Configuration - Allow all origins for now (can be restricted later)
// Uncomment and update the whitelist if you want to restrict specific domains
/*
const whitelist = [
    'http://localhost:3000',
    'http://localhost:3001',
    // Add your production frontend URL here
];
*/

app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400 // 24 hours
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload());

const user = require('./routes/userRoute');
const blog = require('./routes/blogRoute');
const slider = require('./routes/sliderRoute');
const settings = require('./routes/settingsRoute');
const petType = require('./routes/petTypeRoute');
const breed = require('./routes/breedRoute');
const listingCategory = require('./routes/listingCategoryRoute');
const listing = require('./routes/listingRoute');
const service = require('./routes/serviceRoute');
const enquiry = require('./routes/enquiryRoute');
const favourite = require('./routes/favouriteRoute');
const report = require('./routes/reportRoute');
const adminStats = require('./routes/adminStatsRoute');
const vendor = require('./routes/vendorRoute');
const subscription = require('./routes/subscriptionRoute');
const product = require('./routes/productRoute');
const serviceCategory = require('./routes/serviceCategoryRoute');

app.use('/api/v1', user);
app.use('/api/v1', blog);
app.use('/api/v1', slider);
app.use('/api/v1', settings);
app.use('/api/v1', petType);
app.use('/api/v1', breed);
app.use('/api/v1', listingCategory);
app.use('/api/v1', listing);
app.use('/api/v1', service);
app.use('/api/v1', enquiry);
app.use('/api/v1', favourite);
app.use('/api/v1', report);
app.use('/api/v1', adminStats);
app.use('/api/v1', vendor);
app.use('/api/v1', subscription);
app.use('/api/v1', product);
app.use('/api/v1', serviceCategory);

// error middleware
app.use(errorMiddleware);

module.exports = app;