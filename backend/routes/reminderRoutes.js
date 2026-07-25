const express = require("express");
const router = express.Router();

const {
  addReminder,
  getReminders,
  deleteReminder,
  updateReminder,
  chatWithAssistant
} = require("../controllers/reminderController");

// ➕ Add reminder
router.post("/add", addReminder);

// 💬 Chat with Assistant
router.post("/chat", chatWithAssistant);

// 📥 Get all reminders
router.get("/", getReminders);

// ❌ Delete reminder
router.delete("/:id", deleteReminder);

router.put("/:id", updateReminder);

module.exports = router;