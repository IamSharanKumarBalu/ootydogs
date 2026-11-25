const express = require('express');
const { submitReport, adminGetReports, adminUpdateReport } = require('../controllers/reportController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Anyone can report (optional auth)
router.post('/reports', submitReport);

// Admin
router.get('/admin/reports', isAuthenticatedUser, authorizeRoles('admin'), adminGetReports);
router.put('/admin/reports/:id', isAuthenticatedUser, authorizeRoles('admin'), adminUpdateReport);

module.exports = router;
