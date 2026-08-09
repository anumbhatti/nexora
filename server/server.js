const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");


const checkUpcomingDeadlines = require("./utils/deadlineReminder");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ==============================
// Database
// ==============================

connectDB();

// ==============================
// Middleware
// ==============================

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ==============================
// Routes
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ==============================
// Test Route
// ==============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Nexora API is running 🚀",
  });
});

// ==============================
// Server
// ==============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Nexora server running on port ${PORT}`);
});

// ==============================
// Deadline Reminder
// ==============================

checkUpcomingDeadlines();

setInterval(
  checkUpcomingDeadlines,
  24 * 60 * 60 * 1000
);