const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email'],
    },
    phone: {
        type: String,
        required: [true, 'Please enter your mobile number'],
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },

    // Location
    state: { type: String, trim: true },
    city:  { type: String, trim: true },
    address: { type: String, trim: true },

    // Verification workflow
    // Email/phone verify alone does NOT grant verified status — admin must approve.
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'suspended', 'blocked'],
        default: 'pending',
    },
    verificationDocuments: [
        {
            url:        { type: String },
            type:       { type: String }, // e.g. 'aadhaar', 'pan', 'other'
            uploadedAt: { type: Date, default: Date.now },
        },
    ],
    verificationNote: { type: String }, // admin rejection/suspension reason
    canPostListings: {
        type: Boolean,
        default: false, // set true only after admin approves verification
    },

    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: String,
    emailVerifyExpire: Date,

    // Brute-force login protection
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil:     { type: Date, default: null, select: false },

    // Password reset
    resetPasswordToken:  String,
    resetPasswordExpire: Date,

    createdAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
