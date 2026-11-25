const express = require('express');
const {
    getAllListingCategories, createListingCategory,
    updateListingCategory, deleteListingCategory,
} = require('../controllers/listingCategoryController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.get('/listing-categories', getAllListingCategories);
router.post('/admin/listing-categories', isAuthenticatedUser, authorizeRoles('admin'), createListingCategory);
router.put('/admin/listing-categories/:id', isAuthenticatedUser, authorizeRoles('admin'), updateListingCategory);
router.delete('/admin/listing-categories/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteListingCategory);

module.exports = router;
