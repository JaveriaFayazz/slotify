import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import businessRoutes from "./routes/business.routes";
import serviceRoutes from "./routes/services.routes";
import availabilityRoutes from "./routes/availability.routes";
import bookingRoutes from "./routes/booking.routes";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
    })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Slotify backend is running!",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Slotify server running on port ${PORT}`);
});