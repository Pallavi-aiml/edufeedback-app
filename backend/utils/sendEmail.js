// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  console.log(`Attempting to send email to: ${to}`); // <-- Log start
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Ensure this is your Google App Password
      },
      // Optional: Add timeout settings
      // connectionTimeout: 10000, // 10 seconds
      // socketTimeout: 10000, // 10 seconds
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log(`Email sent successfully! Message ID: ${info.messageId}`); // <-- Log success

  } catch (error) {
    // --- THIS IS THE CRITICAL PART ---
    console.error("!!! Email Sending Error Caught !!!:", error); // <-- Log the specific email error
    // Re-throw the error so the calling function (register) catches it
    throw new Error(`Failed to send email: ${error.message}`); 
  }
};

module.exports = sendEmail;