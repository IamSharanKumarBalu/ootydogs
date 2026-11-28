const mongoose = require('mongoose');

const petListingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Listing title is required'],
        trim: true,
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Owner is required'],
    },
    petType: {
        type: mongoose.Schema.ObjectId,
        ref: 'PetType',
        required: [true, 'Pet type is required'],
    },
    breed: {
        type: mongoose.Schema.ObjectId,
        ref: 'Breed',
        required: [true, 'Breed is required'],
    },
    listingCategory: {
        type: mongoose.Schema.ObjectId,
        ref: 'ListingCategory',
        required: [true, 'Listing category is required'],
    },

    // Pet details
    petName:  { type: String, trim: true },
    age:      { type: String, trim: true }, // free text: "2 years", "8 months"
    gender:   { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    colour:   { type: String, trim: true },

    // Location
    state: { type: String, trim: true },
    city:  { type: String, trim: true },

    // Descriptions
    description: { type: String },
    healthInfo:  { type: String },
    vaccinationStatus: {
        type: String,
        enum: ['yes', 'no', 'partial', 'unknown'],
        default: 'unknown',
    },

    // Contact
    contactPhone:   { type: String },
    whatsappNumber: { type: String },
    showContactInfo: { type: Boolean, default: true },

    // Category-specific extra fields (e.g. lastSeenDate for lost pets)
    extraFields: { type: mongoose.Schema.Types.Mixed },

    // Approval lifecycle
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected', 'expired', 'unavailable'],
        default: 'draft',
    },
    rejectionReason: { type: String },

    // Admin controls
    featuredListing: { type: Boolean, default: false },

    // SEO
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },

    // Subscription that funded this listing
    subscription: { type: mongoose.Schema.ObjectId, ref: 'Subscription' },

    // Expiry
    expiresAt: { type: Date },

    // Soft-delete / archive
    isArchived: { type: Boolean, default: false },
}, { timestamps: true });

petListingSchema.index({ status: 1 });
petListingSchema.index({ petType: 1, status: 1 });
petListingSchema.index({ listingCategory: 1, status: 1 });
petListingSchema.index({ state: 1, city: 1 });
petListingSchema.index({ owner: 1 });

module.exports = mongoose.model('PetListing', petListingSchema);
