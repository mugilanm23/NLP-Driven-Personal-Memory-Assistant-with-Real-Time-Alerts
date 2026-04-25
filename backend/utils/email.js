require("dotenv").config();
const nodemailer = require("nodemailer");

// 📧 Gmail SMTP setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 📤 send email function
function sendEmail(subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err);
    else console.log("Email sent:", info.response);
  });
}

module.exports = { sendEmail };