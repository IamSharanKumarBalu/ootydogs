const express = require('express');
const {
    getServices, getSingleService,
    getMyServices, createService, updateService, deleteService,
    adminGetServices, adminApproveService, adminRejectService, adminFeatureService,
} = require('../controllers/serviceController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Public
router.get('/services', getServices);
router.get('/services/:slug', getSingleService);

// Authenticated
router.get('/my/services', isAuthenticatedUser, getMyServices);
router.post('/services', isAuthenticatedUser, createService);
router.put('/services/:id', isAuthenticatedUser, updateService);
router.delete('/services/:id', isAuthenticatedUser, deleteService);

// Admin
router.get('/admin/services', isAuthenticatedUser, authorizeRoles('admin'), adminGetServices);
router.put('/admin/services/:id/approve', isAuthenticatedUser, authorizeRoles('admin'), adminApproveService);
router.put('/admin/services/:id/reject', isAuthenticatedUser, authorizeRoles('admin'), adminRejectService);
router.put('/admin/services/:id/feature', isAuthenticatedUser, authorizeRoles('admin'), adminFeatureService);
router.delete('/admin/services/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteService);

module.exports = router;
