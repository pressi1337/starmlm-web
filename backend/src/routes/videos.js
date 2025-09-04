import express from 'express';
import Video from '../models/Video.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validateVideo } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get all videos
// @route   GET /api/v1/videos
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10, date, session, day } = req.query;
    
    const query = { isActive: true };
    if (type) query.type = type;
    if (date) query.showingDate = new Date(date);
    if (session) query.session = session;
    if (day) query.day = parseInt(day);

    const videos = await Video.find(query)
      .populate('createdBy', 'username')
      .sort({ showingDate: -1, day: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Video.countDocuments(query);

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get today's daily video
// @route   GET /api/v1/videos/daily/today
// @access  Private
router.get('/daily/today', protect, async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const video = await Video.findOne({
      type: 'daily',
      showingDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get training videos for user's current day
// @route   GET /api/v1/videos/training/current
// @access  Private
router.get('/training/current', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    const video = await Video.findOne({
      type: 'training',
      day: user.trainingDay,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get promotion videos for session
// @route   GET /api/v1/videos/promotion/session
// @access  Private
router.get('/promotion/session', protect, async (req, res, next) => {
  try {
    const { session } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Determine max videos based on user level
    const maxVideos = ['promotor3', 'promotor4'].includes(req.user.role) ? 4 : 2;
    
    const videos = await Video.find({
      type: 'promotion',
      session,
      showingDate: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      isActive: true
    })
    .limit(maxVideos)
    .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create video (Admin only)
// @route   POST /api/v1/videos
// @access  Private/Admin
router.post('/', protect, adminOnly, validateVideo, async (req, res, next) => {
  try {
    const videoData = {
      ...req.body,
      createdBy: req.user.id
    };

    const video = await Video.create(videoData);

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: video
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update video (Admin only)
// @route   PUT /api/v1/videos/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete video (Admin only)
// @route   DELETE /api/v1/videos/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark video as watched
// @route   POST /api/v1/videos/:id/watch
// @access  Private
router.post('/:id/watch', protect, async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Update user's watched videos
    const user = await User.findById(req.user.id);
    const alreadyWatched = user.watchedVideos.some(
      w => w.videoId.toString() === video._id.toString()
    );

    if (!alreadyWatched) {
      user.watchedVideos.push({
        videoId: video._id,
        type: video.type
      });

      // Update daily video status
      if (video.type === 'daily') {
        user.hasCompletedDailyVideo = true;
        user.lastDailyVideoDate = new Date();
      }

      await user.save();

      // Update video stats
      video.viewCount += 1;
      await video.save();
    }

    res.status(200).json({
      success: true,
      message: 'Video marked as watched',
      data: { watched: true }
    });
  } catch (error) {
    next(error);
  }
});

export default router;