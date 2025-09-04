import express from 'express';
import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import Earning from '../models/Earning.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validateWithdrawal } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get withdrawal requests
// @route   GET /api/v1/withdrawals
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    
    const query = {};
    if (status && status !== 'all') query.status = status;
    
    // Users can only see their own withdrawals, admins can see all
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    } else if (userId) {
      query.userId = userId;
    }

    const withdrawals = await Withdrawal.find(query)
      .populate('userId', 'username mobile')
      .populate('processedBy', 'username')
      .sort({ requestDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Withdrawal.countDocuments(query);

    res.status(200).json({
      success: true,
      data: withdrawals,
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

// @desc    Create withdrawal request
// @route   POST /api/v1/withdrawals
// @access  Private
router.post('/', protect, validateWithdrawal, async (req, res, next) => {
  try {
    const { amount, method, accountDetails } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Check if user has sufficient balance
    if (user.earnings.cash < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient cash balance'
      });
    }

    // Check minimum withdrawal amount
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₹100'
      });
    }

    // Deduct amount from user's cash wallet
    user.earnings.cash -= amount;
    await user.save();

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      userId: user._id,
      amount,
      method,
      accountDetails
    });

    // Record earning transaction
    await Earning.create({
      userId: user._id,
      type: 'withdrawal',
      amount: -amount,
      wallet: 'cash',
      description: `Withdrawal request - ${method}`,
      relatedId: withdrawal._id,
      relatedType: 'Withdrawal'
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Process withdrawal (Admin only)
// @route   PUT /api/v1/withdrawals/:id/process
// @access  Private/Admin
router.put('/:id/process', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, transactionId, notes } = req.body;
    
    const withdrawal = await Withdrawal.findById(req.params.id);
    
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal request not found'
      });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal request is not in pending status'
      });
    }

    const updateData = {
      status,
      processedBy: req.user.id,
      processedDate: new Date(),
      notes
    };

    if (status === 'completed') {
      updateData.completedDate = new Date();
      updateData.transactionId = transactionId;
    } else if (status === 'rejected') {
      // Refund amount to user's cash wallet
      const user = await User.findById(withdrawal.userId);
      user.earnings.cash += withdrawal.amount;
      await user.save();

      // Record refund transaction
      await Earning.create({
        userId: user._id,
        type: 'transfer',
        amount: withdrawal.amount,
        wallet: 'cash',
        description: `Withdrawal refund - Request rejected`,
        relatedId: withdrawal._id,
        relatedType: 'Withdrawal'
      });
    }

    const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'username mobile');

    res.status(200).json({
      success: true,
      message: `Withdrawal request ${status}`,
      data: updatedWithdrawal
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get withdrawal statistics (Admin only)
// @route   GET /api/v1/withdrawals/stats
// @access  Private/Admin
router.get('/stats/overview', protect, adminOnly, async (req, res, next) => {
  try {
    const stats = await Withdrawal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const formattedStats = {
      pending: { count: 0, amount: 0 },
      processing: { count: 0, amount: 0 },
      completed: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 }
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount
      };
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