const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reports');
const { protect, authorize } = require('../middleware/auth');

// Business Rule: Only the director Mr. Orban is allowed to view sales totals
router.get('/totals', protect, authorize('Director'), reportController.getDirectorReport);

module.exports = router;
