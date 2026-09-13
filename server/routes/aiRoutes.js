const express = require('express');
const router = express.Router({ mergeParams: true });
const { analyzeMeeting } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Mount under /api/meetings/:id/analyze via mergeParams if mounted nested,
// however, we'll just define the full route if I mount it at /api/meetings
// Let's actually define it explicitly.

router.post('/:id/analyze', protect, analyzeMeeting);

module.exports = router;
