const express = require('express');
const router = express.Router({ mergeParams: true });
const { emailMeetingReport } = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:id/email', protect, emailMeetingReport);

module.exports = router;
