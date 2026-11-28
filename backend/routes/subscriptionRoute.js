const express = require('express');
const { getPlans, getMyPlan, createOrder, verifyPayment, adminGetTransactions } = require('../controllers/subscriptionController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.get('/subscription/plans', getPlans);
router.get('/subscription/my-plan', isAuthenticatedUser, getMyPlan);
router.post('/subscription/create-order', isAuthenticatedUser, createOrder);
router.post('/subscription/verify-payment', isAuthenticatedUser, verifyPayment);

// Admin
router.get('/admin/transactions', isAuthenticatedUser, authorizeRoles('admin'), adminGetTransactions);

module.exports = router;
