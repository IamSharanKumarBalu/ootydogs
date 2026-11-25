const ListingCategory = require('../models/listingCategoryModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const slugify = require('../utils/slugify');
const cloudinary = require('../utils/localUpload');

exports.getAllListingCategories = asyncErrorHandler(async (req, res) => {
    const filter = req.user?.role === 'admin' ? {} : { active: true };
    const categories = await ListingCategory.find(filter).sort({ order: 1, name: 1 });
    res.status(200).json({ success: true, categories });
});

exports.createListingCategory = asyncErrorHandler(async (req, res, next) => {
    const { name, extraFields, order, imageBase64 } = req.body;
    if (!name) return next(new ErrorHandler('Name is required', 400));

    let image;
    if (imageBase64) {
        const result = await cloudinary.upload(imageBase64, { folder: 'categories' });
        image = { url: result.secure_url, publicId: result.public_id };
    }

    const slug = slugify(name);
    const category = await ListingCategory.create({ name, slug, extraFields, order, image });
    res.status(201).json({ success: true, category });
});

exports.updateListingCategory = asyncErrorHandler(async (req, res, next) => {
    const { name, extraFields, order, active, imageBase64, removeImage } = req.body;
    const update = {};
    if (name !== undefined) { update.name = name; update.slug = slugify(name); }
    if (extraFields !== undefined) update.extraFields = extraFields;
    if (order !== undefined) update.order = order;
    if (active !== undefined) update.active = active;

    const existing = await ListingCategory.findById(req.params.id);
    if (!existing) return next(new ErrorHandler('Category not found', 404));

    if (removeImage && existing.image?.publicId) {
        await cloudinary.destroy(existing.image.publicId);
        update.image = { url: null, publicId: null };
    }

    if (imageBase64) {
        if (existing.image?.publicId) await cloudinary.destroy(existing.image.publicId);
        const result = await cloudinary.upload(imageBase64, { folder: 'categories' });
        update.image = { url: result.secure_url, publicId: result.public_id };
    }

    const category = await ListingCategory.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    res.status(200).json({ success: true, category });
});

exports.deleteListingCategory = asyncErrorHandler(async (req, res, next) => {
    const category = await ListingCategory.findById(req.params.id);
    if (!category) return next(new ErrorHandler('Category not found', 404));
    if (category.image?.publicId) await cloudinary.destroy(category.image.publicId);
    await category.deleteOne();
    res.status(200).json({ success: true });
});
