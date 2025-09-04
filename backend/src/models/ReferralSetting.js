import mongoose from 'mongoose';

const rangeSchema = new mongoose.Schema({
  from: {
    type: Number,
    required: true,
    min: 1
  },
  to: {
    type: Number,
    required: true,
    min: 1
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  }
});

const referralSettingSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['promotor', 'promotor1', 'promotor2', 'promotor3', 'promotor4'],
    unique: true
  },
  ranges: [rangeSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('ReferralSetting', referralSettingSchema);