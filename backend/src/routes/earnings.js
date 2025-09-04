import express from 'express';
import Earning from '../models/Earning.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user earnings history
// @route   GET /api/v1/earnings
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      wallet, 
      dateRange,
      userId 
    } = req.query;
    
    const query = {};
    
    // Users can only see their own earnings, admins can see all
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    } else if (userId) {
      query.userId = userId;
    }

    if (type && type !== 'all') query.type = type;
    if (wallet && wallet !== 'all') query.wallet = wallet;
    
    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      query.createdAt = { $gte: cutoffDate };
    }

    const earnings = await Earning.find(query)
      .populate('userId', 'username mobile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Earning.countDocuments(query);

    // Calculate totals
    const totals = await Earning.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: {
              $cond: [{ $gt: ['$amount', 0] }, '$amount', 0]
            }
          },
          totalWithdrawals: {
            $sum: {
              $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: earnings,
      totals: totals[0] || { totalEarnings: 0, totalWithdrawals: 0 },
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

// @desc    Get earnings statistics
// @route   GET /api/v1/earnings/stats
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const userId = req.user.role === 'admin' ? req.query.userId : req.user.id;
    
    const stats = await Earning.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$wallet',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Earning.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        walletStats: stats,
        typeStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Transfer between wallets
// @route   POST /api/v1/earnings/transfer
// @access  Private
router.post('/transfer', protect, async (req, res, next) => {
  try {
    const { fromWallet, toWallet, amount } = req.body;
    
    if (fromWallet === toWallet) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer to the same wallet'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (user.earnings[fromWallet] < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Only allow scratch to cash transfers
    if (fromWallet !== 'scratch' || toWallet !== 'cash') {
      return res.status(400).json({
        success: false,
        message: 'Only scratch to cash transfers are allowed'
      });
    }

    // Perform transfer
    user.earnings[fromWallet] -= amount;
    user.earnings[toWallet] += amount;
    await user.save();

    // Record transactions
    await Earning.create([
      {
        userId: user._id,
        type: 'transfer',
        amount: -amount,
        wallet: fromWallet,
        description: `Transfer to ${toWallet} wallet`
      },
      {
        userId: user._id,
        type: 'transfer',
        amount: amount,
        wallet: toWallet,
        description: `Transfer from ${fromWallet} wallet`
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        newBalances: user.earnings
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;