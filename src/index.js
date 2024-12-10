import express from "express";
import cron from "node-cron";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { checkApiStatus, saveApiStatus } from "./status-checker.js";
import ApiStatus from "./api-status-schema.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
const port = process.env.PORT || 3002;

const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI)
  .then(async () => {
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(
      (collection) => collection.name === "ApiStatus"
    );

    if (!collectionExists) {
      console.log("ApiStatus collection does not exist. Creating it now.");
      await ApiStatus.createCollection();
    }

    console.log("Running initial API status check...");
    const initialApiStatuses = await checkApiStatus();
    await saveApiStatus(initialApiStatuses);

    cron.schedule("0 * * * *", async () => {
      console.log("Checking API status...");
      const apiStatuses = await checkApiStatus();
      await saveApiStatus(apiStatuses);
    });
    console.log("API status checker started.");

    app.get("/", async (req, res) => {
      res.json({
        message: "Status checker is working as expected.",
      });
    });

    app.get("/api/status", async (req, res) => {
      try {
        const apiStatuses = await ApiStatus.find({});
        res.json(apiStatuses);
      } catch (err) {
        console.error("Error fetching API status:", err);
        res.status(500).json({ error: "Failed to fetch API status" });
      }
    });

    app.listen(port, () => {
      console.log(`API status server listening on port ${port}`);
    });
  })
  .catch((error) => console.error("MongoDB connection error:", error));
