
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

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://slotify-phi-orcin.vercel.app",
    "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin))
 .map((origin) => origin.replace(/\/$/, ""));

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an Origin header, such as server-to-server requests.
            if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
                callback(null, true);
            } else {
                console.error("CORS blocked origin:", origin);
                callback(new Error("Origin not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (_req, res) => {
    res.json({
        message: "Slotify backend is running!",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Slotify server running on port ${PORT}`);
});
