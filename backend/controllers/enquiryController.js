const Enquiry = require('../models/enquiryModel');
const PetListing = require('../models/petListingModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');

exports.sendEnquiry = asyncErrorHandler(async (req, res, next) => {
    const { listingId, name, email, phone, message } = req.body;
    if (!listingId || !name || !message) {
        return next(new ErrorHandler('Listing, name and message are required', 400));
    }

    const listing = await PetListing.findById(listingId);
    if (!listing || listing.status !== 'approved') {
        return next(new ErrorHandler('Listing not found', 404));
    }

    const enquiry = await Enquiry.create({
        listing: listingId,
        user: req.user ? req.user.id : undefined,
        name,
        email,
        phone,
        message,
    });

    res.status(201).json({ success: true, enquiry });
});

exports.getEnquiriesForListing = asyncErrorHandler(async (req, res, next) => {
    const listing = await PetListing.findById(req.params.listingId);
    if (!listing) return next(new ErrorHandler('Listing not found', 404));

    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorHandler('Not authorised', 403));
    }

    const enquiries = await Enquiry.find({ listing: req.params.listingId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, enquiries });
});

exports.markEnquiryRead = asyncErrorHandler(async (req, res, next) => {
    const enquiry = await Enquiry.findById(req.params.id).populate('listing', 'owner');
    if (!enquiry) return next(new ErrorHandler('Enquiry not found', 404));

    if (enquiry.listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorHandler('Not authorised', 403));
    }

    enquiry.status = 'read';
    await enquiry.save();
    res.status(200).json({ success: true });
});

// Admin
exports.adminGetEnquiries = asyncErrorHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [enquiries, total] = await Promise.all([
        Enquiry.find(filter)
            .populate('listing', 'title slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Enquiry.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, pages: Math.ceil(total / Number(limit)), enquiries });
});
