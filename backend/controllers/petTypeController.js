const PetType = require('../models/petTypeModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const slugify = require('../utils/slugify');

exports.getAllPetTypes = asyncErrorHandler(async (req, res) => {
    const filter = req.user?.role === 'admin' ? {} : { active: true };
    const petTypes = await PetType.find(filter).sort({ order: 1, name: 1 });
    res.status(200).json({ success: true, petTypes });
});

exports.createPetType = asyncErrorHandler(async (req, res, next) => {
    const { name, icon, order } = req.body;
    if (!name) return next(new ErrorHandler('Name is required', 400));

    const slug = slugify(name);
    const petType = await PetType.create({ name, slug, icon, order });
    res.status(201).json({ success: true, petType });
});

exports.updatePetType = asyncErrorHandler(async (req, res, next) => {
    const { name, icon, order, active } = req.body;
    const update = {};
    if (name !== undefined) { update.name = name; update.slug = slugify(name); }
    if (icon !== undefined) update.icon = icon;
    if (order !== undefined) update.order = order;
    if (active !== undefined) update.active = active;

    const petType = await PetType.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!petType) return next(new ErrorHandler('Pet type not found', 404));
    res.status(200).json({ success: true, petType });
});

exports.deletePetType = asyncErrorHandler(async (req, res, next) => {
    const petType = await PetType.findByIdAndDelete(req.params.id);
    if (!petType) return next(new ErrorHandler('Pet type not found', 404));
    res.status(200).json({ success: true });
});
