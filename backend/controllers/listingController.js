const PetListing = require('../models/petListingModel');
const ListingImage = require('../models/listingImageModel');
const ListingApproval = require('../models/listingApprovalModel');
const Subscription = require('../models/subscriptionModel');
const { PLANS } = require('../models/subscriptionModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const slugify = require('../utils/slugify');
const localUpload = require('../utils/localUpload');

// Fields whose change on a published listing requires re-approval
const SIGNIFICANT_FIELDS = ['petType', 'breed', 'listingCategory', 'contactPhone', 'whatsappNumber'];

async function generateUniqueSlug(base) {
    let slug = slugify(base);
    let count = 0;
    while (await PetListing.exists({ slug })) {
        count++;
        slug = `${slugify(base)}-${count}`;
    }
    return slug;
}

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

exports.getListings = asyncErrorHandler(async (req, res) => {
    const {
        petType, breed, category, gender, state, city,
        vaccination, q, sort, page = 1, limit = 12,
    } = req.query;

    const filter = { status: 'approved', isArchived: false, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] };
    if (petType)    filter.petType = petType;
    if (breed)      filter.breed = breed;
    if (category)   filter.listingCategory = category;
    if (gender)     filter.gender = gender;
    if (state)      filter.state = { $regex: state, $options: 'i' };
    if (city)       filter.city  = { $regex: city,  $options: 'i' };
    if (vaccination) filter.vaccinationStatus = vaccination;
    if (q)          filter.$or = [
        { title:   { $regex: q, $options: 'i' } },
        { petName: { $regex: q, $options: 'i' } },
    ];

    const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 } };
    const sortOrder = sortMap[sort] || { featuredListing: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
        PetListing.find(filter)
            .populate('petType', 'name slug icon')
            .populate('breed', 'name slug')
            .populate('listingCategory', 'name slug')
            .populate('owner', 'name city state')
            .sort(sortOrder)
            .skip(skip)
            .limit(Number(limit)),
        PetListing.countDocuments(filter),
    ]);

    // Attach primary image to each listing
    const ids = listings.map(l => l._id);
    const images = await ListingImage.find({ listing: { $in: ids }, isPrimary: true });
    const imgMap = {};
    images.forEach(img => { imgMap[img.listing.toString()] = img.url; });

    const result = listings.map(l => ({
        ...l.toObject(),
        primaryImage: imgMap[l._id.toString()] || null,
    }));

    res.status(200).json({
        success: true,
        total,
        pages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        listings: result,
    });
});

exports.getSingleListing = asyncErrorHandler(async (req, res, next) => {
    const listing = await PetListing.findOne({ slug: req.params.slug, isArchived: false })
        .populate('petType', 'name slug icon')
        .populate('breed', 'name slug')
        .populate('listingCategory', 'name slug extraFields')
        .populate('owner', 'name city state verificationStatus');

    if (!listing || listing.status !== 'approved') {
        return next(new ErrorHandler('Listing not found', 404));
    }

    const images = await ListingImage.find({ listing: listing._id }).sort({ order: 1 });

    res.status(200).json({ success: true, listing, images });
});

// ─── AUTHENTICATED (OWNER) ───────────────────────────────────────────────────

exports.getMyListingBySlug = asyncErrorHandler(async (req, res, next) => {
    const listing = await PetListing.findOne({ slug: req.params.slug, owner: req.user.id, isArchived: false })
        .populate('petType', 'name slug icon')
        .populate('breed', 'name slug')
        .populate('listingCategory', 'name slug');

    if (!listing) return next(new ErrorHandler('Listing not found', 404));

    const images = await ListingImage.find({ listing: listing._id }).sort({ order: 1 });
    res.status(200).json({ success: true, listing, images });
});

exports.getMyListings = asyncErrorHandler(async (req, res) => {
    const { status } = req.query;
    const filter = { owner: req.user.id, isArchived: false };
    if (status) filter.status = status;

    const listings = await PetListing.find(filter)
        .populate('petType', 'name slug')
        .populate('breed', 'name slug')
        .populate('listingCategory', 'name slug')
        .sort({ createdAt: -1 });

    // Attach primary images
    const ids = listings.map(l => l._id);
    const images = await ListingImage.find({ listing: { $in: ids }, isPrimary: true });
    const imgMap = {};
    images.forEach(img => { imgMap[img.listing.toString()] = img.url; });

    const result = listings.map(l => ({
        ...l.toObject(),
        primaryImage: imgMap[l._id.toString()] || null,
    }));

    res.status(200).json({ success: true, listings: result });
});

