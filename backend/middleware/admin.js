const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

module.exports = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};
