const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const { analyzeTranscript } = require('../services/aiService');

// @desc    Analyze meeting transcript with AI
// @route   POST /api/meetings/:id/analyze
// @access  Private
const analyzeMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user.id });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const fs = require('fs');
        const path = require('path');

        // If transcript is empty but a file was uploaded, attempt to extract text from the uploaded file
        if (!meeting.transcript || meeting.transcript.trim().length === 0) {
            if (meeting.fileUrl) {
                try {
                    const rel = meeting.fileUrl.replace(/^\//, '');
                    const filePath = path.join(__dirname, '..', rel);
                    if (fs.existsSync(filePath)) {
                        const ext = path.extname(filePath).toLowerCase();
                        if (ext === '.txt') {
                            meeting.transcript = fs.readFileSync(filePath, 'utf8');
                        } else if (ext === '.pdf') {
                            try {
                                const pdfParse = require('pdf-parse');
                                const dataBuffer = fs.readFileSync(filePath);
                                const pdfData = await pdfParse(dataBuffer);
                                meeting.transcript = (pdfData && pdfData.text) ? pdfData.text : '';
                            } catch (e) {
                                console.warn('pdf-parse not available or failed:', e.message || e);
                            }
                        } else if (ext === '.docx') {
                            try {
                                const mammoth = require('mammoth');
                                const result = await mammoth.extractRawText({ path: filePath });
                                meeting.transcript = result && result.value ? result.value : '';
                            } catch (e) {
                                console.warn('mammoth not available or failed:', e.message || e);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Failed to extract text from uploaded file for analysis', e && e.message ? e.message : e);
                }
            }

            if (!meeting.transcript || meeting.transcript.trim().length === 0) {
                return res.status(400).json({ message: 'Meeting transcript is empty and no extractable text found in uploaded file' });
            }
        }

        // Run AI analysis but protect against failures — always attempt to save at least a basic summary
        let aiData = null;
        try {
            aiData = await analyzeTranscript(meeting.transcript);
            console.log('AI analysis succeeded for meeting', meeting._id);
        } catch (err) {
            console.error('AI analysis failed:', err && err.message ? err.message : err);
        }

        // Ensure we have a usable fallback
        const summary = (aiData && aiData.summary) ? aiData.summary : (meeting.transcript.slice(0, 800) + (meeting.transcript.length > 800 ? '...' : ''));
        const decisions = (aiData && Array.isArray(aiData.decisions)) ? aiData.decisions : [];

        meeting.summary = summary;
        meeting.decisions = decisions;
        await meeting.save();

        // delete existing tasks for this meeting to prevent duplicates if re-analyzing
        await Task.deleteMany({ sourceMeetingId: meeting._id });

        const newTasks = [];
        const tasksFromAI = aiData && Array.isArray(aiData.tasks) ? aiData.tasks : [];
        for (const t of tasksFromAI) {
            try {
                const task = await Task.create({
                    description: t.description || 'No description',
                    assignee: t.assignee || 'Unassigned',
                    deadline: t.deadline || 'No deadline specified',
                    priority: ['High', 'Medium', 'Low'].includes(t.priority) ? t.priority : 'Medium',
                    sourceMeetingId: meeting._id
                });
                newTasks.push(task);
            } catch (err) {
                console.error('Failed to create task from AI data:', err && err.message ? err.message : err);
            }
        }

        console.log(`Analysis complete — meeting ${meeting._id} saved. Tasks created: ${newTasks.length}`);

        return res.json({ summary: meeting.summary, decisions: meeting.decisions, tasks: newTasks });

    } catch (error) {
        console.error('AnalyzeMeeting error:', error && error.message ? error.message : error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { analyzeMeeting };
