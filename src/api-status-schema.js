import mongoose from "mongoose";

const apiStatusSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  working: { type: Boolean, required: true },
  lastUpdated: { type: Date, default: Date.now },
  error: String,
});

const ApiStatus = mongoose.model("ApiStatus", apiStatusSchema);

export default ApiStatus;
