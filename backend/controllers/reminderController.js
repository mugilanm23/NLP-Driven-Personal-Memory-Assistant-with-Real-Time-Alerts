const db = require("../config/db");
const { predictPriority, parseTextWithAI, chatWithAI } = require("../services/geminiService");

// Helper to fetch local date details (with weekday)
function getLocalDateStrings() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const timeStr = `${hh}:${min}:${ss}`;

  const weekEnd = new Date();
  weekEnd.setDate(now.getDate() + 6);
  const wY = weekEnd.getFullYear();
  const wM = String(weekEnd.getMonth() + 1).padStart(2, "0");
  const wD = String(weekEnd.getDate()).padStart(2, "0");
  const weekEndStr = `${wY}-${wM}-${wD}`;

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekday = weekdays[now.getDay()];

  return { todayStr, timeStr, weekEndStr, weekday };
}

// ➕ Add memory (or process search query if retrieval intent is detected)
exports.addReminder = async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Content text is required" });
  }

  try {
    // 🧠 NLP parsing using AI (extract title, date, time, repeatType, priority, category and intent)
    const { todayStr, timeStr, weekEndStr, weekday } = getLocalDateStrings();
    const parsed = await parseTextWithAI(text, { dateStr: todayStr, timeStr, weekday });

    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    // 🔍 Case 1: Retrieve/Search query intent detected
    if (parsed.intent === "RETRIEVE") {
      let sql = "";
      let params = [];

      switch (parsed.type) {
        case "today":
          sql = "SELECT * FROM reminders WHERE reminder_date = ? ORDER BY reminder_time";
          params = [todayStr];
          break;
        case "week":
          sql = "SELECT * FROM reminders WHERE reminder_date BETWEEN ? AND ? ORDER BY reminder_date, reminder_time";
          params = [todayStr, weekEndStr];
          break;
        case "high-priority":
          sql = "SELECT * FROM reminders WHERE priority = 'HIGH' ORDER BY reminder_date, reminder_time";
          break;
        case "upcoming":
          sql = `
            SELECT * FROM reminders 
            WHERE status = 'PENDING' 
              AND (reminder_date > ? OR (reminder_date = ? AND reminder_time >= ?))
            ORDER BY reminder_date, reminder_time
          `;
          params = [todayStr, todayStr, timeStr];
          break;
        case "completed":
          sql = "SELECT * FROM reminders WHERE status = 'TRIGGERED' ORDER BY reminder_date DESC, reminder_time DESC";
          break;
        default:
          sql = "SELECT * FROM reminders ORDER BY reminder_date, reminder_time";
      }

      db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({
          isQuery: true,
          queryType: parsed.type || "all",
          message: `Query results for "${parsed.type || "all"}"`,
          data: results
        });
      });
      return;
    }

    // 💾 Case 2: Create memory/reminder intent
    const { title, date, time, repeatType, priority, category } = parsed;

    const sql = `
      INSERT INTO reminders 
      (title, description, reminder_date, reminder_time, priority, status, repeat_type, category)
      VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)
    `;

    db.query(sql, [title, text, date, time, priority, repeatType, category || "Other"], (err, result) => {
      if (err) {
        console.error("Database insert error:", err);
        return res.status(500).json({ error: err.message });
      }

      res.json({
        isQuery: false,
        message: "Memory successfully stored",
        data: {
          id: result.insertId,
          title,
          description: text,
          reminder_date: date,
          reminder_time: time,
          priority,
          status: "PENDING",
          repeat_type: repeatType,
          category: category || "Other"
        }
      });
    });
  } catch (error) {
    console.error("Reminder controller execution error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 💬 Conversational AI Chat Companion
exports.chatWithAssistant = async (req, res) => {
  const { message, history } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    // 1. Fetch all active reminders from DB for real-time context
    db.query("SELECT * FROM reminders ORDER BY reminder_date, reminder_time", async (err, reminders) => {
      if (err) {
        console.error("❌ Database Fetch Error in Chat:", err);
        return res.status(500).json({ error: err.message });
      }

      // Get local time context
      const { todayStr, timeStr, weekday } = getLocalDateStrings();
      const localTimeContext = { dateStr: todayStr, timeStr, weekday };

      // 2. Call Gemini chat agent
      const aiResponse = await chatWithAI(message, history || [], reminders, localTimeContext);
      
      let replyMessage = aiResponse.reply;
      let actionResult = null;
      let updatedReminders = null;

      // 3. Process structured action if Gemini proposed one
      if (aiResponse.action) {
        const { type, id, data } = aiResponse.action;
        
        try {
          if (type === "CREATE") {
            const { title, date, time, repeatType, priority, category } = data;
            
            await new Promise((resolve, reject) => {
              const sql = `
                INSERT INTO reminders 
                (title, description, reminder_date, reminder_time, priority, status, repeat_type, category)
                VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)
              `;
              db.query(sql, [title, `Created via AI Chat: "${message}"`, date, time, priority, repeatType || "NONE", category || "Other"], (insErr, result) => {
                if (insErr) reject(insErr);
                else {
                  actionResult = { success: true, message: `Created reminder "${title}"` };
                  resolve();
                }
              });
            });
          } else if (type === "DELETE" && id) {
            await new Promise((resolve, reject) => {
              db.query("DELETE FROM reminders WHERE id = ?", [id], (delErr) => {
                if (delErr) reject(delErr);
                else {
                  actionResult = { success: true, message: `Deleted reminder` };
                  resolve();
                }
              });
            });
          } else if (type === "UPDATE" && id && data) {
            const updates = [];
            const params = [];
            
            if (data.title !== undefined) { updates.push("title = ?"); params.push(data.title); }
            if (data.reminder_date !== undefined) { updates.push("reminder_date = ?"); params.push(data.reminder_date); }
            if (data.reminder_time !== undefined) { updates.push("reminder_time = ?"); params.push(data.reminder_time); }
            if (data.priority !== undefined) { updates.push("priority = ?"); params.push(data.priority); }
            if (data.status !== undefined) { updates.push("status = ?"); params.push(data.status); }
            if (data.repeat_type !== undefined) { updates.push("repeat_type = ?"); params.push(data.repeat_type); }
            if (data.category !== undefined) { updates.push("category = ?"); params.push(data.category); }
            
            if (updates.length > 0) {
              params.push(id);
              await new Promise((resolve, reject) => {
                const sql = `UPDATE reminders SET ${updates.join(", ")} WHERE id = ?`;
                db.query(sql, params, (upErr) => {
                  if (upErr) reject(upErr);
                  else {
                    actionResult = { success: true, message: `Updated reminder` };
                    resolve();
                  }
                });
              });
            }
          }

          // Fetch updated reminders list if an action was executed
          updatedReminders = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM reminders ORDER BY reminder_date, reminder_time", (fetchErr, results) => {
              if (fetchErr) reject(fetchErr);
              else resolve(results);
            });
          });
          
        } catch (actionErr) {
          console.error("❌ Failed to execute AI proposed action:", actionErr);
          replyMessage += `\n\n*(Note: I tried to perform this action but encountered a database error: ${actionErr.message})*`;
        }
      }

      // Return chat response
      res.json({
        reply: replyMessage,
        action: aiResponse.action,
        actionResult,
        reminders: updatedReminders
      });
    });
  } catch (error) {
    console.error("❌ Chat controller execution error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📥 Get all memories (ordered by date/time)
exports.getReminders = (req, res) => {
  db.query(
    "SELECT * FROM reminders ORDER BY reminder_date, reminder_time",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// ❌ Delete memory
exports.deleteReminder = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM reminders WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Memory deleted successfully" });
  });
};

// ✏️ Update memory details
exports.updateReminder = (req, res) => {
  const { id } = req.params;
  const { title, reminder_date, reminder_time, priority, status, repeat_type, category } = req.body;

  // Build dynamic update query to support partial updates
  const updates = [];
  const params = [];

  if (title !== undefined) { updates.push("title = ?"); params.push(title); }
  if (reminder_date !== undefined) { updates.push("reminder_date = ?"); params.push(reminder_date); }
  if (reminder_time !== undefined) { updates.push("reminder_time = ?"); params.push(reminder_time); }
  if (priority !== undefined) { updates.push("priority = ?"); params.push(priority); }
  if (status !== undefined) { updates.push("status = ?"); params.push(status); }
  if (repeat_type !== undefined) { updates.push("repeat_type = ?"); params.push(repeat_type); }
  if (category !== undefined) { updates.push("category = ?"); params.push(category); }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No parameters provided for update" });
  }

  params.push(id);
  const sql = `UPDATE reminders SET ${updates.join(", ")} WHERE id = ?`;

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Memory updated successfully" });
  });
};