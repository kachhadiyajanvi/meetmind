const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    transcript: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        default: ''
    },
    transcriptType: {
        type: String,
        enum: ['text','upload','audio'],
        default: 'text'
    },
    summary: {
        type: String,
        default: ''
    },
    decisions: [{
        type: String
    }]
}, { timestamps: true });

// Note: tasks will be linked via a separate Task model using sourceMeetingId

const Meeting = mongoose.model('Meeting', meetingSchema);
module.exports = Meeting;
