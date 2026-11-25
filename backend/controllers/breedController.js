const Breed = require('../models/breedModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const slugify = require('../utils/slugify');
const cloudinary = require('../utils/localUpload');

exports.getAllBreeds = asyncErrorHandler(async (req, res) => {
    const filter = req.user?.role === 'admin' ? {} : { active: true };
    if (req.query.petType) filter.petType = req.query.petType;
    const limit = req.query.limit ? Number(req.query.limit) : 0;
    const breeds = await Breed.find(filter).populate('petType', 'name slug').sort({ name: 1 }).limit(limit);
    res.status(200).json({ success: true, breeds });
});

exports.createBreed = asyncErrorHandler(async (req, res, next) => {
    const { name, petType, description, imageBase64 } = req.body;
    if (!name || !petType) return next(new ErrorHandler('Name and petType are required', 400));

    let image;
    if (imageBase64) {
        const result = await cloudinary.upload(imageBase64, { folder: 'breeds' });
        image = { url: result.secure_url, publicId: result.public_id };
    }

    const slug = slugify(name);
    const breed = await Breed.create({ name, slug, petType, description, image });
    res.status(201).json({ success: true, breed });
});

exports.updateBreed = asyncErrorHandler(async (req, res, next) => {
    const { name, petType, description, active, imageBase64, removeImage } = req.body;
    const update = {};
    if (name !== undefined) { update.name = name; update.slug = slugify(name); }
    if (petType !== undefined) update.petType = petType;
    if (description !== undefined) update.description = description;
    if (active !== undefined) update.active = active;

    const existing = await Breed.findById(req.params.id);
    if (!existing) return next(new ErrorHandler('Breed not found', 404));

    if (removeImage && existing.image?.publicId) {
        await cloudinary.destroy(existing.image.publicId);
        update.image = { url: null, publicId: null };
    }

    if (imageBase64) {
        if (existing.image?.publicId) await cloudinary.destroy(existing.image.publicId);
        const result = await cloudinary.upload(imageBase64, { folder: 'breeds' });
        update.image = { url: result.secure_url, publicId: result.public_id };
    }

    const breed = await Breed.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    res.status(200).json({ success: true, breed });
});

exports.deleteBreed = asyncErrorHandler(async (req, res, next) => {
    const breed = await Breed.findById(req.params.id);
    if (!breed) return next(new ErrorHandler('Breed not found', 404));
    if (breed.image?.publicId) await cloudinary.destroy(breed.image.publicId);
    await breed.deleteOne();
    res.status(200).json({ success: true });
});
