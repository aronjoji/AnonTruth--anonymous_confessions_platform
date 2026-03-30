const Confession = require('../models/Confession');
const Vote = require('../models/Vote');
const Notification = require('../models/Notification');

exports.createConfession = async (req, res) => {
  try {
    let { text, category, location } = req.body;
    
    // Validate required fields
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ message: 'Text is required' });
    }
    if (text.length > 5000) {
      return res.status(400).json({ message: 'Text exceeds maximum length of 5000 characters' });
    }
    
    // Sanitize: strip HTML tags
    text = text.replace(/<[^>]*>/g, '').trim();
    
    // Validate category
    const validCategories = ['relationship', 'school', 'work', 'crime', 'funny', 'random'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const image = req.file ? req.file.path : null;
    const confession = new Confession({
      text,
      image,
      category: category || 'random',
      location: typeof location === 'string' ? JSON.parse(location) : location,
      userId: req.user.id
    });
    await confession.save();
    res.status(201).json(confession);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getConfessions = async (req, res) => {
  try {
    const { sort, category, lat, lng, radius } = req.query;
    let query = {};
    if (category) query.category = category;

    // Geospatial query
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: (radius || 50) * 1000
        }
      };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build sort/scoring stage based on sort type
    let sortStage;
    let extraStages = [];

    if (sort === 'trending') {
      // Trending: weighted engagement score (votes + reactions + comments) with time decay
      extraStages.push({
        $addFields: {
          totalReactions: {
            $add: [
              { $ifNull: ['$reactions.funny', 0] },
              { $ifNull: ['$reactions.shocking', 0] },
              { $ifNull: ['$reactions.sad', 0] },
              { $ifNull: ['$reactions.crazy', 0] }
            ]
          },
          totalVotes: { $add: ['$trueVotes', '$fakeVotes'] },
          ageHours: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              3600000
            ]
          }
        }
      });
      extraStages.push({
        $addFields: {
          engagementScore: {
            $divide: [
              { $add: [
                { $multiply: ['$totalVotes', 2] },
                { $multiply: ['$totalReactions', 3] },
                { $multiply: ['$commentCount', 5] }
              ]},
              { $add: [1, { $pow: [{ $add: [1, { $divide: ['$ageHours', 24] }] }, 1.5] }] }
            ]
          }
        }
      });
      sortStage = { $sort: { engagementScore: -1 } };
    } else if (sort === 'explore') {
      // Explore: discovery mode — mix of recent + moderate engagement, exclude very popular
      extraStages.push({
        $addFields: {
          totalVotes: { $add: ['$trueVotes', '$fakeVotes'] }
        }
      });
      extraStages.push({
        $match: {
          totalVotes: { $lt: 50 } // Surface less-seen posts
        }
      });
      sortStage = { $sort: { commentCount: -1, createdAt: -1 } };
    } else if (sort === 'top') {
      // Top: highest total engagement of all time (no time decay)
      extraStages.push({
        $addFields: {
          totalReactions: {
            $add: [
              { $ifNull: ['$reactions.funny', 0] },
              { $ifNull: ['$reactions.shocking', 0] },
              { $ifNull: ['$reactions.sad', 0] },
              { $ifNull: ['$reactions.crazy', 0] }
            ]
          },
          totalVotes: { $add: ['$trueVotes', '$fakeVotes'] },
          totalEngagement: {
            $add: [
              '$trueVotes', '$fakeVotes',
              { $ifNull: ['$reactions.funny', 0] },
              { $ifNull: ['$reactions.shocking', 0] },
              { $ifNull: ['$reactions.sad', 0] },
              { $ifNull: ['$reactions.crazy', 0] },
              { $multiply: ['$commentCount', 2] }
            ]
          }
        }
      });
      sortStage = { $sort: { totalEngagement: -1 } };
    } else if (sort === 'controversial') {
      // Controversial: closest true/fake ratio with minimum activity
      extraStages.push({
        $addFields: {
          totalVotes: { $add: ['$trueVotes', '$fakeVotes'] },
          controversy: {
            $cond: {
              if: { $gt: [{ $add: ['$trueVotes', '$fakeVotes'] }, 2] },
              then: {
                $multiply: [
                  { $add: ['$trueVotes', '$fakeVotes'] },
                  { $subtract: [1, { $abs: { $subtract: [
                    { $divide: ['$trueVotes', { $add: ['$trueVotes', '$fakeVotes', 0.001] }] },
                    0.5
                  ] } }] }
                ]
              },
              else: 0
            }
          }
        }
      });
      sortStage = { $sort: { controversy: -1 } };
    } else {
      // Default: newest first
      sortStage = { $sort: { createdAt: -1 } };
    }

    const pipeline = [
      { $match: { ...query, isHidden: { $ne: true } } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'confessionId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      { $unset: 'comments' },
      ...extraStages,
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      { $unwind: '$userId' },
      {
        $project: {
          'userId.password': 0,
          'userId.email': 0,
          ageHours: 0,
          totalReactions: 0,
          engagementScore: 0,
          totalEngagement: 0,
          controversy: 0
        }
      },
      sortStage,
      { $skip: skip },
      { $limit: limit }
    ];

    const confessions = await Confession.aggregate(pipeline);
    res.json(confessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyConfessions = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const confessions = await Confession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'confessionId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      { $unset: 'comments' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      { $unwind: '$userId' },
      {
        $project: {
          'userId.password': 0,
          'userId.email': 0
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.json(confessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getConfessionById = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const confession = await Confession.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'confessionId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      { $unset: 'comments' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      { $unwind: '$userId' },
      {
        $project: {
          'userId.password': 0,
          'userId.email': 0
        }
      }
    ]);

    if (!confession || confession.length === 0) return res.status(404).json({ message: 'Confession not found' });
    res.json(confession[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.voteConfession = async (req, res) => {
  try {
    const { voteType } = req.body;
    if (!['true', 'fake'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }
    const confessionId = req.params.id;
    const userId = req.user.id;

    let vote = await Vote.findOne({ userId, confessionId });
    const confession = await Confession.findById(confessionId);
    if (!confession) return res.status(404).json({ message: 'Confession not found' });

    if (vote) {
      if (vote.voteType === voteType) return res.status(400).json({ message: 'Already voted' });
      if (voteType === 'true') {
        confession.trueVotes += 1;
        confession.fakeVotes -= 1;
      } else {
        confession.trueVotes -= 1;
        confession.fakeVotes += 1;
      }
      vote.voteType = voteType;
      await vote.save();
    } else {
      vote = new Vote({ userId, confessionId, voteType });
      if (voteType === 'true') confession.trueVotes += 1;
      else confession.fakeVotes += 1;
      await vote.save();
    }

    await confession.save();

    // Emit socket update
    const io = req.app.get('socketio');
    io.emit('vote_update', { confessionId, trueVotes: confession.trueVotes, fakeVotes: confession.fakeVotes });

    // Send notification to confession owner (if not self)
    if (confession.userId.toString() !== userId) {
      const User = require('../models/User');
      const voter = await User.findById(userId);
      const notif = new Notification({
        userId: confession.userId,
        type: 'vote',
        fromUserId: userId,
        confessionId,
        message: `${voter?.anonymousName || 'Someone'} voted "${voteType}" on your confession`
      });
      await notif.save();
      io.to(`user_${confession.userId.toString()}`).emit('new_notification', { notification: notif });
    }

    res.json(confession);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMyConfession = async (req, res) => {
  try {
    const confession = await Confession.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!confession) return res.status(404).json({ message: 'Confession not found or unauthorized' });
    
    res.json({ message: 'Confession deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reactToConfession = async (req, res) => {
  try {
    const { reactionType } = req.body;
    const validReactions = ['funny', 'shocking', 'sad', 'crazy'];
    if (!validReactions.includes(reactionType)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }
    const confessionId = req.params.id;

    const confession = await Confession.findById(confessionId);
    if (!confession) return res.status(404).json({ message: 'Confession not found' });

    if (!confession.reactions) {
      confession.reactions = { funny: 0, shocking: 0, sad: 0, crazy: 0 };
    }

    confession.reactions[reactionType] = (confession.reactions[reactionType] || 0) + 1;
    await confession.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('reaction_update', { 
        confessionId, 
        reactions: confession.reactions 
      });
    }

    // Send notification to confession owner (if not self)
    const userId = req.user.id;
    if (confession.userId.toString() !== userId) {
      const User = require('../models/User');
      const reactor = await User.findById(userId);
      const emojiMap = { funny: '😂', shocking: '😱', sad: '😢', crazy: '🤯' };
      const notif = new Notification({
        userId: confession.userId,
        type: 'reaction',
        fromUserId: userId,
        confessionId,
        message: `${reactor?.anonymousName || 'Someone'} reacted ${emojiMap[reactionType] || ''} to your confession`
      });
      await notif.save();
      if (io) io.to(`user_${confession.userId.toString()}`).emit('new_notification', { notification: notif });
    }

    res.json(confession);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.shareConfession = async (req, res) => {
  try {
    const confession = await Confession.findByIdAndUpdate(
      req.params.id,
      { $inc: { shareCount: 1 } },
      { new: true }
    );
    if (!confession) return res.status(404).json({ message: 'Confession not found' });
    res.json({ shareCount: confession.shareCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
