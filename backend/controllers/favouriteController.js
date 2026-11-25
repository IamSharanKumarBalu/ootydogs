const Favourite = require('../models/favouriteModel');
const PetListing = require('../models/petListingModel');
const ListingImage = require('../models/listingImageModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');

exports.getMyFavourites = asyncErrorHandler(async (req, res) => {
    const favourites = await Favourite.find({ user: req.user.id })
        .populate({
            path: 'listing',
            match: { status: 'approved', isArchived: false },
            populate: [
                { path: 'petType', select: 'name slug' },
                { path: 'breed',   select: 'name slug' },
            ],
        })
        .sort({ createdAt: -1 });

    // Filter out nulls (listing removed/archived since save)
    const valid = favourites.filter(f => f.listing != null);

    // Attach primary images
    const ids = valid.map(f => f.listing._id);
    const images = await ListingImage.find({ listing: { $in: ids }, isPrimary: true });
    const imgMap = {};
    images.forEach(img => { imgMap[img.listing.toString()] = img.url; });

    const result = valid.map(f => ({
        _id: f._id,
        listing: { ...f.listing.toObject(), primaryImage: imgMap[f.listing._id.toString()] || null },
        createdAt: f.createdAt,
    }));

    res.status(200).json({ success: true, favourites: result });
});

exports.toggleFavourite = asyncErrorHandler(async (req, res, next) => {
    const { listingId } = req.body;
    if (!listingId) return next(new ErrorHandler('listingId is required', 400));

    const listing = await PetListing.findById(listingId);
    if (!listing) return next(new ErrorHandler('Listing not found', 404));

    const existing = await Favourite.findOne({ user: req.user.id, listing: listingId });
    if (existing) {
        await existing.deleteOne();
        return res.status(200).json({ success: true, saved: false });
    }

    await Favourite.create({ user: req.user.id, listing: listingId });
    res.status(201).json({ success: true, saved: true });
});

exports.checkFavourite = asyncErrorHandler(async (req, res) => {
    const saved = await Favourite.exists({ user: req.user.id, listing: req.params.listingId });
    res.status(200).json({ success: true, saved: Boolean(saved) });
});
