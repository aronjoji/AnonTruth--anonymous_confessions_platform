const AnonChat = require('../models/AnonChat');

// Start or join an anonymous chat linked to a confession
exports.startChat = async (req, res) => {
  try {
    const { confessionId } = req.body;
    const userId = req.user.id;

    // Check if user already has an active chat for this confession
    const existingChat = await AnonChat.findOne({
      confessionId,
      'participants.userId': userId,
      isActive: true,
    });
    if (existingChat) {
      return res.json(existingChat);
    }

    // Look for an open chat (only 1 participant) for this confession
    let chat = await AnonChat.findOne({
      confessionId,
      isActive: true,
      'participants': { $size: 1 },
      'participants.userId': { $ne: userId },
    });

    if (chat) {
      // Join as Anon B
      chat.participants.push({ userId, label: 'Anon B' });
      await chat.save();

      const io = req.app.get('socketio');
      if (io) io.to(`chat_${chat._id}`).emit('chat_partner_joined', { chatId: chat._id });

      return res.json(chat);
    }

    // Create new chat — user is Anon A
    chat = new AnonChat({
      confessionId,
      participants: [{ userId, label: 'Anon A' }],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's active chats
exports.getMyChats = async (req, res) => {
  try {
    const chats = await AnonChat.find({
      'participants.userId': req.user.id,
      isActive: true,
    }).sort({ createdAt: -1 });

    // Map chats to hide real participant data
    const sanitized = chats.map(chat => {
      const myParticipant = chat.participants.find(p => p.userId.toString() === req.user.id);
      return {
        _id: chat._id,
        confessionId: chat.confessionId,
        myLabel: myParticipant?.label,
        partnerJoined: chat.participants.length === 2,
        messageCount: chat.messages.length,
        lastMessage: chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null,
        expiresAt: chat.expiresAt,
        createdAt: chat.createdAt,
      };
    });
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a specific chat with messages
exports.getChat = async (req, res) => {
  try {
    const chat = await AnonChat.findOne({
      _id: req.params.id,
      'participants.userId': req.user.id,
    });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const myParticipant = chat.participants.find(p => p.userId.toString() === req.user.id);
    res.json({
      _id: chat._id,
      confessionId: chat.confessionId,
      myLabel: myParticipant?.label,
      partnerJoined: chat.participants.length === 2,
      messages: chat.messages,
      expiresAt: chat.expiresAt,
      isActive: chat.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send a message in a chat
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const chat = await AnonChat.findOne({
      _id: req.params.id,
      'participants.userId': req.user.id,
      isActive: true,
    });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.participants.length < 2) return res.status(400).json({ message: 'Waiting for partner to join' });

    const sender = chat.participants.find(p => p.userId.toString() === req.user.id);
    const message = { senderLabel: sender.label, text, createdAt: new Date() };
    chat.messages.push(message);
    await chat.save();

    // Emit via socket
    const io = req.app.get('socketio');
    if (io) io.to(`chat_${chat._id}`).emit('chat_message', { chatId: chat._id, message });

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// End a chat
exports.endChat = async (req, res) => {
  try {
    const chat = await AnonChat.findOneAndUpdate(
      { _id: req.params.id, 'participants.userId': req.user.id },
      { isActive: false },
      { new: true }
    );
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const io = req.app.get('socketio');
    if (io) io.to(`chat_${chat._id}`).emit('chat_ended', { chatId: chat._id });

    res.json({ message: 'Chat ended' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
