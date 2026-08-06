// backend/app.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const hpp = require("hpp");

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

// CORS
app.use(
  cors({
    origin: config.clientUrl,
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