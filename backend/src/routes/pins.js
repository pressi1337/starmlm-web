import express from 'express';
import PinRequest from '../models/PinRequest.js';
import User from '../models/User.js';
import Earning from '../models/Earning.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all pin requests
// @route   GET /api/v1/pins
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    
    const query = {};
    if (status && status !== 'all') query.status = status;
    
    // Users can only see their own requests, admins can see all
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    } else if (userId) {
      query.userId = userId;
    }

    const pinRequests = await PinRequest.find(query)
      .populate('userId', 'username mobile level')
      .populate('approvedBy', 'username')
      .sort({ requestDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PinRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: pinRequests,
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

// @desc    Create pin request
// @route   POST /api/v1/pins/request
// @access  Private
router.post('/request', protect, async (req, res, next) => {
  try {
    const { requestedLevel } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Check if user can upgrade to requested level
    const upgradeMap = {
      promotor: ['promotor1'],
      promotor1: ['promotor2'],
      promotor2: ['promotor3', 'promotor4']
    };
    
    const allowedUpgrades = upgradeMap[user.role] || [];
    if (!allowedUpgrades.includes(requestedLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level upgrade request'
      });
    }

    // Check for existing pending request
    const existingRequest = await PinRequest.findOne({
      userId: user._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending pin request'
      });
    }

    const pinRequest = await PinRequest.create({
      userId: user._id,
      currentLevel: user.role,
      requestedLevel
    });

    res.status(201).json({
      success: true,
      message: 'Pin request submitted successfully',
      data: pinRequest
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Approve pin request (Admin only)
// @route   PUT /api/v1/pins/:id/approve
// @access  Private/Admin
router.put('/:id/approve', protect, adminOnly, async (req, res, next) => {
  try {
    const pinRequest = await PinRequest.findById(req.params.id);
    
    if (!pinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Pin request not found'
      });
    }

    if (pinRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Pin request is not in pending status'
      });
    }

    // Generate pin
    const pin = Math.random().toString(36).substr(2, 8).toUpperCase();

    pinRequest.status = 'approved';
    pinRequest.approvedDate = new Date();
    pinRequest.approvedBy = req.user.id;
    pinRequest.pin = pin;

    await pinRequest.save();

    res.status(200).json({
      success: true,
      message: 'Pin request approved successfully',
      data: pinRequest
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Activate pin
// @route   POST /api/v1/pins/:id/activate
// @access  Private
router.post('/:id/activate', protect, async (req, res, next) => {
  try {
    const { address, alternativeMobile, deliveryMethod } = req.body;
    
    const pinRequest = await PinRequest.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'approved'
    });

    if (!pinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Approved pin request not found'
      });
    }

    // Update pin request
    pinRequest.status = 'activated';
    pinRequest.activatedDate = new Date();
    pinRequest.activationDetails = {
      address,
      alternativeMobile,
      deliveryMethod
    };

    await pinRequest.save();

    // Update user level
    const user = await User.findById(req.user.id);
    user.role = pinRequest.requestedLevel;
    await user.save();

    // Award level upgrade bonus
    const bonusAmount = 500; // Base bonus, can be configured
    user.earnings.grow += bonusAmount;
    await user.save();

    // Record earning
    await Earning.create({
      userId: user._id,
      type: 'level_bonus',
      amount: bonusAmount,
      wallet: 'grow',
      description: `Level Upgrade Bonus - ${user.level}`,
      relatedId: pinRequest._id,
      relatedType: 'PinRequest'
    });

    res.status(200).json({
      success: true,
      message: 'Pin activated successfully! Level upgraded.',
      data: {
        newLevel: user.level,
        bonus: bonusAmount
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Reject pin request (Admin only)
// @route   PUT /api/v1/pins/:id/reject
// @access  Private/Admin
router.put('/:id/reject', protect, adminOnly, async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const pinRequest = await PinRequest.findById(req.params.id);
    
    if (!pinRequest) {
      return res.status(404).json({
        success: false,
        message: 'Pin request not found'
      });
    }

    pinRequest.status = 'rejected';
    pinRequest.notes = reason;
    await pinRequest.save();

    res.status(200).json({
      success: true,
      message: 'Pin request rejected',
      data: pinRequest
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get pin request statistics (Admin only)
// @route   GET /api/v1/pins/stats
// @access  Private/Admin
router.get('/stats/overview', protect, adminOnly, async (req, res, next) => {
  try {
    const stats = await PinRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      approved: 0,
      activated: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    next(error);
  }
});

export default router;