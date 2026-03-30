const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Confession = require('../models/Confession');
const Comment = require('../models/Comment');
const { generateAnonymousName } = require('../config/anonymousNames');
const mongoose = require('mongoose');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user;

    if (email) {
      user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: 'User already exists' });

      let anonymousName = generateAnonymousName();
      // Ensure uniqueness
      let existing = await User.findOne({ anonymousName });
      while (existing) {
        anonymousName = generateAnonymousName();
        existing = await User.findOne({ anonymousName });
      }

      let role = 'user';
      if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) {
        role = 'admin';
      }

      user = new User({ email, password, anonymousName, role });
      await user.save();
    } else {
      // Create anonymous temporary user if needed, or just return an error if email is required
      return res.status(400).json({ message: 'Email and password are required for accounts' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, user: { anonymousName: user.anonymousName, role: user.role } });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBanned) return res.status(403).json({ message: 'User is banned' });

    user.lastLogin = Date.now();

    // Auto-promote if matches ADMIN_EMAIL
    if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL && user.role !== 'admin') {
      user.role = 'admin';
    }
    
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.status(200).json({ token, user: { anonymousName: user.anonymousName, role: user.role } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const [confessionStats, commentCount] = await Promise.all([
      Confession.aggregate([
        { $match: { userId } },
        { 
          $group: { 
            _id: null, 
            totalConfessions: { $sum: 1 },
            totalTrueVotes: { $sum: '$trueVotes' },
            totalFakeVotes: { $sum: '$fakeVotes' }
          } 
        }
      ]),
      Comment.countDocuments({ userId })
    ]);

    const stats = confessionStats[0] || { totalConfessions: 0, totalTrueVotes: 0, totalFakeVotes: 0 };
    
    res.json({
      totalConfessions: stats.totalConfessions,
      totalVotesReceived: stats.totalTrueVotes + stats.totalFakeVotes,
      totalCommentsGiven: commentCount,
      neuralImpact: (stats.totalTrueVotes * 2) + commentCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
