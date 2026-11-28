const ServiceCategory = require('../models/serviceCategoryModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const slugify = require('../utils/slugify');
const cloudinary = require('../utils/localUpload');

exports.getAllServiceCategories = asyncErrorHandler(async (req, res) => {
    const isAdmin = req.user?.role === 'admin';
    const filter = isAdmin ? {} : { active: true };
    const limit = parseInt(req.query.limit) || 0;
    const dbQuery = ServiceCategory.find(filter).sort({ order: 1, name: 1 });
    const categories = await (limit > 0 ? dbQuery.limit(limit) : dbQuery);
    res.status(200).json({ success: true, categories });
});

exports.createServiceCategory = asyncErrorHandler(async (req, res, next) => {
    const { name, description, order, imageBase64 } = req.body;
    if (!name) return next(new ErrorHandler('Name is required', 400));

    let image;
    if (imageBase64) {
        const result = await cloudinary.upload(imageBase64, { folder: 'service-categories' });
        image = { url: result.secure_url, publicId: result.public_id };
    }

    const slug = slugify(name);
    const category = await ServiceCategory.create({ name, slug, description, order, image });
    res.status(201).json({ success: true, category });
});
  
exports.updateServiceCategory = asyncErrorHandler(async (req, res, next) => {
    const { name, description, order, active, imageBase64, removeImage } = req.body;
    const update = {};
    if (name !== undefined) { update.name = name; update.slug = slugify(name); }
    if (description !== undefined) update.description = description;
    if (order !== undefined) update.order = order;
    if (active !== undefined) update.active = active;

    const existing = await ServiceCategory.findById(req.params.id);
    if (!existing) return next(new ErrorHandler('Category not found', 404));

    if (removeImage && existing.image?.publicId) {
        await cloudinary.destroy(existing.image.publicId);
        update.image = { url: null, publicId: null };
    }
    if (imageBase64) {
        if (existing.image?.publicId) await cloudinary.destroy(existing.image.publicId);
        const result = await cloudinary.upload(imageBase64, { folder: 'service-categories' });
        update.image = { url: result.secure_url, publicId: result.public_id };
    }

    const category = await ServiceCategory.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    res.status(200).json({ success: true, category });
});

exports.deleteServiceCategory = asyncErrorHandler(async (req, res, next) => {
    const category = await ServiceCategory.findById(req.params.id);
    if (!category) return next(new ErrorHandler('Category not found', 404));
    if (category.image?.publicId) await cloudinary.destroy(category.image.publicId);
    await category.deleteOne();
    res.status(200).json({ success: true });
});
