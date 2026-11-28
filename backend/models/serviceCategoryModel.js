const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
    },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { url: { type: String }, publicId: { type: String } },
    active: { type: Boolean, default: true },
    order:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
