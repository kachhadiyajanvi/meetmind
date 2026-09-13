const docx = require('docx');
const fs = require('fs');
const path = require('path');

const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

const generateDOCX = async (meeting, tasks) => {
    return new Promise((resolve, reject) => {
        try {
            const children = [
                new Paragraph({
                    text: "Meeting Report",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `Title: ${meeting.title}`, bold: true }),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: `Date: ${new Date(meeting.createdAt).toLocaleString()}`, bold: true }),
                    ],
                }),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                // Summary
                new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: meeting.summary || 'No summary available.' }),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                // Decisions
                new Paragraph({ text: "Key Decisions", heading: HeadingLevel.HEADING_2 })
            ];

            if (meeting.decisions && meeting.decisions.length > 0) {
                meeting.decisions.forEach(d => {
                    children.push(new Paragraph({ text: `• ${d}` }));
                });
            } else {
                children.push(new Paragraph({ text: 'No decisions recorded.' }));
            }

            children.push(new Paragraph({ text: "", spacing: { after: 200 } }));

            // Tasks
            children.push(new Paragraph({ text: "Action Items", heading: HeadingLevel.HEADING_2 }));
            if (tasks && tasks.length > 0) {
                tasks.forEach(t => {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: `Task: ${t.description}`, bold: true }),
                            ]
                        }),
                        new Paragraph({
                            text: `Assignee: ${t.assignee} | Deadline: ${t.deadline} | Priority: ${t.priority} | Status: ${t.status}`
                        }),
                        new Paragraph({ text: "" })
                    );
                });
            } else {
                children.push(new Paragraph({ text: 'No tasks recorded.' }));
            }

            const doc = new Document({
                sections: [{ properties: {}, children }]
            });

            const fileName = `meeting_${meeting._id}.docx`;
            const filePath = path.join(__dirname, '..', 'exports', fileName);

            if (!fs.existsSync(path.join(__dirname, '..', 'exports'))) {
                fs.mkdirSync(path.join(__dirname, '..', 'exports'));
            }

            Packer.toBuffer(doc).then((buffer) => {
                fs.writeFileSync(filePath, buffer);
                resolve(`/exports/${fileName}`);
            }).catch(reject);

        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateDOCX };
