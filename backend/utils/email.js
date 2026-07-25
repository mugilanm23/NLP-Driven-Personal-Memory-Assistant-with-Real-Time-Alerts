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

/**
 * Core sendEmail function
 * Supports both plain text and rich HTML formats
 */
function sendEmail(subject, text, html) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_TO,
    subject,
    text,
    html
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("❌ Nodemailer send error:", err);
    } else {
      console.log("📧 Email alert sent successfully:", info.response);
    }
  });
}

/**
 * Formats a high-priority reminder into a professional responsive HTML layout
 * and sends it immediately to the configured recipient email.
 */
function sendHighPriorityEmail(reminder) {
  const title = reminder.title;
  const dateVal = reminder.reminder_date;
  const timeVal = reminder.reminder_time;
  const priority = reminder.priority;

  // Format date nicely for email: YYYY-MM-DD to DD Month YYYY
  let formattedDate = dateVal;
  try {
    const d = new Date(dateVal);
    formattedDate = d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch (e) {
    console.error("Date formatting failed for email", e);
  }

  // Format time: HH:MM:SS to 12-hour AM/PM
  let formattedTime = timeVal;
  try {
    const timeParts = timeVal.split(":");
    const dummyDate = new Date();
    dummyDate.setHours(parseInt(timeParts[0], 10));
    dummyDate.setMinutes(parseInt(timeParts[1], 10));
    formattedTime = dummyDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  } catch (e) {
    console.error("Time formatting failed for email", e);
  }

  const subject = `🔥 URGENT ALERT: ${title}`;
  
  const textBackup = `
🚨 HIGH PRIORITY MEMORY ALERT 🚨

Memory: ${title}
Date: ${formattedDate}
Time: ${formattedTime}
Priority: ${priority}

Please take action immediately.

— Personal Memory Assistant
  `.trim();

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>High Priority Alert</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background-color: #f1f5f9;
      margin: 0;
      padding: 20px;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      padding: 28px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .body-content {
      padding: 32px 28px;
      color: #334155;
    }
    .greeting {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
    }
    .intro {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 28px;
    }
    .card {
      background-color: #fef2f2;
      border-left: 5px solid #ef4444;
      padding: 20px;
      margin-bottom: 28px;
      border-radius: 4px 12px 12px 4px;
    }
    .card-label {
      font-size: 11px;
      text-transform: uppercase;
      color: #b91c1c;
      font-weight: 700;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }
    .card-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.4;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .details-table td {
      padding: 14px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .table-label {
      font-weight: 600;
      color: #64748b;
      width: 25%;
    }
    .table-value {
      color: #1e293b;
      font-weight: 600;
    }
    .badge {
      background-color: #fee2e2;
      color: #ef4444;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      display: inline-block;
      border: 1px solid #fca5a5;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🚨 High Priority Memory Alert</h1>
    </div>
    <div class="body-content">
      <div class="greeting">Hello,</div>
      <div class="intro">
        This is an automated alert from your <strong>Personal Memory Assistant</strong>. 
        You configured a high-priority alert scheduled for this time.
      </div>
      
      <div class="card">
        <div class="card-label">Memory Node Title</div>
        <div class="card-title">${title}</div>
      </div>
      
      <table class="details-table">
        <tr>
          <td class="table-label">Date</td>
          <td class="table-value">📅 ${formattedDate}</td>
        </tr>
        <tr>
          <td class="table-label">Time</td>
          <td class="table-value">⏰ ${formattedTime}</td>
        </tr>
        <tr>
          <td class="table-label">Priority</td>
          <td class="table-value"><span class="badge">🔥 ${priority}</span></td>
        </tr>
      </table>
    </div>
    <div class="footer">
      Sent by <strong>AI-Enhanced Personal Memory Assistant</strong>.<br>
      Please take appropriate action soon.
    </div>
  </div>
</body>
</html>
  `.trim();

  sendEmail(subject, textBackup, htmlContent);
}

module.exports = {
  sendEmail,
  sendHighPriorityEmail
};