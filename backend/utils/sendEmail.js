// backend/utils/sendEmail.js
const { Resend } = require('resend');

const resend = new Resend(process.env.re_aW7SzJ7y_9qVH2wzUKAfzRgq53cyAuTje);

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', 
      to: to,               
      subject: subject,     
      html: htmlContent,
    });

    console.log("Email sent successfully via Resend:", data);
    return data;
  } catch (error) {
    console.error("Resend Error:", error);
    throw new Error(error.message);
  }
};

module.exports = sendEmail;