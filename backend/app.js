require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messes", require("./routes/messRoutes"));
app.use("/api/messes", require("./routes/galleryRoutes"));
app.use("/api/messes", require("./routes/menuRoutes"));
app.use("/api", require("./routes/bookingRoutes"));
app.use("/api", require("./routes/reviewRoutes"));
app.use("/api", require("./routes/favoriteRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/owner", require("./routes/ownerRoutes"));

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

app.use(errorHandler);

module.exports = app;