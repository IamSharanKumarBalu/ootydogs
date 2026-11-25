const User = require('../models/userModel');
const PetListing = require('../models/petListingModel');
const PetService = require('../models/petServiceModel');
const Enquiry = require('../models/enquiryModel');
const Report = require('../models/reportModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');

exports.getDashboardStats = asyncErrorHandler(async (req, res) => {
    const [
        totalUsers,
        pendingVerifications,
        totalListings,
        pendingListings,
        approvedListings,
        totalServices,
        pendingServices,
        newEnquiries,
        openReports,
    ] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ verificationStatus: 'pending' }),
        PetListing.countDocuments({ isArchived: false }),
        PetListing.countDocuments({ status: 'pending', isArchived: false }),
        PetListing.countDocuments({ status: 'approved', isArchived: false }),
        PetService.countDocuments(),
        PetService.countDocuments({ status: 'pending' }),
        Enquiry.countDocuments({ status: 'new' }),
        Report.countDocuments({ status: 'open' }),
    ]);

    res.status(200).json({
        success: true,
        stats: {
            users: { total: totalUsers, pendingVerifications },
            listings: { total: totalListings, pending: pendingListings, approved: approvedListings },
            services: { total: totalServices, pending: pendingServices },
            enquiries: { unread: newEnquiries },
            reports: { open: openReports },
        },
    });
});

exports.getUsersAdmin = asyncErrorHandler(async (req, res) => {
    const { verificationStatus, q, page = 1, limit = 20 } = req.query;
    const filter = { role: 'user' };
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (q) filter.$or = [
        { name:  { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
        User.find(filter, '-password -emailVerifyToken -emailVerifyExpire -resetPasswordToken -resetPasswordExpire')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        User.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, pages: Math.ceil(total / Number(limit)), users });
});

exports.getSingleUserAdmin = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id, '-password -emailVerifyToken -emailVerifyExpire -resetPasswordToken -resetPasswordExpire');
    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const [listings, services] = await Promise.all([
        PetListing.find({ owner: user._id, isArchived: false }).select('title status slug createdAt').sort({ createdAt: -1 }).limit(10),
        PetService.find({ owner: user._id }).select('businessName status slug createdAt').sort({ createdAt: -1 }).limit(5),
    ]);

    res.status(200).json({ success: true, user, listings, services });
});

exports.verifyUser = asyncErrorHandler(async (req, res, next) => {
    const { status, note } = req.body;
    const allowed = ['verified', 'rejected', 'suspended', 'blocked'];
    if (!status || !allowed.includes(status)) {
        return next(new ErrorHandler(`Status must be one of: ${allowed.join(', ')}`, 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler('User not found', 404));

    user.verificationStatus = status;
    user.canPostListings = status === 'verified';
    if (note) user.verificationNote = note;
    await user.save();

    res.status(200).json({ success: true, user: { _id: user._id, verificationStatus: user.verificationStatus, canPostListings: user.canPostListings } });
});
