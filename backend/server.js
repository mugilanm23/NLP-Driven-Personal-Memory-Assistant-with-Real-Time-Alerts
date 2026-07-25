require("dotenv").config();
const express = require("express");
const cors = require("cors");
const migrate = require("./config/migrate");

const app = express();

// 🌐 Allow frontend connection
app.use(cors());

// 📦 Parse JSON body
app.use(express.json());

// 🔗 Core CRUD Routes
const reminderRoutes = require("./routes/reminderRoutes");
app.use("/api/reminders", reminderRoutes);

// 🧠 Memory Retrieval Engine Routes
const memoryRoutes = require("./routes/memoryRoutes");
app.use("/api/memory", memoryRoutes);

// ⏱ Cron job scheduler
require("./utils/cron");

// 🧹 Ignore Chrome DevTools request
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(204).end();
});

// 🚀 Run database migrations on start, then boot up server
const PORT = 5000;

migrate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server successfully running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Failed to apply database migrations on startup. Server booting anyway...", err);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT} with migration errors`);
    });
  });