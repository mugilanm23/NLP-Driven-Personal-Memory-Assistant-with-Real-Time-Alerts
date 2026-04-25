const cron = require("node-cron");
const db = require("../config/db");
const { sendEmail } = require("./email");

cron.schedule("* * * * *", () => {
  const now = new Date();

  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().slice(0, 5) + ":00";

  // 🧹 STEP 1: DELETE FIRST (cleanup expired)
  const deleteSql = `
    DELETE FROM reminders
    WHERE reminder_date < ?
       OR (reminder_date = ? AND reminder_time < ?)
  `;

  db.query(deleteSql, [date, date, time], (err) => {
    if (err) console.error("Delete Error:", err);
    else console.log("🧹 Old reminders cleaned");
  });

  // 🔔 STEP 2: THEN FETCH REMINDERS
  const selectSql = `
    SELECT * FROM reminders
    WHERE reminder_date = ? AND reminder_time = ?
  `;

  db.query(selectSql, [date, time], (err, results) => {
    if (err) return console.error(err);

    results.forEach(r => {
      console.log("🔔 REMINDER:", r.title);

      if (r.priority === "HIGH") {
        sendEmail(
          "🔥 URGENT REMINDER ALERT",
          `
Hi,

🚨 You have set a HIGH PRIORITY reminder.

📌 Title: ${r.title}
⏰ Time: ${r.reminder_time}
📅 Date: ${r.reminder_date}

⚠️ Please take action immediately.

— Smart Memory Assistant
          `
        );
      }
    });
  });
});