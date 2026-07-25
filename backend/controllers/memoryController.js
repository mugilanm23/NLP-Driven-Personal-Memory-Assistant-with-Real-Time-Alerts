const db = require("../config/db");

// Helper to get local date strings to prevent server timezone mismatch issues
function getLocalDateStrings() {
  const now = new Date();
  
  // Format local date YYYY-MM-DD
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Local time HH:MM:SS
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const timeStr = `${hh}:${min}:${ss}`;

  // Week end (today + 6 days)
  const weekEnd = new Date();
  weekEnd.setDate(now.getDate() + 6);
  const wY = weekEnd.getFullYear();
  const wM = String(weekEnd.getMonth() + 1).padStart(2, "0");
  const wD = String(weekEnd.getDate()).padStart(2, "0");
  const weekEndStr = `${wY}-${wM}-${wD}`;

  return { todayStr, timeStr, weekEndStr };
}

// 📅 GET /api/memory/today
exports.getTodayMemories = (req, res) => {
  const { todayStr } = getLocalDateStrings();
  const sql = "SELECT * FROM reminders WHERE reminder_date = ? ORDER BY reminder_time";
  
  db.query(sql, [todayStr], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 🗓 GET /api/memory/week
exports.getWeekMemories = (req, res) => {
  const { todayStr, weekEndStr } = getLocalDateStrings();
  const sql = "SELECT * FROM reminders WHERE reminder_date BETWEEN ? AND ? ORDER BY reminder_date, reminder_time";
  
  db.query(sql, [todayStr, weekEndStr], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 🔥 GET /api/memory/high-priority
exports.getHighPriorityMemories = (req, res) => {
  const sql = "SELECT * FROM reminders WHERE priority = 'HIGH' ORDER BY reminder_date, reminder_time";
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// ⏳ GET /api/memory/upcoming
exports.getUpcomingMemories = (req, res) => {
  const { todayStr, timeStr } = getLocalDateStrings();
  
  // Upcoming means PENDING status and scheduled time is >= current time
  const sql = `
    SELECT * FROM reminders 
    WHERE status = 'PENDING' 
      AND (reminder_date > ? OR (reminder_date = ? AND reminder_time >= ?))
    ORDER BY reminder_date, reminder_time
  `;
  
  db.query(sql, [todayStr, todayStr, timeStr], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// ✅ GET /api/memory/completed
exports.getCompletedMemories = (req, res) => {
  // Completed maps to TRIGGERED status
  const sql = "SELECT * FROM reminders WHERE status = 'TRIGGERED' ORDER BY reminder_date DESC, reminder_time DESC";
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 📊 GET /api/memory/stats
exports.getMemoryStats = (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'TRIGGERED' THEN 1 ELSE 0 END) as triggered,
      SUM(CASE WHEN status = 'MISSED' THEN 1 ELSE 0 END) as missed,
      SUM(CASE WHEN priority = 'HIGH' THEN 1 ELSE 0 END) as highPriority
    FROM reminders
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Normalize response values to always be integers (SUM returns string/null sometimes)
    const stats = results[0] || {};
    res.json({
      total: parseInt(stats.total || 0, 10),
      pending: parseInt(stats.pending || 0, 10),
      triggered: parseInt(stats.triggered || 0, 10),
      missed: parseInt(stats.missed || 0, 10),
      highPriority: parseInt(stats.highPriority || 0, 10)
    });
  });
};
