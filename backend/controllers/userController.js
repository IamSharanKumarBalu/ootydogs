const User = require('../models/userModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const sendToken = require('../utils/sendToken');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const localUpload = require('../utils/localUpload');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

exports.registerUser = asyncErrorHandler(async (req, res, next) => {
    const { name, email, phone, password, state, city, address } = req.body;

    if (!name || !email || !phone || !password) {
        return next(new ErrorHandler('Name, email, phone and password are required', 400));
    }

    const user = await User.create({ name, email, phone, password, state, city, address });
    sendToken(user, 201, res);
});

exports.loginUser = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) return next(new ErrorHandler('Invalid email or password', 401));

    if (user.lockUntil && user.lockUntil > new Date()) {
        const minutes = Math.ceil((user.lockUntil - new Date()) / 60000);
        return next(new ErrorHandler(
            `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'} or reset your password.`,
            429
        ));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        const attempts = (user.loginAttempts || 0) + 1;
        const update = attempts >= MAX_LOGIN_ATTEMPTS
            ? { loginAttempts: 0, lockUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) }
            : { $inc: { loginAttempts: 1 } };
        await User.updateOne({ _id: user._id }, update);

        const left = MAX_LOGIN_ATTEMPTS - attempts;
        return next(new ErrorHandler(
            left > 0 && left <= 2
                ? `Invalid email or password. ${left} attempt${left === 1 ? '' : 's'} left before lockout.`
                : 'Invalid email or password',
            401
        ));
    }

    if (user.loginAttempts || user.lockUntil) {
        await User.updateOne({ _id: user._id }, { loginAttempts: 0, lockUntil: null });
    }

    if (user.verificationStatus === 'blocked') {
        return next(new ErrorHandler('Your account has been blocked. Please contact support.', 403));
    }

    sendToken(user, 200, res);
});

exports.logoutUser = asyncErrorHandler(async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    });
    res.status(200).json({ success: true, message: 'Logged out' });
});

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new ErrorHandler('No account found with that email', 404));

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/password/reset/${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'OotyDogs – Password Reset',
            message: `<p>Hi ${user.name},</p><p>Click the link below to reset your password. It expires in 15 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
        });
        res.status(200).json({ success: true, message: `Reset link sent to ${user.email}` });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(err.message, 500));
    }
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return next(new ErrorHandler('Invalid or expired reset token', 404));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res);
});

// ─── AUTHENTICATED ────────────────────────────────────────────────────────────

exports.getUserDetails = asyncErrorHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
});

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(req.body.oldPassword))) {
        return next(new ErrorHandler('Old password is incorrect', 400));
    }
    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res);
});

exports.updateProfile = asyncErrorHandler(async (req, res) => {
    const { name, phone, state, city, address } = req.body;
    await User.findByIdAndUpdate(
        req.user.id,
        { name, phone, state, city, address },
        { new: true, runValidators: true }
    );
    res.status(200).json({ success: true });
});

// Submit verification documents (sets status back to pending)
exports.submitVerification = asyncErrorHandler(async (req, res, next) => {
    const { documents } = req.body; // [{ base64, type }]

    if (!documents || !documents.length) {
        return next(new ErrorHandler('At least one document is required', 400));
    }

    const uploaded = [];
    for (const doc of documents) {
        const result = await localUpload.upload(doc.base64, { folder: 'verification' });
        uploaded.push({ url: result.secure_url, type: doc.type || 'other' });
    }

    await User.findByIdAndUpdate(req.user.id, {
        verificationDocuments: uploaded,
        verificationStatus: 'pending',
        verificationNote: undefined,
    });

    res.status(200).json({ success: true, message: 'Verification submitted. Admin will review shortly.' });
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────

exports.getAllUsers = asyncErrorHandler(async (req, res) => {
    const filter = {};
    if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;
    if (req.query.q) {
        filter.$or = [
            { name: { $regex: req.query.q, $options: 'i' } },
            { email: { $regex: req.query.q, $options: 'i' } },
        ];
    }
    const users = await User.find(filter).select('-resetPasswordToken -resetPasswordExpire').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
});

exports.getSingleUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler('User not found', 404));
    res.status(200).json({ success: true, user });
});

exports.adminVerifyUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler('User not found', 404));

    user.verificationStatus = 'verified';
    user.canPostListings = true;
    user.verificationNote = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'User verified' });
});

exports.adminRejectUser = asyncErrorHandler(async (req, res, next) => {
    const { reason } = req.body;
    if (!reason) return next(new ErrorHandler('Rejection reason is required', 400));

    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler('User not found', 404));

    user.verificationStatus = 'rejected';
    user.canPostListings = false;
    user.verificationNote = reason;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'User rejected' });
});

exports.adminSuspendUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler('User not found', 404));
    user.verificationStatus = 'suspended';
    user.canPostListings = false;
    user.verificationNote = req.body.reason;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, message: 'User suspended' });
});

exports.adminBlockUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler('User not found', 404));
    user.verificationStatus = 'blocked';
    user.canPostListings = false;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, message: 'User blocked' });
});

exports.adminReactivateUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler('User not found', 404));
    user.verificationStatus = 'verified';
    user.canPostListings = true;
    user.verificationNote = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, message: 'User reactivated' });
});

exports.deleteUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler('User not found', 404));
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
});
