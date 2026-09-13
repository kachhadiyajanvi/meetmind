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

        if (!meeting.transcript) {
            return res.status(400).json({ message: 'Meeting transcript is empty' });
        }

        const aiData = await analyzeTranscript(meeting.transcript);

        meeting.summary = aiData.summary || '';
        meeting.decisions = aiData.decisions || [];
        await meeting.save();

        // delete existing tasks for this meeting to prevent duplicates if re-analyzing
        await Task.deleteMany({ sourceMeetingId: meeting._id });

        const newTasks = [];
        if (aiData.tasks && aiData.tasks.length > 0) {
            for (const t of aiData.tasks) {
                const task = await Task.create({
                    description: t.description,
                    assignee: t.assignee,
                    deadline: t.deadline,
                    priority: t.priority,
                    sourceMeetingId: meeting._id
                });
                newTasks.push(task);
            }
        }

        res.json({
            summary: meeting.summary,
            decisions: meeting.decisions,
            tasks: newTasks
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { analyzeMeeting };
