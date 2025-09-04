import mongoose from 'mongoose';

const pinRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentLevel: {
    type: String,
    required: true
  },
  requestedLevel: {
    type: String,
    required: true,
    enum: ['promotor1', 'promotor2', 'promotor3', 'promotor4']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'activated', 'rejected'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: {
    type: Date
  },
  activatedDate: {
    type: Date
  },
  activationDetails: {
    address: String,
    alternativeMobile: String,
    deliveryMethod: {
      type: String,
      enum: ['pickup', 'courier']
    }
  },
  pin: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
pinRequestSchema.index({ userId: 1, status: 1 });
pinRequestSchema.index({ status: 1, requestDate: -1 });

export default mongoose.model('PinRequest', pinRequestSchema);