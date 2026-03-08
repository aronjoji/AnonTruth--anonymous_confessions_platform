const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const { reportedItemId, itemType, reason } = req.body;
    
    // Check if already reported by this user to prevent spam
    const existing = await Report.findOne({ 
      reportedItemId, 
      reportedBy: req.user.id,
      status: 'pending'
    });
    
    if (existing) {
      return res.status(400).json({ message: 'You have already reported this item.' });
    }

    const report = new Report({
      reportedItemId,
      itemType,
      reason,
      reportedBy: req.user.id
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully. The Oracle will review it.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
