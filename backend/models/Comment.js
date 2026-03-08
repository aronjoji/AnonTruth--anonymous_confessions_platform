const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  confessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Confession',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  reactions: {
    funny: { type: Number, default: 0 },
    shocking: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    crazy: { type: Number, default: 0 },
  },
  image: {
    type: String, // URL from Cloudinary
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Comment', commentSchema);
