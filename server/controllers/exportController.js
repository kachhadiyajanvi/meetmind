const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const { generatePDF } = require('../services/pdfService');
const { generateDOCX } = require('../services/docxService');

// @desc    Export meeting as PDF
// @route   GET /api/meetings/:id/export/pdf
// @access  Private
const exportPDF = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user.id });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        const tasks = await Task.find({ sourceMeetingId: meeting._id });

        const pdfUrl = await generatePDF(meeting, tasks);
        res.json({ url: pdfUrl });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Export meeting as DOCX
// @route   GET /api/meetings/:id/export/docx
// @access  Private
const exportDOCX = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user.id });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        const tasks = await Task.find({ sourceMeetingId: meeting._id });

        const docxUrl = await generateDOCX(meeting, tasks);
        res.json({ url: docxUrl });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { exportPDF, exportDOCX };
