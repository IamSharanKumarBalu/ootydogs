const PetService = require('../models/petServiceModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const slugify = require('../utils/slugify');

async function generateUniqueSlug(base) {
    let slug = slugify(base);
    let count = 0;
    while (await PetService.exists({ slug })) {
        count++;
        slug = `${slugify(base)}-${count}`;
    }
    return slug;
}

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

exports.getServices = asyncErrorHandler(async (req, res) => {
    const { category, state, city, q, page = 1, limit = 12 } = req.query;
    const filter = { status: 'approved' };
    if (category) filter.category = category;
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (city)  filter.city  = { $regex: city,  $options: 'i' };
    if (q) filter.$or = [
        { businessName: { $regex: q, $options: 'i' } },
        { description:  { $regex: q, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [services, total] = await Promise.all([
        PetService.find(filter)
            .populate('owner', 'name city state')
            .sort({ featuredService: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        PetService.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        services,
    });
});

exports.getSingleService = asyncErrorHandler(async (req, res, next) => {
    const service = await PetService.findOne({ slug: req.params.slug, status: 'approved' })
        .populate('owner', 'name city state verificationStatus');
    if (!service) return next(new ErrorHandler('Service not found', 404));
    res.status(200).json({ success: true, service });
});

// ─── AUTHENTICATED (OWNER) ───────────────────────────────────────────────────

exports.getMyServices = asyncErrorHandler(async (req, res) => {
    const services = await PetService.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, services });
});

exports.createService = asyncErrorHandler(async (req, res, next) => {
    const { businessName, category, description, address, state, city, phone } = req.body;
    if (!businessName || !category) {
        return next(new ErrorHandler('Business name and category are required', 400));
    }

    const slug = await generateUniqueSlug(`${businessName}-${city || ''}`);

    const service = await PetService.create({
        ...req.body,
        owner: req.user.id,
        slug,
        status: 'pending',
    });

    res.status(201).json({ success: true, service });
});

exports.updateService = asyncErrorHandler(async (req, res, next) => {
    const service = await PetService.findById(req.params.id);
    if (!service) return next(new ErrorHandler('Service not found', 404));
    if (service.owner.toString() !== req.user.id) {
        return next(new ErrorHandler('Not authorised', 403));
    }

    const updates = { ...req.body };
    delete updates.owner; delete updates.status; delete updates.slug;

    // Re-send for approval if approved service is updated
    if (service.status === 'approved') updates.status = 'pending';

    Object.assign(service, updates);
    await service.save();

    res.status(200).json({ success: true, service });
});

exports.deleteService = asyncErrorHandler(async (req, res, next) => {
    const service = await PetService.findById(req.params.id);
    if (!service) return next(new ErrorHandler('Service not found', 404));

    const isOwner = service.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return next(new ErrorHandler('Not authorised', 403));

    await service.deleteOne();
    res.status(200).json({ success: true });
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

exports.adminGetServices = asyncErrorHandler(async (req, res) => {
    const { status, category, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status)   filter.status = status;
    if (category) filter.category = category;
    if (q) filter.$or = [
        { businessName: { $regex: q, $options: 'i' } },
        { slug:         { $regex: q, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [services, total] = await Promise.all([
        PetService.find(filter)
            .populate('owner', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        PetService.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, pages: Math.ceil(total / Number(limit)), services });
});

exports.adminApproveService = asyncErrorHandler(async (req, res, next) => {
    const service = await PetService.findByIdAndUpdate(
        req.params.id,
        { status: 'approved', rejectionReason: undefined },
        { new: true }
    );
    if (!service) return next(new ErrorHandler('Service not found', 404));
    res.status(200).json({ success: true, service });
});

exports.adminRejectService = asyncErrorHandler(async (req, res, next) => {
    const { reason } = req.body;
    if (!reason) return next(new ErrorHandler('Rejection reason is required', 400));

    const service = await PetService.findByIdAndUpdate(
        req.params.id,
        { status: 'rejected', rejectionReason: reason },
        { new: true }
    );
    if (!service) return next(new ErrorHandler('Service not found', 404));
    res.status(200).json({ success: true, service });
});

exports.adminFeatureService = asyncErrorHandler(async (req, res, next) => {
    const service = await PetService.findById(req.params.id);
    if (!service) return next(new ErrorHandler('Service not found', 404));
    service.featuredService = !service.featuredService;
    await service.save();
    res.status(200).json({ success: true, featured: service.featuredService });
});
