const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async (options) => {
    // If SMTP config is missing, write the email to the exports folder as a fallback
    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    const message = {
        from: `${process.env.EMAIL_FROM_NAME || 'MeetMind'} <${process.env.EMAIL_FROM || 'noreply@meetmind.ai'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    if (!host || !port || !user || !pass) {
        // ensure exports dir exists
        const exportsDir = path.join(__dirname, '..', 'exports');
        if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });

        const fileName = `email_${Date.now()}.html`;
        const filePath = path.join(exportsDir, fileName);
        const html = `<!doctype><html><head><meta charset="utf-8"><title>${message.subject}</title></head><body>${message.html}</body></html>`;
        fs.writeFileSync(filePath, html);
        console.warn('SMTP not configured — saved email to', `/exports/${fileName}`);
        return { simulated: true, url: `/exports/${fileName}` };
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        auth: { user, pass }
    });

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return { simulated: false, messageId: info.messageId };
    } catch (err) {
        console.error('Failed to send email via SMTP:', err && err.message ? err.message : err);
        throw err;
    }
};

module.exports = { sendEmail };