exports.createListing = asyncErrorHandler(async (req, res, next) => {
    const {
        title, petType, breed, listingCategory, petName, age, gender,
        colour, state, city, description, healthInfo, vaccinationStatus,
        contactPhone, whatsappNumber, showContactInfo, extraFields, images,
    } = req.body;

    if (!title || !petType || !breed || !listingCategory) {
        return next(new ErrorHandler('Title, pet type, breed and category are required', 400));
    }

    // ── Subscription check ────────────────────────────────────────────────────
    const sub = await Subscription.findOne({ user: req.user.id, status: 'active' }).sort({ createdAt: -1 });
    if (!sub) {
        return next(new ErrorHandler('NO_PLAN', 402));
    }
    if (new Date() > sub.validUntil) {
        sub.status = 'expired';
        await sub.save();
        return next(new ErrorHandler('NO_PLAN', 402));
    }
    if (sub.listingsAllowed !== -1 && sub.listingsUsed >= sub.listingsAllowed) {
        return next(new ErrorHandler('LIMIT_REACHED', 402));
    }

    // Determine listing expiry based on plan
    const planConfig = PLANS[sub.plan];
    const expiresAt = sub.plan === 'basic'
        ? new Date(Date.now() + planConfig.validDays * 24 * 60 * 60 * 1000)
        : sub.validUntil;
    // ─────────────────────────────────────────────────────────────────────────

    const slug = await generateUniqueSlug(`${title}-${city || ''}`);

    const listing = await PetListing.create({
        title, petType, breed, listingCategory, petName, age, gender,
        colour, state, city, description, healthInfo, vaccinationStatus,
        contactPhone, whatsappNumber, showContactInfo, extraFields,
        owner: req.user.id,
        slug,
        status: 'pending',
        expiresAt,
    });

    // Increment subscription usage
    sub.listingsUsed += 1;
    await sub.save();

    // Handle image uploads
    if (images && images.length) {
        const imagePromises = images.map((img, i) =>
            localUpload.upload(img.base64, { folder: 'listings' }).then(result => ({
                listing: listing._id,
                url: result.secure_url,
                order: i,
                isPrimary: i === 0,
            }))
        );
        const imageData = await Promise.all(imagePromises);
        await ListingImage.insertMany(imageData);
    }

    res.status(201).json({ success: true, listing });
});

exports.updateListing = asyncErrorHandler(async (req, res, next) => {
    const listing = await PetListing.findById(req.params.id);
    if (!listing) return next(new ErrorHandler('Listing not found', 404));
    if (listing.owner.toString() !== req.user.id) {
        return next(new ErrorHandler('Not authorised to edit this listing', 403));
    }

    const allowedStatuses = ['draft', 'rejected', 'approved', 'unavailable'];
    if (!allowedStatuses.includes(listing.status)) {
        return next(new ErrorHandler('This listing cannot be edited in its current status', 400));
    }

    // If the listing is approved and a significant field changed, re-send for approval
    const needsReapproval = listing.status === 'approved' &&
        SIGNIFICANT_FIELDS.some(f => req.body[f] !== undefined && String(req.body[f]) !== String(listing[f]));

    const { newImages, removeImageIds, ...rest } = req.body;
    const updates = { ...rest };
    delete updates.owner; delete updates.status; delete updates.slug;

    if (needsReapproval) updates.status = 'pending';

    Object.assign(listing, updates);
    await listing.save();

    // Remove deleted images
    if (removeImageIds && removeImageIds.length) {
        const toRemove = await ListingImage.find({ _id: { $in: removeImageIds }, listing: listing._id });
        await Promise.all(toRemove.map(img => localUpload.destroy(img.publicId)));
        await ListingImage.deleteMany({ _id: { $in: removeImageIds } });
    }

    // Upload new images
    if (newImages && newImages.length) {
        const existing = await ListingImage.countDocuments({ listing: listing._id });
        const imagePromises = newImages.map((img, i) =>
            localUpload.upload(img.base64, { folder: 'listings' }).then(result => ({
                listing: listing._id,
                url: result.secure_url,
                publicId: result.public_id,
                order: existing + i,
                isPrimary: existing === 0 && i === 0,
            }))
        );
        const imageData = await Promise.all(imagePromises);
        await ListingImage.insertMany(imageData);
    }

    res.status(200).json({ success: true, listing });
});

