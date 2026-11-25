const mongoose = require('mongoose');

const petTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Pet type name is required'],
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    icon: { type: String }, // emoji or icon identifier, e.g. '🐕'
    active: { type: Boolean, default: true },
    order:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('PetType', petTypeSchema);
