const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('image'), commentController.createComment);
router.get('/:confessionId', commentController.getComments);
router.post('/:id/react', auth, commentController.reactToComment);

module.exports = router;
