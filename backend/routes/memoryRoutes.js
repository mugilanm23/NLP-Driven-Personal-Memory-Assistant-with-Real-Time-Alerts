const express = require("express");
const router = express.Router();
const {
  getTodayMemories,
  getWeekMemories,
  getHighPriorityMemories,
  getUpcomingMemories,
  getCompletedMemories,
  getMemoryStats
} = require("../controllers/memoryController");

router.get("/today", getTodayMemories);
router.get("/week", getWeekMemories);
router.get("/high-priority", getHighPriorityMemories);
router.get("/upcoming", getUpcomingMemories);
router.get("/completed", getCompletedMemories);
router.get("/stats", getMemoryStats);

module.exports = router;
