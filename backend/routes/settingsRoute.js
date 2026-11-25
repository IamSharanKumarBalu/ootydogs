const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.get('/settings', getSettings);
router.put('/admin/settings', isAuthenticatedUser, authorizeRoles('admin'), updateSettings);

module.exports = router;
