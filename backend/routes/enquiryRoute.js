const express = require('express');
const {
    sendEnquiry, getEnquiriesForListing, markEnquiryRead, adminGetEnquiries,
} = require('../controllers/enquiryController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Anyone can send an enquiry (optional auth)
router.post('/enquiries', sendEnquiry);

// Owner / admin
router.get('/listings/:listingId/enquiries', isAuthenticatedUser, getEnquiriesForListing);
router.put('/enquiries/:id/read', isAuthenticatedUser, markEnquiryRead);

// Admin
router.get('/admin/enquiries', isAuthenticatedUser, authorizeRoles('admin'), adminGetEnquiries);

module.exports = router;
