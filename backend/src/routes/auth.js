import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { validateLogin, validateRegister } from '../middleware/validation.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { username, mobile, password, language, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this username or mobile already exists'
      });
    }

    // Handle referral
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Create user
    const user = await User.create({
      username,
      mobile,
      password,
      language,
      referredBy
    });

    // Update referrer's referral count
    if (referredBy) {
      await User.findByIdAndUpdate(referredBy, {
        $inc: { totalReferrals: 1, activeReferrals: 1 }
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        mobile: user.mobile,
        role: user.role,
        level: user.level,
        language: user.language,
        earnings: user.earnings,
        trainingDay: user.trainingDay
      },
      access_token: token
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // Find user by username or mobile
    const user = await User.findOne({
      $or: [
        { username: identifier },
        { mobile: identifier }
      ]
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        mobile: user.mobile,
        role: user.role,
        level: user.level,
        language: user.language,
        earnings: user.earnings,
        trainingDay: user.trainingDay,
        hasCompletedDailyVideo: user.hasCompletedDailyVideo
      },
      access_token: token
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current user
// @route   GET /api/v1/auth-user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('referredBy', 'username level')
      .select('-password');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        mobile: user.mobile,
        role: user.role,
        level: user.level,
        language: user.language,
        earnings: user.earnings,
        trainingDay: user.trainingDay,
        hasCompletedDailyVideo: user.hasCompletedDailyVideo,
        totalReferrals: user.totalReferrals,
        activeReferrals: user.activeReferrals,
        referralCode: user.referralCode,
        referralLink: user.getReferralLink(),
        referredBy: user.referredBy
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { language, earnings, trainingDay, hasCompletedDailyVideo } = req.body;
    
    const updateData = {};
    if (language) updateData.language = language;
    if (earnings) updateData.earnings = earnings;
    if (trainingDay) updateData.trainingDay = trainingDay;
    if (hasCompletedDailyVideo !== undefined) updateData.hasCompletedDailyVideo = hasCompletedDailyVideo;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;