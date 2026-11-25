const Breed = require('../models/breedModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const slugify = require('../utils/slugify');

exports.getAllBreeds = asyncErrorHandler(async (req, res) => {
    const filter = req.user?.role === 'admin' ? {} : { active: true };
    if (req.query.petType) filter.petType = req.query.petType;
    const breeds = await Breed.find(filter).populate('petType', 'name slug').sort({ name: 1 });
    res.status(200).json({ success: true, breeds });
});

exports.createBreed = asyncErrorHandler(async (req, res, next) => {
    const { name, petType, description } = req.body;
    if (!name || !petType) return next(new ErrorHandler('Name and petType are required', 400));

    const slug = slugify(name);
    const breed = await Breed.create({ name, slug, petType, description });
    res.status(201).json({ success: true, breed });
});

exports.updateBreed = asyncErrorHandler(async (req, res, next) => {
    const { name, petType, description, active } = req.body;
    const update = {};
    if (name !== undefined) { update.name = name; update.slug = slugify(name); }
    if (petType !== undefined) update.petType = petType;
    if (description !== undefined) update.description = description;
    if (active !== undefined) update.active = active;

    const breed = await Breed.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!breed) return next(new ErrorHandler('Breed not found', 404));
    res.status(200).json({ success: true, breed });
});

exports.deleteBreed = asyncErrorHandler(async (req, res, next) => {
    const breed = await Breed.findByIdAndDelete(req.params.id);
    if (!breed) return next(new ErrorHandler('Breed not found', 404));
    res.status(200).json({ success: true });
});
