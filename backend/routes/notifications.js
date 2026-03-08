const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.get('/', auth, notificationController.getNotifications);
router.put('/read', auth, notificationController.markAsRead);
router.put('/:id/read', auth, notificationController.markOneAsRead);

module.exports = router;
