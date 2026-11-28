const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('./asyncErrorHandler');

exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {

    let token = req.cookies.token;

    // Check for Bearer token in Authorization header if no cookie
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorHandler("Please Login to Access", 401))
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed`, 403));
        }
        next();
    }
}

// Populates req.user if a valid token is present, otherwise proceeds as anonymous.
exports.optionalAuth = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        if (!token && req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
        }
    } catch { /* invalid/expired token — proceed as anonymous */ }
    next();
};

// Blocks listing creation until admin has verified the user.
exports.requireVerified = (req, res, next) => {
    if (!req.user.canPostListings) {
        return next(new ErrorHandler('Your account must be verified before you can post listings', 403));
    }
    next();
};