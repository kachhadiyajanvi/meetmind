const express = require('express');
const router = express.Router({ mergeParams: true });
const { exportPDF, exportDOCX } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:id/export/pdf', protect, exportPDF);
router.get('/:id/export/docx', protect, exportDOCX);

module.exports = router;
