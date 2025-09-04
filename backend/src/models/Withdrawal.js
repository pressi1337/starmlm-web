import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 100
  },
  method: {
    type: String,
    enum: ['bank', 'upi'],
    required: true
  },
  accountDetails: {
    accountHolderName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String,
    mobileNumber: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  processedDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  transactionId: {
    type: String
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
withdrawalSchema.index({ userId: 1, status: 1 });
withdrawalSchema.index({ status: 1, requestDate: -1 });

export default mongoose.model('Withdrawal', withdrawalSchema);