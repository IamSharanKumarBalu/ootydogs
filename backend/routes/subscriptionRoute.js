const express = require('express');
const { getPlans, getMyPlan, createOrder, verifyPayment } = require('../controllers/subscriptionController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

router.get('/subscription/plans', getPlans);
router.get('/subscription/my-plan', isAuthenticatedUser, getMyPlan);
router.post('/subscription/create-order', isAuthenticatedUser, createOrder);
router.post('/subscription/verify-payment', isAuthenticatedUser, verifyPayment);

module.exports = router;
