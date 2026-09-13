const express = require('express');
const router = express.Router();
const {
    getMeetings,
    getMeetingById,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    addTask,
    updateTask,
    deleteTask
} = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getMeetings)
    .post(protect, createMeeting);

router.route('/:id')
    .get(protect, getMeetingById)
    .put(protect, updateMeeting)
    .delete(protect, deleteMeeting);

router.route('/:id/tasks')
    .post(protect, addTask);

router.route('/tasks/summary')
    .get(protect, require('../controllers/meetingController').getTaskCounts);

router.route('/:id/tasks/:taskId')
    .put(protect, updateTask)
    .delete(protect, deleteTask);

// We will add analyze, export, and email endpoints later.

module.exports = router;
