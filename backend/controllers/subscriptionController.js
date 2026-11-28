const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/subscriptionModel');
const { PLANS } = require('../models/subscriptionModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');

function getRazorpay() {
    return new Razorpay({
        key_id:     process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
}

// GET /api/v1/subscription/plans  — public
exports.getPlans = asyncErrorHandler(async (req, res) => {
    const plans = Object.entries(PLANS).map(([key, p]) => ({ id: key, ...p }));
    res.status(200).json({ success: true, plans });
});

// GET /api/v1/subscription/my-plan  — auth required
exports.getMyPlan = asyncErrorHandler(async (req, res) => {
    const sub = await Subscription.findOne({ user: req.user.id, status: 'active' }).sort({ createdAt: -1 });

    // Check if active subscription has expired
    if (sub && new Date() > sub.validUntil) {
        sub.status = 'expired';
        await sub.save();
        return res.status(200).json({ success: true, subscription: null });
    }

    res.status(200).json({ success: true, subscription: sub || null });
});

// POST /api/v1/subscription/create-order  — auth required
exports.createOrder = asyncErrorHandler(async (req, res, next) => {
    const { plan } = req.body;
    if (!PLANS[plan]) return next(new ErrorHandler('Invalid plan', 400));

    const { price } = PLANS[plan];
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
        amount: price * 100, // paise
        currency: 'INR',
        receipt: `sub_${req.user.id}_${Date.now()}`,
        notes: { plan, userId: req.user.id.toString() },
    });

    // Create a pending subscription record
    await Subscription.create({
        user: req.user.id,
        plan,
        price,
        listingsAllowed: PLANS[plan].listingsAllowed,
        status: 'pending',
        razorpayOrderId: order.id,
    });

    res.status(200).json({
        success: true,
        order,
        key: process.env.RAZORPAY_KEY_ID,
    });
});

// GET /api/v1/admin/transactions  — admin only
exports.adminGetTransactions = asyncErrorHandler(async (req, res) => {
    const { page = 1, limit = 20, plan, status } = req.query;
    const filter = {};
    if (plan)   filter.plan   = plan;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [subscriptions, total] = await Promise.all([
        Subscription.find(filter)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Subscription.countDocuments(filter),
    ]);

    // Revenue summary
    const revenue = await Subscription.aggregate([
        { $match: { status: { $in: ['active', 'expired'] } } },
        { $group: { _id: null, total: { $sum: '$price' }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
        success: true,
        total,
        pages: Math.ceil(total / Number(limit)),
        subscriptions,
        revenue: revenue[0] || { total: 0, count: 0 },
    });
});

// POST /api/v1/subscription/verify-payment  — auth required
exports.verifyPayment = asyncErrorHandler(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return next(new ErrorHandler('Payment details missing', 400));
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    if (expected !== razorpay_signature) {
        return next(new ErrorHandler('Payment verification failed', 400));
    }

    // Activate subscription
    const sub = await Subscription.findOne({ razorpayOrderId: razorpay_order_id, user: req.user.id });
    if (!sub) return next(new ErrorHandler('Subscription record not found', 404));

    const now = new Date();
    sub.status = 'active';
    sub.validFrom = now;
    sub.validUntil = new Date(now.getTime() + PLANS[sub.plan].validDays * 24 * 60 * 60 * 1000);
    sub.razorpayPaymentId = razorpay_payment_id;
    sub.razorpaySignature = razorpay_signature;
    await sub.save();

    res.status(200).json({ success: true, subscription: sub });
});
