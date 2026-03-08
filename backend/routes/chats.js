const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/start', auth, chatController.startChat);
router.get('/my', auth, chatController.getMyChats);
router.get('/:id', auth, chatController.getChat);
router.post('/:id/message', auth, chatController.sendMessage);
router.put('/:id/end', auth, chatController.endChat);

module.exports = router;
