const mongoose = require('mongoose');

const breedSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Breed name is required'],
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
    },
    petType: {
        type: mongoose.Schema.ObjectId,
        ref: 'PetType',
        required: [true, 'Pet type is required'],
    },
    description: { type: String },
    image: { url: { type: String }, publicId: { type: String } },
    active: { type: Boolean, default: true },
}, { timestamps: true });

// A breed name must be unique within its pet type
breedSchema.index({ slug: 1, petType: 1 }, { unique: true });

module.exports = mongoose.model('Breed', breedSchema);
