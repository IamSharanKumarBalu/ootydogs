const express = require('express');
const {
    getProducts, getProduct,
    createProduct, updateProduct, deleteProduct, getMyProducts,
    adminGetProducts, adminApproveProduct, adminRejectProduct,
    adminFeatureProduct, adminDeleteProduct,
} = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Public
router.get('/products', getProducts);
router.get('/products/:slug', getProduct);

// User
router.get('/my/products', isAuthenticatedUser, getMyProducts);
router.post('/products', isAuthenticatedUser, createProduct);
router.put('/products/:id', isAuthenticatedUser, updateProduct);
router.delete('/products/:id', isAuthenticatedUser, deleteProduct);

// Admin
router.get('/admin/products', isAuthenticatedUser, authorizeRoles('admin'), adminGetProducts);
router.put('/admin/products/:id/approve', isAuthenticatedUser, authorizeRoles('admin'), adminApproveProduct);
router.put('/admin/products/:id/reject', isAuthenticatedUser, authorizeRoles('admin'), adminRejectProduct);
router.put('/admin/products/:id/feature', isAuthenticatedUser, authorizeRoles('admin'), adminFeatureProduct);
router.delete('/admin/products/:id', isAuthenticatedUser, authorizeRoles('admin'), adminDeleteProduct);

module.exports = router;
