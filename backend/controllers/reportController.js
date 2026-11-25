const Report = require('../models/reportModel');
const PetListing = require('../models/petListingModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');

exports.submitReport = asyncErrorHandler(async (req, res, next) => {
    const { listingId, reason, details, reporterEmail } = req.body;
    if (!listingId || !reason) {
        return next(new ErrorHandler('Listing and reason are required', 400));
    }

    const listing = await PetListing.findById(listingId);
    if (!listing) return next(new ErrorHandler('Listing not found', 404));

    const report = await Report.create({
        listing: listingId,
        reporter: req.user ? req.user.id : undefined,
        reporterEmail: req.user ? req.user.email : reporterEmail,
        reason,
        details,
    });

    res.status(201).json({ success: true, report });
});

// Admin
exports.adminGetReports = asyncErrorHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
        Report.find(filter)
            .populate('listing', 'title slug status')
            .populate('reporter', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Report.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, pages: Math.ceil(total / Number(limit)), reports });
});

exports.adminUpdateReport = asyncErrorHandler(async (req, res, next) => {
    const { status, adminNote } = req.body;
    const allowedStatuses = ['open', 'reviewed', 'dismissed'];
    if (status && !allowedStatuses.includes(status)) {
        return next(new ErrorHandler('Invalid status', 400));
    }

    const report = await Report.findById(req.params.id);
    if (!report) return next(new ErrorHandler('Report not found', 404));

    if (status)    report.status    = status;
    if (adminNote) report.adminNote = adminNote;
    await report.save();

    res.status(200).json({ success: true, report });
});
