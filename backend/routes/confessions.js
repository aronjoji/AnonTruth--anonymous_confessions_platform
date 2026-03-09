const express = require('express');
const router = express.Router();
const confessionController = require('../controllers/confessionController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('image'), confessionController.createConfession);
router.get('/', confessionController.getConfessions);
router.get('/my', auth, confessionController.getMyConfessions);
router.get('/:id', confessionController.getConfessionById);
router.post('/:id/vote', auth, confessionController.voteConfession);
router.post('/:id/react', auth, confessionController.reactToConfession);
router.post('/:id/share', confessionController.shareConfession);
router.delete('/:id', auth, confessionController.deleteMyConfession);

// Search confessions by keyword or tag
router.get('/search/query', async (req, res) => {
  try {
    const { q, category } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { isHidden: { $ne: true } };
    if (q) {
      query.text = { $regex: q, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }

    const Confession = require('../models/Confession');
    const confessions = await Confession.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'confessionId',
          as: 'comments'
        }
      },
      { $addFields: { commentCount: { $size: '$comments' } } },
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
      { $project: { 'userId.password': 0, 'userId.email': 0 } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    res.json(confessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
