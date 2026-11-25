const Slider = require('../models/sliderModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const localUpload = require('../utils/localUpload');

// Video upload validation constants
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB in bytes
const MAX_VIDEO_DURATION = 30; // 30 seconds
const ALLOWED_VIDEO_FORMATS = ['mp4', 'webm', 'mov'];

// Get All Active Sliders (Public)
exports.getAllSliders = asyncErrorHandler(async (req, res, next) => {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json({ success: true, sliders });
});

// Get All Sliders (Admin)
exports.getAdminSliders = asyncErrorHandler(async (req, res, next) => {
    const sliders = await Slider.find().sort({ order: 1 });
    res.status(200).json({ success: true, sliders });
});

// Get Slider Details
exports.getSliderDetails = asyncErrorHandler(async (req, res, next) => {
    const slider = await Slider.findById(req.params.id);
    if (!slider) return next(new ErrorHandler('Slider Not Found', 404));
    res.status(200).json({ success: true, slider });
});

// Create Slider (Admin)
exports.createSlider = asyncErrorHandler(async (req, res, next) => {
    const { title, subtitle, ctaText, ctaLink, mediaType, order, isActive } = req.body;

    if (!title || !subtitle || !mediaType) {
        return next(new ErrorHandler('Please provide title, subtitle, and media type', 400));
    }
    if (!['image', 'video'].includes(mediaType)) {
        return next(new ErrorHandler('Media type must be either image or video', 400));
    }

    let uploadResult;
    const sliderData = {
        title, subtitle,
        ctaText: ctaText || 'Explore Collection',
        ctaLink: ctaLink || '/search',
        mediaType,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
    };

    try {
        if (mediaType === 'image') {
            if (!req.body.image) return next(new ErrorHandler('Please provide an image', 400));
            uploadResult = await localUpload.upload(req.body.image, { folder: 'sliders' });
            sliderData.image = { public_id: uploadResult.public_id, url: uploadResult.secure_url };
        } else {
            if (!req.body.video) return next(new ErrorHandler('Please provide a video', 400));
            const videoData = req.body.video;
            const estimatedSize = (videoData.length * 3) / 4;
            if (estimatedSize > MAX_VIDEO_SIZE) {
                return next(new ErrorHandler(`Video size must be less than ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`, 400));
            }
            uploadResult = await localUpload.upload(videoData, { folder: 'sliders' });
            sliderData.video = {
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url,
                duration: 0,
                format: 'mp4',
            };
        }

        const slider = await Slider.create(sliderData);
        res.status(201).json({ success: true, slider });
    } catch (error) {
        if (uploadResult && uploadResult.public_id) {
            await localUpload.destroy(uploadResult.public_id);
        }
        throw error;
    }
});

// Update Slider (Admin)
exports.updateSlider = asyncErrorHandler(async (req, res, next) => {
    let slider = await Slider.findById(req.params.id);
    if (!slider) return next(new ErrorHandler('Slider Not Found', 404));

    const { title, subtitle, ctaText, ctaLink, order, isActive, image, video } = req.body;

    if (title) slider.title = title;
    if (subtitle) slider.subtitle = subtitle;
    if (ctaText !== undefined) slider.ctaText = ctaText;
    if (ctaLink !== undefined) slider.ctaLink = ctaLink;
    if (order !== undefined) slider.order = order;
    if (isActive !== undefined) slider.isActive = isActive;

    let uploadResult;
    try {
        if (image && slider.mediaType === 'image') {
            if (slider.image && slider.image.public_id) {
                await localUpload.destroy(slider.image.public_id);
            }
            uploadResult = await localUpload.upload(image, { folder: 'sliders' });
            slider.image = { public_id: uploadResult.public_id, url: uploadResult.secure_url };
        }

        if (video && slider.mediaType === 'video') {
            if (slider.video && slider.video.public_id) {
                await localUpload.destroy(slider.video.public_id);
            }
            const estimatedSize = (video.length * 3) / 4;
            if (estimatedSize > MAX_VIDEO_SIZE) {
                return next(new ErrorHandler(`Video size must be less than ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`, 400));
            }
            uploadResult = await localUpload.upload(video, { folder: 'sliders' });
            slider.video = {
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url,
                duration: 0,
                format: 'mp4',
            };
        }

        await slider.save();
        res.status(200).json({ success: true, slider });
    } catch (error) {
        if (uploadResult && uploadResult.public_id) {
            await localUpload.destroy(uploadResult.public_id);
        }
        throw error;
    }
});

// Delete Slider (Admin)
exports.deleteSlider = asyncErrorHandler(async (req, res, next) => {
    const slider = await Slider.findById(req.params.id);
    if (!slider) return next(new ErrorHandler('Slider Not Found', 404));

    if (slider.mediaType === 'image' && slider.image && slider.image.public_id) {
        await localUpload.destroy(slider.image.public_id);
    } else if (slider.mediaType === 'video' && slider.video && slider.video.public_id) {
        await localUpload.destroy(slider.video.public_id);
    }

    await slider.deleteOne();
    res.status(200).json({ success: true, message: 'Slider deleted successfully' });
});

// Update Slider Order (Admin)
exports.updateSliderOrder = asyncErrorHandler(async (req, res, next) => {
    const { sliders } = req.body;
    if (!Array.isArray(sliders)) {
        return next(new ErrorHandler('Please provide an array of sliders', 400));
    }
    await Promise.all(sliders.map(({ id, order }) =>
        Slider.findByIdAndUpdate(id, { order }, { new: true })
    ));
    const updatedSliders = await Slider.find().sort({ order: 1 });
    res.status(200).json({ success: true, sliders: updatedSliders });
});
