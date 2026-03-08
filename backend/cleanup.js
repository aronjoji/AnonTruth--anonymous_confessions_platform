require('dotenv').config();
const mongoose = require('mongoose');
const Confession = require('./models/Confession');
const Comment = require('./models/Comment');
const Vote = require('./models/Vote');

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const all = await Confession.find().sort({ createdAt: 1 });
  console.log('Total confessions:', all.length);

  const seen = new Map();
  const dupeIds = [];

  for (const c of all) {
    const key = c.text.substring(0, 80);
    if (seen.has(key)) {
      dupeIds.push(c._id);
    } else {
      seen.set(key, c._id);
    }
  }

  console.log('Unique:', seen.size, '| Duplicates to remove:', dupeIds.length);

  if (dupeIds.length > 0) {
    const delC = await Confession.deleteMany({ _id: { $in: dupeIds } });
    const delCom = await Comment.deleteMany({ confessionId: { $in: dupeIds } });
    const delV = await Vote.deleteMany({ confessionId: { $in: dupeIds } });
    console.log('Deleted:', delC.deletedCount, 'confessions,', delCom.deletedCount, 'comments,', delV.deletedCount, 'votes');
  }

  console.log('Cleanup done!');
  process.exit(0);
}

cleanup();
