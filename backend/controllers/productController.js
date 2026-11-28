const Product = require('../models/productModel');
const Subscription = require('../models/subscriptionModel');
const { PLANS } = require('../models/subscriptionModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const slugify = require('../utils/slugify');
const localUpload = require('../utils/localUpload');

async function generateUniqueSlug(base) {
    let slug = slugify(base);
    let count = 0;
    while (await Product.exists({ slug })) {
        count++;
        slug = `${slugify(base)}-${count}`;
    }
    return slug;
}

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

exports.getProducts = asyncErrorHandler(async (req, res) => {
    const { category, condition, state, city, q, sort, page = 1, limit = 12 } = req.query;

    const filter = {
        status: 'approved',
        isArchived: false,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    };
    if (category)  filter.category  = category;
    if (condition) filter.condition  = condition;
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (city)  filter.city  = { $regex: city,  $options: 'i' };
    if (q) filter.$or = [
        { title:       { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
    ];

    const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, price_asc: { askingPrice: 1 }, price_desc: { askingPrice: -1 } };
    const sortOrder = sortMap[sort] || { featuredProduct: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate('owner', 'name city state')
            .sort(sortOrder)
            .skip(skip)
            .limit(Number(limit)),
        Product.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        products,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
    });
});

exports.getProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findOne({ slug: req.params.slug, isArchived: false })
        .populate('owner', 'name city state createdAt');
    if (!product) return next(new ErrorHandler('Product not found', 404));
    res.status(200).json({ success: true, product });
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────

exports.createProduct = asyncErrorHandler(async (req, res, next) => {
    const {
        title, category, condition, askingPrice, negotiable,
        description, state, city, contactPhone, whatsappNumber, showContactInfo, images,
    } = req.body;

    if (!title || !category) {
        return next(new ErrorHandler('Title and category are required', 400));
    }

    // ── Subscription check ────────────────────────────────────────────────────
    const sub = await Subscription.findOne({ user: req.user.id, status: 'active' }).sort({ createdAt: -1 });
    if (!sub) return next(new ErrorHandler('NO_PLAN', 402));
    if (new Date() > sub.validUntil) {
        sub.status = 'expired';
        await sub.save();
        return next(new ErrorHandler('NO_PLAN', 402));
    }
    if (sub.listingsAllowed !== -1 && sub.listingsUsed >= sub.listingsAllowed) {
        return next(new ErrorHandler('LIMIT_REACHED', 402));
    }

    const planConfig = PLANS[sub.plan];
    const expiresAt = sub.plan === 'basic'
        ? new Date(Date.now() + planConfig.validDays * 24 * 60 * 60 * 1000)
        : sub.validUntil;
    // ─────────────────────────────────────────────────────────────────────────

    const slug = await generateUniqueSlug(`${title}-${city || ''}`);

    const product = await Product.create({
        title, category, condition,
        askingPrice: askingPrice ? Number(askingPrice) : undefined,
        negotiable: negotiable === true || negotiable === 'true',
        description, state, city, contactPhone, whatsappNumber,
        showContactInfo: showContactInfo !== false && showContactInfo !== 'false',
        owner: req.user.id,
        slug,
        status: 'pending',
        expiresAt,
        subscription: sub._id,
    });

    sub.listingsUsed += 1;
    await sub.save();

    // Handle image uploads
    if (images && images.length) {
        const uploaded = await Promise.all(
            images.slice(0, 5).map(img =>
                localUpload.upload(img.base64, { folder: 'products' }).then(r => ({
                    url: r.secure_url,
                    publicId: r.public_id,
                }))
            )
        );
        product.images = uploaded;
        await product.save();
    }

    res.status(201).json({ success: true, product });
});

exports.updateProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler('Product not found', 404));
    if (product.owner.toString() !== req.user.id) {
        return next(new ErrorHandler('Not authorised', 403));
    }

    const { newImages, removeImageIds, ...rest } = req.body;
    const updates = { ...rest };
    delete updates.owner; delete updates.status; delete updates.slug;

    if (product.status === 'approved') updates.status = 'pending';

    Object.assign(product, updates);

    // Remove images
    if (removeImageIds && removeImageIds.length) {
        product.images = product.images.filter((img, i) => !removeImageIds.includes(String(i)));
    }

    // Add new images
    if (newImages && newImages.length) {
        const remaining = 5 - product.images.length;
        if (remaining > 0) {
            const uploaded = await Promise.all(
                newImages.slice(0, remaining).map(img =>
                    localUpload.upload(img.base64, { folder: 'products' }).then(r => ({
                        url: r.secure_url, publicId: r.public_id,
                    }))
                )
            );
            product.images.push(...uploaded);
        }
    }

    await product.save();
    res.status(200).json({ success: true, product });
});

exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler('Product not found', 404));
    if (product.owner.toString() !== req.user.id) {
        return next(new ErrorHandler('Not authorised', 403));
    }

    if (product.subscription) {
        const sub = await Subscription.findById(product.subscription);
        if (sub) {
            sub.listingsUsed = Math.max(0, sub.listingsUsed - 1);
            await sub.save();
        }
    }

    product.isArchived = true;
    await product.save();
    res.status(200).json({ success: true, message: 'Product deleted' });
});

exports.getMyProducts = asyncErrorHandler(async (req, res) => {
    const products = await Product.find({ owner: req.user.id, isArchived: false })
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
});

// ─── ADMIN ───────────────────────────────────────────────────────────────────

exports.adminGetProducts = asyncErrorHandler(async (req, res) => {
    const { status, category, page = 1, limit = 20 } = req.query;
    const filter = { isArchived: false };
    if (status)   filter.status   = status;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate('owner', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Product.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, products, total, pages: Math.ceil(total / Number(limit)) });
});

exports.adminApproveProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler('Product not found', 404));
    product.status = 'approved';
    product.rejectionReason = undefined;
    if (!product.expiresAt) {
        product.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }
    await product.save();
    res.status(200).json({ success: true, product });
});

exports.adminRejectProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate('subscription');
    if (!product) return next(new ErrorHandler('Product not found', 404));

    product.status = 'rejected';
    product.rejectionReason = req.body.reason || 'Did not meet our guidelines';

    if (product.subscription) {
        const sub = await Subscription.findById(product.subscription);
        if (sub) {
            sub.listingsUsed = Math.max(0, sub.listingsUsed - 1);

            // Refund Basic plan via Razorpay
            if (sub.plan === 'basic' && !sub.refunded && sub.razorpayPaymentId) {
                try {
                    const Razorpay = require('razorpay');
                    const rzp = new Razorpay({
                        key_id: process.env.RAZORPAY_KEY_ID,
                        key_secret: process.env.RAZORPAY_KEY_SECRET,
                    });
                    const refund = await rzp.payments.refund(sub.razorpayPaymentId, {
                        amount: sub.price * 100,
                        speed: 'optimum',
                    });
                    sub.refunded = true;
                    sub.refundId = refund.id;
                    sub.status   = 'refunded';
                } catch (err) {
                    console.error('Product refund error:', err.message);
                }
            }
            await sub.save();
        }
    }

    await product.save();
    res.status(200).json({ success: true, product });
});

exports.adminFeatureProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler('Product not found', 404));
    product.featuredProduct = !product.featuredProduct;
    await product.save();
    res.status(200).json({ success: true, featured: product.featuredProduct });
});

exports.adminDeleteProduct = asyncErrorHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler('Product not found', 404));
    product.isArchived = true;
    await product.save();
    res.status(200).json({ success: true });
});
