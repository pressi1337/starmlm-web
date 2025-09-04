import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'training', 'promotion'],
    required: true
  },
  videoUrl: {
    type: String
  },
  youtubeLink: {
    type: String
  },
  showingDate: {
    type: Date,
    required: true
  },
  day: {
    type: Number,
    min: 1,
    max: 7
  },
  session: {
    type: String,
    enum: ['12am-12pm', '12pm-12am']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
videoSchema.index({ type: 1, showingDate: 1 });
videoSchema.index({ type: 1, day: 1 });
videoSchema.index({ type: 1, session: 1, showingDate: 1 });

export default mongoose.model('Video', videoSchema);