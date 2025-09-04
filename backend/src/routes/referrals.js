import express from 'express';
import User from '../models/User.js';
import ReferralSetting from '../models/ReferralSetting.js';
import Earning from '../models/Earning.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get referral tree
// @route   GET /api/v1/referrals/tree
// @access  Private
router.get('/tree', protect, async (req, res, next) => {
  try {
    const buildReferralTree = async (userId, depth = 0, maxDepth = 3) => {
      if (depth >= maxDepth) return [];
      
      const referrals = await User.find({ referredBy: userId })
        .select('username mobile level earnings isActive createdAt totalReferrals')
        .sort({ createdAt: -1 });

      const tree = [];
      for (const referral of referrals) {
        const children = await buildReferralTree(referral._id, depth + 1, maxDepth);
        tree.push({
          ...referral.toObject(),
          children
        });
      }
      
      return tree;
    };

    const tree = await buildReferralTree(req.user.id);

    // Get referral statistics
    const totalReferrals = await User.countDocuments({ referredBy: req.user.id });
    const activeReferrals = await User.countDocuments({ 
      referredBy: req.user.id, 
      isActive: true 
    });

    // Calculate total referral earnings
    const referralEarnings = await Earning.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'referral'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalEarnings = referralEarnings[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        tree,
        stats: {
          totalReferrals,
          activeReferrals,
          totalEarnings,
          referralLink: req.user.getReferralLink()
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get referral settings
// @route   GET /api/v1/referrals/settings
// @access  Private/Admin
router.get('/settings', protect, adminOnly, async (req, res, next) => {
  try {
    const settings = await ReferralSetting.find({ isActive: true })
      .sort({ level: 1 });

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update referral settings
// @route   PUT /api/v1/referrals/settings
// @access  Private/Admin
router.put('/settings', protect, adminOnly, async (req, res, next) => {
  try {
    const { settings } = req.body;

    // Delete existing settings
    await ReferralSetting.deleteMany({});

    // Create new settings
    const newSettings = await ReferralSetting.insertMany(settings);

    res.status(200).json({
      success: true,
      message: 'Referral settings updated successfully',
      data: newSettings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Process referral bonus
// @route   POST /api/v1/referrals/process-bonus
// @access  Private (Internal use)
router.post('/process-bonus', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.referredBy) {
      return res.status(400).json({
        success: false,
        message: 'User has no referrer'
      });
    }

    const referrer = await User.findById(user.referredBy);
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Referrer not found'
      });
    }

    // Get referral settings for referrer's level
    const settings = await ReferralSetting.findOne({ 
      level: referrer.role,
      isActive: true 
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'No referral settings found for referrer level'
      });
    }

    // Find applicable range based on referrer's total referrals
    const applicableRange = settings.ranges.find(range => 
      referrer.totalReferrals >= range.from && referrer.totalReferrals <= range.to
    );

    if (applicableRange) {
      // Award referral bonus
      referrer.earnings.scratch += applicableRange.amount;
      await referrer.save();

      // Record earning
      await Earning.create({
        userId: referrer._id,
        type: 'referral',
        amount: applicableRange.amount,
        wallet: 'scratch',
        description: `Referral Bonus - ${user.username} joined`,
        relatedId: user._id,
        relatedType: 'User'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Referral bonus processed',
      data: { bonusAwarded: applicableRange?.amount || 0 }
    });
  } catch (error) {
    next(error);
  }
});

export default router;