exports.submitListing = asyncErrorHandler(async (req, res, next) => {
    const listing = await PetListing.findById(req.params.id);
    if (!listing) return next(new ErrorHandler('Listing not found', 404));
    if (listing.owner.toString() !== req.user.id) {
        return next(new ErrorHandler('Not authorised', 403));
    }
    if (!['draft', 'rejected'].includes(listing.status)) {
        return next(new ErrorHandler('Only draft or rejected listings can be submitted', 400));
    }

    listing.status = 'pending';
    await listing.save();

    await ListingApproval.create({ listing: listing._id, action: 'resubmitted' });

    res.status(200).json({ success: true, message: 'Listing submitted for review' });
});

exports.markUnavailable = asyncErrorHandler(async (req, res, next) => {
    const listing = await PetListing.findById(req.params.id);
    if (!listing) return next(new ErrorHandler('Listing not found', 404));
    if (listing.owner.toString() !== req.user.id) {
        return next(new ErrorHandler('Not authorised', 403));
    }

    listing.status = 'unavailable';
    await listing.save();
    res.status(200).json({ success: true });
});

exports.deleteListing = asyncErrorHandler(async (req, res, next) => {
    const listing = await PetListing.findById(req.params.id);
    if (!listing) return next(new ErrorHandler('Listing not found', 404));

    const isOwner = listing.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return next(new ErrorHandler('Not authorised', 403));

    // Soft-delete
    listing.isArchived = true;
    listing.status = 'unavailable';
    await listing.save();

    res.status(200).json({ success: true });
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

exports.adminGetListings = asyncErrorHandler(async (req, res) => {
    const { status, petType, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status)  filter.status = status;
    if (petType) filter.petType = petType;
    if (q) filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { slug:  { $regex: q, $options: 'i' } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
        PetListing.find(filter)
            .populate('petType', 'name')
            .populate('breed', 'name')
            .populate('listingCategory', 'name')
            .populate('owner', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        PetListing.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, pages: Math.ceil(total / Number(limit)), listings });
});

exports.adminGetSingleListing = asyncErrorHandler(async (req, res, next) => {
    const listing = await PetListing.findById(req.params.id)
        .populate('petType', 'name')
        .populate('breed', 'name')
        .populate('listingCategory', 'name extraFields')
        .populate('owner', 'name email phone verificationStatus');
    if (!listing) return next(new ErrorHandler('Listing not found', 404));

    const [images, history] = await Promise.all([
        ListingImage.find({ listing: listing._id }).sort({ order: 1 }),
        ListingApproval.find({ listing: listing._id })
            .populate('admin', 'name')
            .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({ success: true, listing, images, history });
});

exports.adminApproveListing = asyncErrorHandler(async (req, res, next) => {
    const listing = await PetListing.findById(req.params.id);
    if (!listing) return next(new ErrorHandler('Listing not found', 404));

    listing.status = 'approved';
    listing.rejectionReason = undefined;
    // Set expiry: 90 days by default
    listing.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    await listing.save();

    await ListingApproval.create({ listing: listing._id, action: 'approved', admin: req.user.id });

    res.status(200).json({ success: true, message: 'Listing approved' });
});

exports.adminRejectListing = asyncErrorHandler(async (req, res, next) => {
    const { reason } = req.body;
    if (!reason) return next(new ErrorHandler('Rejection reason is required', 400));

    const listing = await PetListing.findById(req.params.id);
    if (!listing) return next(new ErrorHandler('Listing not found', 404));

    listing.status = 'rejected';
    listing.rejectionReason = reason;
    await listing.save();

    await ListingApproval.create({ listing: listing._id, action: 'rejected', admin: req.user.id, reason });

    res.status(200).json({ success: true, message: 'Listing rejected' });
});

exports.adminFeatureListing = asyncErrorHandler(async (req, res, next) => {
    const listing = await PetListing.findById(req.params.id);
    if (!listing) return next(new ErrorHandler('Listing not found', 404));

    listing.featuredListing = !listing.featuredListing;
    await listing.save();

    const action = listing.featuredListing ? 'featured' : 'unfeatured';
    await ListingApproval.create({ listing: listing._id, action, admin: req.user.id });

    res.status(200).json({ success: true, featured: listing.featuredListing });
});

exports.adminDeactivateListing = asyncErrorHandler(async (req, res, next) => {
    const listing = await PetListing.findById(req.params.id);
    if (!listing) return next(new ErrorHandler('Listing not found', 404));

    listing.status = 'unavailable';
    await listing.save();

    await ListingApproval.create({ listing: listing._id, action: 'deactivated', admin: req.user.id });

    res.status(200).json({ success: true });
});
