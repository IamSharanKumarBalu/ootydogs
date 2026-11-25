const ListingCategory = require('../models/listingCategoryModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const slugify = require('../utils/slugify');

exports.getAllListingCategories = asyncErrorHandler(async (req, res) => {
    const filter = req.user?.role === 'admin' ? {} : { active: true };
    const categories = await ListingCategory.find(filter).sort({ order: 1, name: 1 });
    res.status(200).json({ success: true, categories });
});

exports.createListingCategory = asyncErrorHandler(async (req, res, next) => {
    const { name, extraFields, order } = req.body;
    if (!name) return next(new ErrorHandler('Name is required', 400));

    const slug = slugify(name);
    const category = await ListingCategory.create({ name, slug, extraFields, order });
    res.status(201).json({ success: true, category });
});

exports.updateListingCategory = asyncErrorHandler(async (req, res, next) => {
    const { name, extraFields, order, active } = req.body;
    const update = {};
    if (name !== undefined) { update.name = name; update.slug = slugify(name); }
    if (extraFields !== undefined) update.extraFields = extraFields;
    if (order !== undefined) update.order = order;
    if (active !== undefined) update.active = active;

    const category = await ListingCategory.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!category) return next(new ErrorHandler('Category not found', 404));
    res.status(200).json({ success: true, category });
});

exports.deleteListingCategory = asyncErrorHandler(async (req, res, next) => {
    const category = await ListingCategory.findByIdAndDelete(req.params.id);
    if (!category) return next(new ErrorHandler('Category not found', 404));
    res.status(200).json({ success: true });
});
