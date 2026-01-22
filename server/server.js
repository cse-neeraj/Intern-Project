import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose, { connect } from "mongoose";
import connectDB from "./configs/db.js";
import "dotenv/config.js";
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
import { stripeWebhooks } from "./controllers/orderController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

await connectDB();
await connectCloudinary();

// Debugging: Check existing collections on startup
try {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("📂 Existing Collections:", collections.map((c) => c.name));

  // Fix: Seed categories if empty so .find() doesn't return []
  const categoryCollection = db.collection("categories");
  const count = await categoryCollection.countDocuments();
  if (count === 0) {
    console.log("⚠️ 'categories' collection is empty. Seeding with a test category...");
    await categoryCollection.insertOne({
      name: "Vegetables",
      image: "https://placehold.co/600x400/png",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Seeded 'categories' with 1 document.");
  }
} catch (error) {
  console.error("Error checking collections:", error);
}

// Allow multiple origins
const allowedOrigins = ["http://localhost:5173"];
app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);
// middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// API Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);
app.use("/api/category", categoryRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => {
  const PORT = process.env.PORT || 5000;
  console.log(`Server is running on ${port}`);
});
