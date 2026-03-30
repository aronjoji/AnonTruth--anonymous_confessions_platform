const ContactMessage = require('../models/ContactMessage');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, reportType, message } = req.body;
    
    const newMessage = new ContactMessage({
      name,
      email,
      reportType,
      message
    });

    await newMessage.save();
    
    // Optional: Could trigger an email to admins here
    // emitModeration(req, 'new_contact_message', newMessage); // If setting up real-time admin alerts
    
    res.status(201).json({ message: 'Message received successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
