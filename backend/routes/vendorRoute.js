const express = require('express');
const { isAuthenticatedUser } = require('../middlewares/auth');
const { getVendorListings, getVendorStats } = require('../controllers/vendorController');
const {
    createListing, updateListing, deleteListing, submitListing,
} = require('../controllers/listingController');

const router = express.Router();

// All vendor routes require authentication
router.use(isAuthenticatedUser);

// Listings
router.get('/vendor/products', getVendorListings);
router.post('/vendor/product/new', createListing);
router.put('/vendor/product/:id', updateListing);
router.put('/vendor/product/:id/submit', submitListing);
router.delete('/vendor/product/:id', deleteListing);

// Stats
router.get('/vendor/stats', getVendorStats);

module.exports = router;
