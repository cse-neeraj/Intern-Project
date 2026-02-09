import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now }
});

const newsletterModel = mongoose.models.newsletter || mongoose.model("newsletter", newsletterSchema);

export default newsletterModel;