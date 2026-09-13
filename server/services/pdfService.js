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

            // Tasks - render a clean table-like layout
            doc.moveDown();
            doc.fontSize(16).text('Action Items');
            doc.moveDown(0.5);
            if (tasks && tasks.length > 0) {
                // Table header
                const startX = doc.x;
                const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
                const colWidths = [tableWidth * 0.45, tableWidth * 0.18, tableWidth * 0.18, tableWidth * 0.19];

                doc.fontSize(12).fillColor('#0f172a').text('Task', startX, doc.y, { width: colWidths[0], continued: true });
                doc.text('Assignee', { width: colWidths[1], continued: true });
                doc.text('Deadline', { width: colWidths[2], continued: true });
                doc.text('Priority', { width: colWidths[3] });
                doc.moveDown(0.5);

                // Divider
                doc.strokeColor('#e6e9ee').lineWidth(1).moveTo(startX, doc.y).lineTo(startX + tableWidth, doc.y).stroke();
                doc.moveDown(0.5);

                tasks.forEach(t => {
                    doc.fontSize(11).fillColor('#0f172a').text(t.description, { width: colWidths[0], continued: true });
                    doc.text(t.assignee, { width: colWidths[1], continued: true });
                    doc.text(t.deadline, { width: colWidths[2], continued: true });
                    doc.text(t.priority, { width: colWidths[3] });
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
