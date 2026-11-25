const express = require('express');
const {
    registerUser, loginUser, logoutUser,
    getUserDetails, forgotPassword, resetPassword,
    updatePassword, updateProfile, submitVerification,
    getAllUsers, getSingleUser,
    adminVerifyUser, adminRejectUser, adminSuspendUser,
    adminBlockUser, adminReactivateUser, deleteUser,
} = require('../controllers/userController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);

// Authenticated
router.get('/me', isAuthenticatedUser, getUserDetails);
router.put('/me/update', isAuthenticatedUser, updateProfile);
router.put('/password/update', isAuthenticatedUser, updatePassword);
router.post('/me/verification', isAuthenticatedUser, submitVerification);

// Admin — user management
router.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);
router.get('/admin/users/:id', isAuthenticatedUser, authorizeRoles('admin'), getSingleUser);
router.delete('/admin/users/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteUser);
router.put('/admin/users/:id/verify', isAuthenticatedUser, authorizeRoles('admin'), adminVerifyUser);
router.put('/admin/users/:id/reject', isAuthenticatedUser, authorizeRoles('admin'), adminRejectUser);
router.put('/admin/users/:id/suspend', isAuthenticatedUser, authorizeRoles('admin'), adminSuspendUser);
router.put('/admin/users/:id/block', isAuthenticatedUser, authorizeRoles('admin'), adminBlockUser);
router.put('/admin/users/:id/reactivate', isAuthenticatedUser, authorizeRoles('admin'), adminReactivateUser);

module.exports = router;
