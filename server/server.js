import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import passport from "passport";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose, { connect } from "mongoose";
import connectDB from "./configs/db.js";
import "dotenv/config";
import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import path from "path";
import { fileURLToPath } from "url";
import connectCloudinary from "./configs/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import bannerRouter from "./routes/bannerRoute.js";
import storeRouter from "./routes/storeRoute.js";
import contactRouter from "./routes/contactRoute.js";
import newsletterRouter from "./routes/newsletterRoute.js";
import notificationRouter from "./routes/notificationRoute.js";
import { stripeWebhooks } from "./controllers/orderController.js";
import notifyRouter from "./routes/notifyRoute.js";   
import emailRouter from "./routes/emailRoute.js";
import Banner from "./models/Banner.js";
import "./configs/passport.js";
import googleAuthRouter from "./routes/googleAuthRoute.js";
import logger from "./configs/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow multiple origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];
if(process.env.FRONTEND_URL){
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  logger.info(`a user connected ${socket.id}`);
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
    }
  });
});

const port = process.env.PORT || 4000;

await connectDB();
await connectCloudinary();

// Debugging: Check existing collections on startup
try {
  if (mongoose.connection.readyState === 1) {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    // Fix: Seed categories if empty so .find() doesn't return []
    const categoryCollection = db.collection("categories");
    const count = await categoryCollection.countDocuments();
    if (count === 0) {
      logger.warn("⚠️ 'categories' collection is empty. Seeding with a test category...");
      await categoryCollection.insertOne({
        name: "Vegetables",
        image: "https://placehold.co/600x400/png",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      logger.info("✅ Seeded 'categories' with 1 document.");
    }
  } else {
    logger.warn("⚠️ Database not connected, skipping collection check.");
  }
} catch (error) {
  logger.error(`Error checking collections: ${error.message}`);
}

app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);
// middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(passport.initialize());

// API Request Logger
app.use((req, res, next) => {
  logger.info(`${req.method} request for '${req.url}'`);
  next();
});

app.use("/api/user", googleAuthRouter);
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/category", categoryRouter);
app.use("/api/banner", bannerRouter);
app.use("/api/store", storeRouter);
app.use("/api/contact", contactRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/notify", notifyRouter);
app.use("/api/email", emailRouter);

app.get("/api/home-banners", async (req, res) => {
  try {
    const banners = await Banner.find({ showBanner: true });
    res.json({ success: true, data: banners });
  } catch (error) {
    logger.error(error.message);
    res.json({ success: false, message: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("API Working");
});

server.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`Port ${port} is already in use. Please free the port or use a different one.`);
    process.exit(1);
  } else {
    logger.error(err);
  }
});
