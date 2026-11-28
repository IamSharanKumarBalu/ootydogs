const express = require('express');
const {
    getAllServiceCategories, createServiceCategory,
    updateServiceCategory, deleteServiceCategory,
} = require('../controllers/serviceCategoryController');
const { isAuthenticatedUser, authorizeRoles, optionalAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/service-categories', optionalAuth, getAllServiceCategories);
router.post('/admin/service-categories', isAuthenticatedUser, authorizeRoles('admin'), createServiceCategory);
router.put('/admin/service-categories/:id', isAuthenticatedUser, authorizeRoles('admin'), updateServiceCategory);
router.delete('/admin/service-categories/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteServiceCategory);

module.exports = router;
