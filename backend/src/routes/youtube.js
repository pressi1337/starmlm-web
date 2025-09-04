import express from 'express';
import YoutubeChannel from '../models/YoutubeChannel.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all YouTube channels
// @route   GET /api/v1/youtube
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const channels = await YoutubeChannel.find({ isActive: true })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: channels
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create YouTube channel (Admin only)
// @route   POST /api/v1/youtube
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, url, description } = req.body;

    const channel = await YoutubeChannel.create({
      name,
      url,
      description,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'YouTube channel added successfully',
      data: channel
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update YouTube channel (Admin only)
// @route   PUT /api/v1/youtube/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const channel = await YoutubeChannel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'YouTube channel not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'YouTube channel updated successfully',
      data: channel
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete YouTube channel (Admin only)
// @route   DELETE /api/v1/youtube/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const channel = await YoutubeChannel.findByIdAndDelete(req.params.id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'YouTube channel not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'YouTube channel deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;