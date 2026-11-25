const express = require('express');
const {
    getDashboardStats, getUsersAdmin, getSingleUserAdmin, verifyUser,
} = require('../controllers/adminStatsController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

const admin = [isAuthenticatedUser, authorizeRoles('admin')];

router.get('/admin/stats', ...admin, getDashboardStats);
router.get('/admin/users', ...admin, getUsersAdmin);
router.get('/admin/users/:id', ...admin, getSingleUserAdmin);
router.put('/admin/users/:id/verify', ...admin, verifyUser);

module.exports = router;
