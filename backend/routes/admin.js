const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.use(auth, admin);

router.get('/stats', adminController.getStats);
router.get('/reports', adminController.getReports);
router.get('/users', adminController.getUsers);
router.get('/posts', adminController.getAllPosts);
router.delete('/confession/:id', adminController.deleteConfession);
router.patch('/confession/:id', adminController.editConfession);
router.patch('/confession/:id/hide', adminController.hideConfession);
router.patch('/comment/:id', adminController.editComment);
router.delete('/comment/:id', adminController.deleteComment);
router.patch('/user/:id/ban', adminController.banUser);
router.patch('/user/:id/warn', adminController.warnUser);
router.delete('/user/:id', adminController.deleteUser);
router.patch('/report/:id/resolve', adminController.resolveReport);

// Contact Messages
router.get('/messages', adminController.getMessages);
router.patch('/messages/:id/status', adminController.updateMessageStatus);
router.delete('/messages/:id', adminController.deleteMessage);

module.exports = router;
