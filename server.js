require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const otpRoutes = require("./routes/otpRoutes");
const salonRoutes = require("./routes/salonRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const barberRoutes = require("./routes/barberRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");




const app = express();

// ==================== HTTP SERVER ====================

const server = http.createServer(app);

// ==================== SOCKET.IO ====================

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

// ==================== MIDDLEWARE ====================

app.use(cors());
app.use(express.json());

// Temporary development static access
app.use(express.static("."));

app.use("/uploads", express.static("uploads"));

// ==================== ROUTES ====================

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/salons", salonRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/barbers", barberRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

// ==================== SOCKET.IO AUTHENTICATION ====================

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // ==================== ADMIN ROOM ====================

  socket.on("joinAdminRoom", () => {
    try {
    const token = socket.handshake.auth.token;

console.log(
  "SOCKET AUTH:",
  socket.handshake.auth
);

console.log(
  "SOCKET TOKEN:",
  token ? "TOKEN RECEIVED" : "TOKEN MISSING"
);

if (!token) {
        console.log(
        "Admin room access denied: Token missing"
      );
        socket.emit("adminAuthError", {
          message: "Authentication token required",
        });

        return;
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      console.log(
        "Socket user:",
        decoded
      );

      // Check admin role
      if (decoded.role !== "admin") {
        console.log(
          "Admin room access denied: Not an admin"
        );

        socket.emit("adminAuthError", {
          message: "Admin access required",
        });

        return;
      }

      // Join admin room
      socket.join("adminRoom");

      console.log(
        "Admin joined adminRoom:",
        socket.id
      );

      socket.emit("adminRoomJoined", {
        success: true,
        message: "Successfully joined admin room",
      });

    } catch (error) {

      console.log(
        "Socket JWT error:",
        error.message
      );

      socket.emit("adminAuthError", {
        message: "Invalid or expired token",
      });
    }
  });

  // ==================== DISCONNECT ====================

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );
  });
});

// ==================== HOME ROUTE ====================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HairCutPro Backend API is running",
  });
});

// ==================== MONGODB ====================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:", error.message);
  });

// ==================== START SERVER ====================
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Frontend connected to Backend successfully",
  });
});
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});