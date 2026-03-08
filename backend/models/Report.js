const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  itemType: {
    type: String,
    enum: ['confession', 'comment'],
    required: true,
  },
  reason: {
    type: String,
    enum: ['Spam', 'Harassment', 'Hate speech', 'False information', 'Inappropriate content'],
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Report', reportSchema);
