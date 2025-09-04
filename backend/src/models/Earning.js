import mongoose from 'mongoose';

const earningSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['quiz', 'promotion_quiz', 'referral', 'level_bonus', 'withdrawal', 'transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  wallet: {
    type: String,
    enum: ['cash', 'grow', 'scratch'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedType: {
    type: String,
    enum: ['Quiz', 'Video', 'User', 'PinRequest']
  },
  transactionId: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
earningSchema.index({ userId: 1, createdAt: -1 });
earningSchema.index({ type: 1, wallet: 1 });
earningSchema.index({ status: 1 });

export default mongoose.model('Earning', earningSchema);