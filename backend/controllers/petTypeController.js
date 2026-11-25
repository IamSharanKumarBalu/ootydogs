const PetType = require('../models/petTypeModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const slugify = require('../utils/slugify');
const cloudinary = require('../utils/localUpload');

exports.getAllPetTypes = asyncErrorHandler(async (req, res) => {
    const filter = req.user?.role === 'admin' ? {} : { active: true };
    const petTypes = await PetType.find(filter).sort({ order: 1, name: 1 });
    res.status(200).json({ success: true, petTypes });
});

exports.createPetType = asyncErrorHandler(async (req, res, next) => {
    const { name, icon, order, imageBase64 } = req.body;
    if (!name) return next(new ErrorHandler('Name is required', 400));

    let image;
    if (imageBase64) {
        const result = await cloudinary.upload(imageBase64, { folder: 'pet-types' });
        image = { url: result.secure_url, publicId: result.public_id };
    }

    const slug = slugify(name);
    const petType = await PetType.create({ name, slug, icon, order, image });
    res.status(201).json({ success: true, petType });
});

exports.updatePetType = asyncErrorHandler(async (req, res, next) => {
    const { name, icon, order, active, imageBase64, removeImage } = req.body;
    const update = {};
    if (name !== undefined) { update.name = name; update.slug = slugify(name); }
    if (icon !== undefined) update.icon = icon;
    if (order !== undefined) update.order = order;
    if (active !== undefined) update.active = active;

    const existing = await PetType.findById(req.params.id);
    if (!existing) return next(new ErrorHandler('Pet type not found', 404));

    if (removeImage && existing.image?.publicId) {
        await cloudinary.destroy(existing.image.publicId);
        update.image = { url: null, publicId: null };
    }

    if (imageBase64) {
        if (existing.image?.publicId) await cloudinary.destroy(existing.image.publicId);
        const result = await cloudinary.upload(imageBase64, { folder: 'pet-types' });
        update.image = { url: result.secure_url, publicId: result.public_id };
    }

    const petType = await PetType.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    res.status(200).json({ success: true, petType });
});

exports.deletePetType = asyncErrorHandler(async (req, res, next) => {
    const petType = await PetType.findById(req.params.id);
    if (!petType) return next(new ErrorHandler('Pet type not found', 404));
    if (petType.image?.publicId) await cloudinary.destroy(petType.image.publicId);
    await petType.deleteOne();
    res.status(200).json({ success: true });
});
