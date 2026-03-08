const Comment = require('../models/Comment');
const Confession = require('../models/Confession');
const Notification = require('../models/Notification');

exports.createComment = async (req, res) => {
  try {
    const { confessionId, text, parentId } = req.body;
    const image = req.file ? req.file.path : null;
    const comment = new Comment({
      confessionId,
      text,
      parentId,
      image,
      userId: req.user.id
    });
    await comment.save();

    // Send notification to confession owner
    const confession = await Confession.findById(confessionId);
    if (confession && confession.userId.toString() !== req.user.id) {
      const User = require('../models/User');
      const commenter = await User.findById(req.user.id);
      const notif = new Notification({
        userId: confession.userId,
        type: parentId ? 'reply' : 'comment',
        fromUserId: req.user.id,
        confessionId,
        commentId: comment._id,
        message: `${commenter?.anonymousName || 'Someone'} ${parentId ? 'replied to a comment on' : 'commented on'} your confession`
      });
      await notif.save();

      const io = req.app.get('socketio');
      if (io) io.to(`user_${confession.userId.toString()}`).emit('new_notification', { notification: notif });
    }

    // If this is a reply, also notify the parent comment author
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (parentComment && parentComment.userId.toString() !== req.user.id && 
          (!confession || parentComment.userId.toString() !== confession.userId.toString())) {
        const User = require('../models/User');
        const replier = await User.findById(req.user.id);
        const replyNotif = new Notification({
          userId: parentComment.userId,
          type: 'reply',
          fromUserId: req.user.id,
          confessionId,
          commentId: comment._id,
          message: `${replier?.anonymousName || 'Someone'} replied to your comment`
        });
        await replyNotif.save();

        const io = req.app.get('socketio');
        if (io) io.to(`user_${parentComment.userId.toString()}`).emit('new_notification', { notification: replyNotif });
      }
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ 
      confessionId: req.params.confessionId,
      isHidden: { $ne: true }
    })
      .populate('userId', 'anonymousName')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reactToComment = async (req, res) => {
  try {
    const { reactionType } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (!comment.reactions) {
      comment.reactions = { funny: 0, shocking: 0, sad: 0, crazy: 0 };
    }

    comment.reactions[reactionType] = (comment.reactions[reactionType] || 0) + 1;
    await comment.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('comment_reaction_update', { 
        commentId: comment._id, 
        confessionId: comment.confessionId,
        reactions: comment.reactions 
      });
    }

    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
