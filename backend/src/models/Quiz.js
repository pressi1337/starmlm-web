import mongoose from 'mongoose';

const choiceSchema = new mongoose.Schema({
  textEn: {
    type: String,
    required: true
  },
  textTa: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const questionSchema = new mongoose.Schema({
  questionEn: {
    type: String,
    required: true
  },
  questionTa: {
    type: String,
    required: true
  },
  choices: [choiceSchema],
  timeLimit: {
    type: Number,
    default: 30,
    min: 10,
    max: 300
  }
});

const quizSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  questions: [questionSchema],
  earnings: {
    promotor: { type: Number, default: 10 },
    promotor1: { type: Number, default: 15 },
    promotor2: { type: Number, default: 20 },
    promotor3: { type: Number, default: 25 },
    promotor4: { type: Number, default: 30 }
  },
  passThreshold: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one quiz per video
quizSchema.index({ videoId: 1 }, { unique: true });

export default mongoose.model('Quiz', quizSchema);