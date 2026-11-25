const PlatformSettings = require('../models/platformSettingsModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');

exports.getSettings = asyncErrorHandler(async (req, res) => {
    let settings = await PlatformSettings.findOne();
    if (!settings) settings = await PlatformSettings.create({});
    res.status(200).json({ success: true, settings });
});

exports.updateSettings = asyncErrorHandler(async (req, res, next) => {
    const allowed = ['siteName', 'siteDescription', 'contactEmail', 'contactPhone', 'socialLinks', 'maintenanceMode'];
    const updates = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    let settings = await PlatformSettings.findOne();
    if (!settings) {
        settings = await PlatformSettings.create(updates);
    } else {
        Object.assign(settings, updates);
        await settings.save();
    }

    res.status(200).json({ success: true, settings });
});
