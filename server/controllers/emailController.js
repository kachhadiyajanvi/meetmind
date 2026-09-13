const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
const { sendEmail } = require('../services/emailService');

// @desc    Email meeting report
// @route   POST /api/meetings/:id/email
// @access  Private
const emailMeetingReport = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email recipient is required' });
        }

        const meeting = await Meeting.findOne({ _id: req.params.id, userId: req.user.id });
        if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

        const tasks = await Task.find({ sourceMeetingId: meeting._id });

        let htmlContent = `
      <h1>Meeting Report: ${meeting.title}</h1>
      <p><strong>Date:</strong> ${new Date(meeting.createdAt).toLocaleString()}</p>
      
      <h2>Summary</h2>
      <p>${meeting.summary || 'No summary available.'}</p>
      
      <h2>Key Decisions</h2>
      <ul>
        ${meeting.decisions && meeting.decisions.length > 0
                ? meeting.decisions.map(d => `<li>${d}</li>`).join('')
                : '<li>No decisions recorded.</li>'}
      </ul>
      
      <h2>Action Items</h2>
    `;

        if (tasks && tasks.length > 0) {
            tasks.forEach(t => {
                htmlContent += `
          <div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <p><strong>Task:</strong> ${t.description}</p>
            <p><strong>Assignee:</strong> ${t.assignee} | <strong>Deadline:</strong> ${t.deadline}</p>
            <p><strong>Priority:</strong> ${t.priority} | <strong>Status:</strong> ${t.status}</p>
          </div>
        `;
            });
        } else {
            htmlContent += `<p>No tasks recorded.</p>`;
        }

        await sendEmail({
            email,
            subject: `Meeting Report: ${meeting.title}`,
            message: `Find the meeting details attached.`,
            html: htmlContent
        });

        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { emailMeetingReport };
