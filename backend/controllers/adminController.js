const User = require('../models/User');
const Confession = require('../models/Confession');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const mongoose = require('mongoose');

// Helper to emit moderation events
const emitModeration = (req, event, data) => {
  const io = req.app.get('socketio');
  if (io) io.emit(event, data);
};

exports.getStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalUsers, totalConfessions, totalReports, postsToday, usersToday, reportsToday] = await Promise.all([
      User.countDocuments(),
      Confession.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Confession.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ lastLogin: { $gte: startOfToday } }),
      Report.countDocuments({ createdAt: { $gte: startOfToday } })
    ]);
    
    // Get top trending confessions (highest votes)
    const trendingPosts = await Confession.find({ isHidden: { $ne: true } })
      .sort({ trueVotes: -1, fakeVotes: -1 })
      .limit(5)
      .select('text trueVotes fakeVotes category');

    res.json({ 
      totalUsers, 
      totalConfessions, 
      totalReports, 
      postsToday, 
      usersToday, 
      reportsToday,
      trendingPosts 
    });
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

exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', filter = 'newest' } = req.query;
    const query = {};

    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        query._id = search;
      } else {
        query.text = { $regex: search, $options: 'i' };
      }
    }

    let sortOption = { createdAt: -1 };
    if (filter === 'most_reacted') {
      sortOption = { trueVotes: -1, fakeVotes: -1 };
    } else if (filter === 'most_reported') {
      sortOption = { createdAt: -1 }; // Sort by newest initially; re-sorted by reportCount after computation
    }

    const posts = await Confession.find(query)
      .populate('userId', 'anonymousName email')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Confession.countDocuments(query);
    
    // Append report counts for each post realistically
    const postsWithReports = await Promise.all(posts.map(async (post) => {
        const reportCount = await Report.countDocuments({ reportedItemId: post._id });
        return { ...post, reportCount };
    }));

    if (filter === 'most_reported') {
      postsWithReports.sort((a, b) => b.reportCount - a.reportCount);
    }

    res.json({
      posts: postsWithReports,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPosts: count
    });
  } catch (err) {
    console.error('getAllPosts ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'anonymousName')
      .sort({ createdAt: -1 });

    // Group reports by reportedItemId
    const groupedReportsMap = new Map();

    reports.forEach(report => {
      const idStr = report.reportedItemId.toString();
      if (!groupedReportsMap.has(idStr)) {
        groupedReportsMap.set(idStr, {
          _id: report._id, // Keep one primary report ID for reference if needed
          reportedItemId: report.reportedItemId,
          itemType: report.itemType,
          reportCount: 0,
          reasons: [],
          status: report.status, // Can be improved to track if ALL are resolved
          createdAt: report.createdAt
        });
      }
      
      const group = groupedReportsMap.get(idStr);
      group.reportCount += 1;
      
      // Collect unique reasons
      if (!group.reasons.includes(report.reason)) {
        group.reasons.push(report.reason);
      }
      
      // If any report is pending, mark group as pending
      if (report.status === 'pending') {
          group.status = 'pending';
      }
    });

    const groupedReports = Array.from(groupedReportsMap.values());

    const populatedReports = await Promise.all(groupedReports.map(async (group) => {
      let content = 'Content not found';
      let userId = null;
      try {
        if (group.itemType === 'confession') {
          const item = await Confession.findById(group.reportedItemId);
          if (item) {
              content = item.text;
              userId = item.userId;
          } else {
              content = 'Confession deleted';
          }
        } else if (group.itemType === 'comment') {
          const item = await Comment.findById(group.reportedItemId).populate('userId', '_id');
          if (item) {
              content = item.text;
              userId = item.userId?._id;
          } else {
              content = 'Comment deleted';
          }
        }
      } catch (err) {
        content = 'Error retrieving content';
      }
      return { ...group, content, userId };
    }));
    
    // Sort by pending first, then by report count descending
    populatedReports.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return b.reportCount - a.reportCount;
    });

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

exports.warnUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.warningsCount += 1;
    user.trustScore = Math.max(0, user.trustScore - 20); // Decrease trust score by 20 per warning
    
    // Auto-ban if trust score hits 0
    if (user.trustScore === 0) {
      user.isBanned = true;
    }

    await user.save();
    emitModeration(req, 'user_warned', { id: user._id, warningsCount: user.warningsCount, trustScore: user.trustScore, isBanned: user.isBanned });
    
    res.json({ message: 'User warned successfully', user });
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
    // Treat req.params.id as reportedItemId since we aggregate by it now
    const reports = await Report.find({ reportedItemId: req.params.id });
    
    if (!reports || reports.length === 0) {
      // Fallback in case it's a direct report _id
      const singleReport = await Report.findById(req.params.id);
      if (!singleReport) return res.status(404).json({ message: 'Report not found' });
      singleReport.status = 'resolved';
      await singleReport.save();
    } else {
      await Promise.all(reports.map(async (report) => {
        report.status = 'resolved';
        await report.save();
      }));
    }

    res.json({ message: 'Anomaly resolved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const ContactMessage = require('../models/ContactMessage');

exports.getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await ContactMessage.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Message status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
