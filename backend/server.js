const express = require("express");
const cors = require("cors");

const app = express();

// 🌐 Allow frontend connection
app.use(cors());

// 📦 Parse JSON body
app.use(express.json());

// 🔗 Routes
const reminderRoutes = require("./routes/reminderRoutes");
app.use("/api/reminders", reminderRoutes);

// ⏱ Cron job (notifications + cleanup)
require("./utils/cron");

// 🧹 ignore chrome devtools request
app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(204).end();
});

// 🚀 Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});