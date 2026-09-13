const Meeting = require('../models/Meeting');
const Task = require('../models/Task');

// @desc    Get all meetings for a user
// @route   GET /api/meetings
// @access  Private
const getMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(meetings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get meeting by ID (including tasks)
// @route   GET /api/meetings/:id
// @access  Private
const getMeetingById = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user.id });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        const tasks = await Task.find({ sourceMeetingId: meeting._id });
        res.json({ meeting, tasks });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new meeting (before analysis)
// @route   POST /api/meetings
// @access  Private
const createMeeting = async (req, res) => {
    try {
        const { title, transcript, fileUrl, transcriptType } = req.body;
        if (!title || (!transcript && !fileUrl)) {
            return res.status(400).json({ message: 'Title and transcript or uploaded file is required' });
        }
        const meeting = await Meeting.create({
            userId: req.user.id,
            title,
            transcript,
            fileUrl: fileUrl || '',
            transcriptType: transcriptType || 'text'
        });
        res.status(201).json(meeting);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update meeting details
// @route   PUT /api/meetings/:id
// @access  Private
const updateMeeting = async (req, res) => {
    try {
        const { summary, decisions } = req.body;
        const meeting = await Meeting.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { summary, decisions },
            { new: true }
        );
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
        res.json(meeting);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete meeting and its tasks
// @route   DELETE /api/meetings/:id
// @access  Private
const deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user.id });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        await Task.deleteMany({ sourceMeetingId: meeting._id });
        await meeting.deleteOne();

        res.json({ message: 'Meeting removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- Task Endpoints ---

// @desc    Add a task to a meeting
// @route   POST /api/meetings/:id/tasks
// @access  Private
const addTask = async (req, res) => {
    try {
        const { description, assignee, deadline, priority, status } = req.body;
        const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user.id });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const task = await Task.create({
            description, assignee, deadline, priority, status, sourceMeetingId: meeting._id
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/meetings/:id/tasks/:taskId
// @access  Private
const updateTask = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user.id });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const task = await Task.findOneAndUpdate(
            { _id: req.params.taskId, sourceMeetingId: meeting._id },
            req.body,
            { new: true }
        );
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/meetings/:id/tasks/:taskId
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user.id });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const task = await Task.findOneAndDelete({ _id: req.params.taskId, sourceMeetingId: meeting._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get task counts (high priority, pending, completed) for current user
// @route   GET /api/meetings/tasks/summary
// @access  Private
const getTaskCounts = async (req, res) => {
    try {
        const meetings = await Meeting.find({ userId: req.user.id }, { _id: 1 });
        const meetingIds = meetings.map(m => m._id);

        if (meetingIds.length === 0) {
            return res.json({ high: 0, pending: 0, completed: 0 });
        }

        const high = await Task.countDocuments({ sourceMeetingId: { $in: meetingIds }, priority: 'High' });
        const pending = await Task.countDocuments({ sourceMeetingId: { $in: meetingIds }, status: 'Pending' });
        const completed = await Task.countDocuments({ sourceMeetingId: { $in: meetingIds }, status: 'Completed' });

        res.json({ high, pending, completed });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getMeetings,
    getMeetingById,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    addTask,
    updateTask,
    deleteTask
    , getTaskCounts
};
