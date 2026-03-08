const User = require('../models/User');
const Confession = require('../models/Confession');
const Comment = require('../models/Comment');
const Report = require('../models/Report');

// Helper to emit moderation events
const emitModeration = (req, event, data) => {
  const io = req.app.get('socketio');
  if (io) io.emit(event, data);
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalConfessions = await Confession.countDocuments();
    const totalReports = await Report.countDocuments({ status: 'pending' });
    
    // Get top trending confessions (highest votes)
    const trendingPosts = await Confession.find({ isHidden: { $ne: true } })
      .sort({ trueVotes: -1, fakeVotes: -1 })
      .limit(5)
      .select('text trueVotes fakeVotes category');

    res.json({ totalUsers, totalConfessions, totalReports, trendingPosts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'anonymousName')
      .sort({ createdAt: -1 });

    const populatedReports = await Promise.all(reports.map(async (report) => {
      let content = 'Content not found';
      try {
        if (report.itemType === 'confession') {
          const item = await Confession.findById(report.reportedItemId);
          content = item ? item.text : 'Confession deleted';
        } else if (report.itemType === 'comment') {
          const item = await Comment.findById(report.reportedItemId);
          content = item ? item.text : 'Comment deleted';
        }
      } catch (err) {
        content = 'Error retrieving content';
      }
      return { ...report._doc, content };
    }));

    res.json(populatedReports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteConfession = async (req, res) => {
  try {
    await Confession.findByIdAndDelete(req.params.id);
    emitModeration(req, 'content_deleted', { id: req.params.id, type: 'confession' });
    res.json({ message: 'Confession deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.hideConfession = async (req, res) => {
  try {
    const { isHidden } = req.body;
    await Confession.findByIdAndUpdate(req.params.id, { isHidden });
    emitModeration(req, 'content_hidden', { id: req.params.id, type: 'confession', isHidden });
    res.json({ message: `Confession ${isHidden ? 'hidden' : 'unhidden'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    emitModeration(req, 'content_deleted', { id: req.params.id, type: 'comment' });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { isBanned } = req.body;
    await User.findByIdAndUpdate(req.params.id, { isBanned });
    res.json({ message: `User ${isBanned ? 'banned' : 'unbanned'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.editConfession = async (req, res) => {
  try {
    const { text, category } = req.body;
    await Confession.findByIdAndUpdate(req.params.id, { text, category });
    emitModeration(req, 'content_updated', { id: req.params.id, type: 'confession', text });
    res.json({ message: 'Confession updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.editComment = async (req, res) => {
  try {
    const { text } = req.body;
    await Comment.findByIdAndUpdate(req.params.id, { text });
    emitModeration(req, 'content_updated', { id: req.params.id, type: 'comment', text });
    res.json({ message: 'Comment updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' });
    res.json({ message: 'Report resolved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
