import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../config/logger.mjs';
import { transporter } from '../config/mailer.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @description Renders an email template with data and sends it.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} template - The name of the .ejs template file (e.g., 'prApprovalEmail').
 * @param {object} data - The data to inject into the template.
 */
const sendEmail = async (to, subject, template, data) => {
    try {
        const templatePath = path.join(__dirname, `../emailTemplates/${template}.ejs`);
        const html = await ejs.renderFile(templatePath, data);
        const mailOptions = {
            from: `"RHub Notifications" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };
        await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully to ${to} with subject "${subject}".`);
    } catch (error) {
        logger.error(`Error sending email to ${to}: ${error.message}`);
    }
};

export const emailService = {
    sendEmail,
};