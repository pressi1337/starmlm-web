import express from 'express';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import Earning from '../models/Earning.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validateQuiz } from '../middleware/validation.js';

const router = express.Router();

// @desc    Get all quizzes
// @route   GET /api/v1/quizzes
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { videoId, page = 1, limit = 10 } = req.query;
    
    const query = { isActive: true };
    if (videoId) query.videoId = videoId;

    const quizzes = await Quiz.find(query)
      .populate('videoId', 'title type day session')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quiz.countDocuments(query);

    res.status(200).json({
      success: true,
      data: quizzes,
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

// @desc    Get quiz by video ID
// @route   GET /api/v1/quizzes/video/:videoId
// @access  Private
router.get('/video/:videoId', protect, async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({ 
      videoId: req.params.videoId,
      isActive: true 
    }).populate('videoId', 'title type');

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create quiz (Admin only)
// @route   POST /api/v1/quizzes
// @access  Private/Admin
router.post('/', protect, adminOnly, validateQuiz, async (req, res, next) => {
  try {
    const quizData = {
      ...req.body,
      createdBy: req.user.id
    };

    const quiz = await Quiz.create(quizData);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update quiz (Admin only)
// @route   PUT /api/v1/quizzes/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Submit quiz answers
// @route   POST /api/v1/quizzes/:id/submit
// @access  Private
router.post('/:id/submit', protect, async (req, res, next) => {
  try {
    const { answers } = req.body;
    
    const quiz = await Quiz.findById(req.params.id).populate('videoId');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if already completed
    const user = await User.findById(req.user.id);
    const alreadyCompleted = user.completedQuizzes.some(
      cq => cq.quizId.toString() === quiz._id.toString()
    );

    if (alreadyCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Quiz already completed'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach(question => {
      const userAnswer = answers[question._id.toString()];
      const correctChoice = question.choices.find(c => c.isCorrect);
      if (userAnswer === correctChoice._id.toString()) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / quiz.questions.length) * 100;
    const passed = score >= quiz.passThreshold;

    // Award earnings if passed
    let earnings = 0;
    if (passed) {
      earnings = quiz.earnings[user.role] || 0;
      
      // Update user earnings
      user.earnings.scratch += earnings;
      
      // Record earning
      await Earning.create({
        userId: user._id,
        type: quiz.videoId.type === 'promotion' ? 'promotion_quiz' : 'quiz',
        amount: earnings,
        wallet: 'scratch',
        description: `${quiz.videoId.type === 'promotion' ? 'Promotion' : 'Training'} Quiz - ${quiz.videoId.title}`,
        relatedId: quiz._id,
        relatedType: 'Quiz'
      });
    }

    // Record quiz completion
    user.completedQuizzes.push({
      quizId: quiz._id,
      score,
      earnings
    });

    // Advance training day if it's a training quiz and passed
    if (quiz.videoId.type === 'training' && passed && user.trainingDay < 7) {
      user.trainingDay += 1;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: passed ? 'Quiz completed successfully!' : 'Quiz failed. Try again.',
      data: {
        score,
        passed,
        earnings,
        correctAnswers,
        totalQuestions: quiz.questions.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete quiz (Admin only)
// @route   DELETE /api/v1/quizzes/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;