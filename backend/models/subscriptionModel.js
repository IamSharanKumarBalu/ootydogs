const mongoose = require('mongoose');

const PLANS = {
    basic:    { price: 100,  listingsAllowed: 1,  validDays: 30,  label: 'Basic' },
    standard: { price: 1000, listingsAllowed: 15, validDays: 365, label: 'Standard' },
    premium:  { price: 5000, listingsAllowed: -1, validDays: 365, label: 'Premium' }, // -1 = unlimited
};

const subscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
    price: { type: Number, required: true },
    listingsAllowed: { type: Number, required: true }, // -1 = unlimited
    listingsUsed:    { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'active', 'expired'], default: 'pending' },
    validFrom:  { type: Date },
    validUntil: { type: Date },
    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
}, { timestamps: true });

subscriptionSchema.index({ user: 1, status: 1 });

subscriptionSchema.methods.canPost = function () {
    if (this.status !== 'active') return false;
    if (new Date() > this.validUntil) return false;
    if (this.listingsAllowed === -1) return true;
    return this.listingsUsed < this.listingsAllowed;
};

subscriptionSchema.methods.listingsRemaining = function () {
    if (this.listingsAllowed === -1) return Infinity;
    return Math.max(0, this.listingsAllowed - this.listingsUsed);
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;
module.exports.PLANS = PLANS;
