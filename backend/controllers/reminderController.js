const db = require("../config/db");
const { parseText } = require("../utils/parser");

// ➕ Add reminder API
exports.addReminder = (req, res) => {
  const { text } = req.body;

  // 🧠 NLP parsing (extract title, date, time, priority)
  const parsed = parseText(text);

  // ❌ validation fail
  if (parsed.error) {
    return res.status(400).json({ message: parsed.error });
  }

  const { title, date, time, priority } = parsed;

  // 💾 insert into DB
  const sql = `
    INSERT INTO reminders 
    (title, description, reminder_date, reminder_time, priority)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [title, text, date, time, priority], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Reminder added",
      data: { title, date, time }
    });
  });
};

// 📥 Get all reminders
exports.getReminders = (req, res) => {
  db.query(
    "SELECT * FROM reminders ORDER BY reminder_date, reminder_time",
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

// ❌ Delete reminder
exports.deleteReminder = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM reminders WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
};

exports.updateReminder = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  db.query(
    "UPDATE reminders SET title=? WHERE id=?",
    [title, id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Updated" });
    }
  );
};