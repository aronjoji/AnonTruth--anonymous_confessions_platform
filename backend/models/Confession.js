const mongoose = require('mongoose');

const confessionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URL from Cloudinary
  },
  category: {
    type: String,
    enum: ['relationship', 'school', 'work', 'crime', 'funny', 'random'],
    default: 'random',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere',
    },
    country: String,
    state: String,
    city: String,
  },
  trueVotes: {
    type: Number,
    default: 0,
  },
  fakeVotes: {
    type: Number,
    default: 0,
  },
  shockingVotes: {
    type: Number,
    default: 0,
  },
  reactions: {
    funny: { type: Number, default: 0 },
    shocking: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    crazy: { type: Number, default: 0 },
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
  shareCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Confession', confessionSchema);
