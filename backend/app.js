// backend/app.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const hpp = require("hpp");
const path = require("path");
const fs = require("fs");

const config = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const { issueCsrfToken, verifyCsrfToken } = require("./middleware/csrf");

const app = express();

/* =====================================================
   Security Middleware
===================================================== */

// Secure HTTP headers
app.use(
  helmet({
    contentSecurityPolicy:
      config.nodeEnv === "production" ? undefined : false,
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// Prevent HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: ["facilities", "tags", "nearbyColleges"],
  })
);

// CORS configuration allowing localhost and local network IP access
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or local network connections
      if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:") || origin.startsWith("http://192.168.") || origin.startsWith("http://172.")) {
        return callback(null, true);
      }
      if (config.clientUrl && origin === config.clientUrl) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

/* =====================================================
   Body Parser
===================================================== */

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/* =====================================================
   Cookie Parser
===================================================== */

app.use(cookieParser());

/* =====================================================
   CSRF Protection
===================================================== */

// Issues CSRF token cookie
app.use(issueCsrfToken);

// Verifies token for protected requests
app.use(verifyCsrfToken);

/* =====================================================
   Health Check
===================================================== */

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
  });
});

/* =====================================================
   API Routes
===================================================== */

// Authentication
app.use("/api/auth", require("./routes/authRoutes"));

// Users
app.use("/api/users", require("./routes/userRoutes"));

// Messes
app.use("/api/messes", require("./routes/messRoutes"));
app.use("/api/messes", require("./routes/galleryRoutes"));
app.use("/api/messes", require("./routes/menuRoutes"));

// Booking
app.use("/api", require("./routes/bookingRoutes"));

// Reviews
app.use("/api", require("./routes/reviewRoutes"));

// Favorites
app.use("/api", require("./routes/favoriteRoutes"));

// Notifications
app.use(
  "/api/notifications",
  require("./routes/notificationRoutes")
);

// Owner Dashboard
app.use("/api/owner", require("./routes/ownerRoutes"));

// Owner Attendance
app.use("/api/owner", require("./routes/attendanceRoutes"));

// Student Attendance
app.use("/api/student/attendance", require("./routes/studentAttendanceRoutes"));
app.use("/api/student/billing", require("./routes/studentBillingRoutes"));
app.use("/api/student/payments", require("./routes/paymentRoutes"));

// Owner Billing
app.use("/api/owner", require("./routes/billingRoutes"));
app.use("/api/owner", require("./routes/reportingRoutes"));
app.use("/api/owner", require("./routes/exportRoutes"));

/* =====================================================
   Serve Frontend in Production / Built State
===================================================== */

const frontendDistPath = path.join(__dirname, "../frontend/dist");

if (config.nodeEnv === "production" || fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.resolve(frontendDistPath, "index.html"));
    }
    next();
  });
}

/* =====================================================
   404 Handler
===================================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =====================================================
   Global Error Handler
===================================================== */

app.use(errorHandler);

/* =====================================================
   Export App
===================================================== */

module.exports = app;