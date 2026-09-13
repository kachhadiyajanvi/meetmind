const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePDF = async (meeting, tasks) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const fileName = `meeting_${meeting._id}.pdf`;
            const filePath = path.join(__dirname, '..', 'exports', fileName);

            // ensure exports dir exists
            if (!fs.existsSync(path.join(__dirname, '..', 'exports'))) {
                fs.mkdirSync(path.join(__dirname, '..', 'exports'));
            }

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('Meeting Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(14).text(`Title: ${meeting.title}`);
            doc.fontSize(12).text(`Date: ${new Date(meeting.createdAt).toLocaleString()}`);
            doc.moveDown();

            // Summary
            doc.fontSize(16).text('Summary');
            doc.fontSize(12).text(meeting.summary || 'No summary available.');
            doc.moveDown();

            // Decisions
            doc.fontSize(16).text('Key Decisions');
            if (meeting.decisions && meeting.decisions.length > 0) {
                meeting.decisions.forEach(d => {
                    doc.fontSize(12).text(`• ${d}`);
                });
            } else {
                doc.fontSize(12).text('No decisions recorded.');
            }
            doc.moveDown();

            // Tasks
            doc.fontSize(16).text('Action Items');
            if (tasks && tasks.length > 0) {
                tasks.forEach(t => {
                    doc.fontSize(12).text(`- Task: ${t.description}`);
                    doc.fontSize(10).text(`  Assignee: ${t.assignee} | Deadline: ${t.deadline} | Priority: ${t.priority} | Status: ${t.status}`);
                    doc.moveDown(0.5);
                });
            } else {
                doc.fontSize(12).text('No tasks recorded.');
            }

            doc.end();
            stream.on('finish', () => resolve(`/exports/${fileName}`));
            stream.on('error', (err) => reject(err));
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generatePDF };
