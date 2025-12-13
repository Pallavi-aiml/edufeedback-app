// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  console.log(`Attempting to send email to: ${to}`); 

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",    
      port: 465,                 
      secure: true,             
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
     
      family: 4, 
    });

    
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.log("Transporter verification failed:", error);
          reject(error);
        } else {
          console.log("Server is ready to take our messages");
          resolve(success);
        }
      });
    });

    const info = await transporter.sendMail({
      from: `"EduFeedback Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`Email sent successfully! Message ID: ${info.messageId}`); 

  } catch (error) {
    console.error("!!! Email Sending Error Caught !!!:", error); 
    throw new Error(`Failed to send email: ${error.message}`); 
  }
};

module.exports = sendEmail;