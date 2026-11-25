const PetListing = require('../models/petListingModel');
const ListingImage = require('../models/listingImageModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');

// GET /vendor/products — the vendor dashboard listing of their own pets
exports.getVendorListings = asyncErrorHandler(async (req, res) => {
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

    // Response key is "products" for backward-compat with vendor hook shape
    res.status(200).json({ success: true, products: result });
});

// GET /vendor/stats
exports.getVendorStats = asyncErrorHandler(async (req, res) => {
    const ownerId = req.user.id;

    const [listingCount, liveCount, pendingApprovalCount] = await Promise.all([
        PetListing.countDocuments({ owner: ownerId, isArchived: false }),
        PetListing.countDocuments({ owner: ownerId, status: 'approved', isArchived: false }),
        PetListing.countDocuments({ owner: ownerId, status: 'pending', isArchived: false }),
    ]);

    res.status(200).json({
        success: true,
        stats: {
            listingCount,
            liveCount,
            pendingApprovalCount,
            lifetimeIncome: 0,
            pendingIncome: 0,
        },
    });
});
