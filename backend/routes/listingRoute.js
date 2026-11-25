const express = require('express');
const {
    getListings, getSingleListing,
    getMyListings, createListing, updateListing,
    submitListing, markUnavailable, deleteListing,
    adminGetListings, adminGetSingleListing,
    adminApproveListing, adminRejectListing,
    adminFeatureListing, adminDeactivateListing,
} = require('../controllers/listingController');
const { isAuthenticatedUser, authorizeRoles, requireVerified } = require('../middlewares/auth');

const router = express.Router();

// Public
router.get('/listings', getListings);
router.get('/listings/:slug', getSingleListing);

// Verified users
router.get('/my/listings', isAuthenticatedUser, getMyListings);
router.post('/listings', isAuthenticatedUser, requireVerified, createListing);
router.put('/listings/:id', isAuthenticatedUser, updateListing);
router.put('/listings/:id/submit', isAuthenticatedUser, submitListing);
router.put('/listings/:id/unavailable', isAuthenticatedUser, markUnavailable);
router.delete('/listings/:id', isAuthenticatedUser, deleteListing);

// Admin
router.get('/admin/listings', isAuthenticatedUser, authorizeRoles('admin'), adminGetListings);
router.get('/admin/listings/:id', isAuthenticatedUser, authorizeRoles('admin'), adminGetSingleListing);
router.put('/admin/listings/:id/approve', isAuthenticatedUser, authorizeRoles('admin'), adminApproveListing);
router.put('/admin/listings/:id/reject', isAuthenticatedUser, authorizeRoles('admin'), adminRejectListing);
router.put('/admin/listings/:id/feature', isAuthenticatedUser, authorizeRoles('admin'), adminFeatureListing);
router.put('/admin/listings/:id/deactivate', isAuthenticatedUser, authorizeRoles('admin'), adminDeactivateListing);
router.delete('/admin/listings/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteListing);

module.exports = router;
