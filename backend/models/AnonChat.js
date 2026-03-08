const mongoose = require('mongoose');

const anonChatSchema = new mongoose.Schema({
  confessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Confession',
    required: true,
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    label: { type: String, enum: ['Anon A', 'Anon B'] },
  }],
  messages: [{
    senderLabel: { type: String, enum: ['Anon A', 'Anon B'] },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index — MongoDB auto-deletes when expiresAt is reached
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AnonChat', anonChatSchema);
