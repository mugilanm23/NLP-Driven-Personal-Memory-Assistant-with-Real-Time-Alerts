const cron = require("node-cron");
const db = require("../config/db");
const { sendHighPriorityEmail } = require("./email");
const notifier = require("node-notifier");

/**
 * Calculates the next occurrence date for a recurring reminder,
 * ensuring it falls in the future.
 */
function calculateNextOccurrence(dateStr, timeStr, repeatType) {
  const dateParts = dateStr.split("-");
  const timeParts = timeStr.split(":");
  
  // Construct date in local timezone
  let date = new Date(
    parseInt(dateParts[0], 10),
    parseInt(dateParts[1], 10) - 1,
    parseInt(dateParts[2], 10),
    parseInt(timeParts[0], 10),
    parseInt(timeParts[1], 10),
    timeParts[2] ? parseInt(timeParts[2], 10) : 0
  );
  
  const now = new Date();

  while (date <= now) {
    if (repeatType === "DAILY") {
      date.setDate(date.getDate() + 1);
    } else if (repeatType === "WEEKLY") {
      date.setDate(date.getDate() + 7);
    } else if (repeatType === "MONTHLY") {
      date.setMonth(date.getMonth() + 1);
    } else {
      break;
    }
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ⏱ Cron job runs every 60 seconds (1 minute)
cron.schedule("* * * * *", () => {
  const now = new Date();
  
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const timeStr = `${hh}:${min}:00`;

  console.log(`⏱ Cron running: checking for events at ${dateStr} ${timeStr}`);

  // 🔔 STEP 1: TRIGGER DUE PENDING REMINDERS
  // Trigger any PENDING reminder whose scheduled date/time has arrived or passed.
  // This ensures that reminders scheduled for the current minute or any missed minute (e.g. server was offline) will trigger.
  const triggerSql = `
    SELECT * FROM reminders
    WHERE status = 'PENDING' 
      AND (reminder_date < ? OR (reminder_date = ? AND reminder_time <= ?))
  `;

  db.query(triggerSql, [dateStr, dateStr, timeStr], (err, results) => {
    if (err) {
      return console.error("❌ Cron Select Trigger Error:", err);
    }

    results.forEach(r => {
      console.log(`🔔 TRIGGERED memory node: "${r.title}" (Priority: ${r.priority})`);

      // Trigger native system desktop notification on the laptop
      notifier.notify({
        title: r.priority === "HIGH" ? "🚨 High Priority Memory Alert" : "🔔 Memory Reminder",
        message: r.title,
        sound: true, // Play native system sound
        wait: false
      });

      // Update status to TRIGGERED
      db.query("UPDATE reminders SET status = 'TRIGGERED' WHERE id = ?", [r.id], (upErr) => {
        if (upErr) console.error("❌ Failed to update status to TRIGGERED:", upErr);
      });

      // Send email if high priority
      if (r.priority === "HIGH") {
        console.log(`📧 Sending high-priority email alert for memory: "${r.title}"`);
        sendHighPriorityEmail(r);
      }

      // Automatically handle recurrence regeneration
      if (r.repeat_type && r.repeat_type !== "NONE") {
        const nextDate = calculateNextOccurrence(dateStr, r.reminder_time, r.repeat_type);
        console.log(`🔄 Re-scheduling memory "${r.title}" (${r.repeat_type}) for ${nextDate} at ${r.reminder_time}`);
        
        const insertSql = `
          INSERT INTO reminders (title, description, reminder_date, reminder_time, priority, status, repeat_type, category)
          VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)
        `;
        
        db.query(insertSql, [r.title, r.description, nextDate, r.reminder_time, r.priority, r.repeat_type, r.category || "Other"], (insErr) => {
          if (insErr) console.error("❌ Failed to insert recurring occurrence:", insErr);
        });
      }
    });
  });

  // 🧹 STEP 2: MARK ANCIENT PENDING REMINDERS AS MISSED
  // Only mark reminders as MISSED if they are more than 24 hours overdue.
  // This prevents them from being silently marked as missed without triggering when the scheduler runs slightly late.
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yY = yesterday.getFullYear();
  const yM = String(yesterday.getMonth() + 1).padStart(2, "0");
  const yD = String(yesterday.getDate()).padStart(2, "0");
  const yesterdayStr = `${yY}-${yM}-${yD}`;

  const missedSql = `
    SELECT * FROM reminders
    WHERE status = 'PENDING'
      AND reminder_date <= ?
  `;

  db.query(missedSql, [yesterdayStr], (err, results) => {
    if (err) {
      return console.error("❌ Cron Select Missed Error:", err);
    }

    results.forEach(r => {
      console.log(`⚠️ MISSED memory node (over 24h overdue): "${r.title}" (scheduled: ${r.reminder_date} ${r.reminder_time})`);

      // Update status to MISSED
      db.query("UPDATE reminders SET status = 'MISSED' WHERE id = ?", [r.id], (upErr) => {
        if (upErr) console.error("❌ Failed to update status to MISSED:", upErr);
      });

      // Handle recurrence regeneration for missed reminders
      if (r.repeat_type && r.repeat_type !== "NONE") {
        const nextDate = calculateNextOccurrence(r.reminder_date, r.reminder_time, r.repeat_type);
        console.log(`🔄 Re-scheduling missed memory "${r.title}" (${r.repeat_type}) for future date ${nextDate} at ${r.reminder_time}`);
        
        const insertSql = `
          INSERT INTO reminders (title, description, reminder_date, reminder_time, priority, status, repeat_type, category)
          VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)
        `;
        
        db.query(insertSql, [r.title, r.description, nextDate, r.reminder_time, r.priority, r.repeat_type, r.category || "Other"], (insErr) => {
          if (insErr) console.error("❌ Failed to insert recurring occurrence for missed event:", insErr);
        });
      }
    });
  });
});