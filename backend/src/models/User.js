import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{10}$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'promotor', 'promotor1', 'promotor2', 'promotor3', 'promotor4'],
    default: 'promotor'
  },
  level: {
    type: String,
    default: 'Promotor'
  },
  language: {
    type: String,
    enum: ['english', 'tamil'],
    default: 'english'
  },
  earnings: {
    cash: { type: Number, default: 0 },
    grow: { type: Number, default: 0 },
    scratch: { type: Number, default: 0 }
  },
  trainingDay: {
    type: Number,
    default: 1,
    min: 1,
    max: 8
  },
  hasCompletedDailyVideo: {
    type: Boolean,
    default: false
  },
  lastDailyVideoDate: {
    type: Date
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralCode: {
    type: String,
    unique: true
  },
  totalReferrals: {
    type: Number,
    default: 0
  },
  activeReferrals: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  watchedVideos: [{
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    watchedAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['daily', 'training', 'promotion'] }
  }],
  completedQuizzes: [{
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    score: { type: Number },
    completedAt: { type: Date, default: Date.now },
    earnings: { type: Number, default: 0 }
  }]
}, {
  timestamps: true
});

// Generate referral code before saving
userSchema.pre('save', async function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = `${this.username}_${Math.random().toString(36).substr(2, 6)}`;
  }
  
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  
  next();
});

// Update level based on role
userSchema.pre('save', function(next) {
  const levelMap = {
    admin: 'Admin',
    promotor: 'Promotor',
    promotor1: 'Promotor Level 1',
    promotor2: 'Promotor Level 2',
    promotor3: 'Promotor Level 3',
    promotor4: 'Promotor Level 4'
  };
  
  this.level = levelMap[this.role] || 'Promotor';
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get referral link
userSchema.methods.getReferralLink = function() {
  return `${process.env.FRONTEND_URL}/register?ref=${this.referralCode}`;
};

export default mongoose.model('User', userSchema);