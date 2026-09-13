const path = require('path');
const fs = require('fs');

// simple upload handler using multer middleware in route
const uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const file = req.file;
        const relPath = `/uploads/${file.filename}`;

        // Try to extract text for supported types when possible
        let extractedText = '';
        const ext = path.extname(file.originalname).toLowerCase();

        try {
            if (ext === '.txt') {
                extractedText = fs.readFileSync(file.path, 'utf8');
            } else if (ext === '.pdf') {
                try {
                    const pdfParse = require('pdf-parse');
                    const dataBuffer = fs.readFileSync(file.path);
                    const pdfData = await pdfParse(dataBuffer);
                    extractedText = (pdfData && pdfData.text) ? pdfData.text : '';
                } catch (e) {
                    console.warn('pdf-parse not available or failed:', e.message || e);
                }
            } else if (ext === '.docx') {
                try {
                    const mammoth = require('mammoth');
                    const result = await mammoth.extractRawText({ path: file.path });
                    extractedText = result && result.value ? result.value : '';
                } catch (e) {
                    console.warn('mammoth not available or failed:', e.message || e);
                }
            } else if (ext === '.mp3' || ext === '.wav') {
                // audio: currently we just save and return URL; transcription requires external service
                extractedText = '';
            }
        } catch (innerErr) {
            console.error('Text extraction failed', innerErr && innerErr.message ? innerErr.message : innerErr);
        }

        res.json({ url: relPath, extractedText });
    } catch (err) {
        console.error('Upload error', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
};

module.exports = { uploadFile };
