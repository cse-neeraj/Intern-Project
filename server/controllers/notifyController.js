import BackInStock from "../models/BackInStock.js";

export const subscribeToBackInStock = async (req, res) => {
    try {
        const { productId, email } = req.body;
        if (!email || !productId) return res.json({ success: false, message: "Email and Product ID required" });

        // Check if already subscribed
        const existing = await BackInStock.findOne({ productId, email });
        if (existing) return res.json({ success: true, message: "You are already subscribed for this product" });

        await BackInStock.create({ productId, email });
        res.json({ success: true, message: "You will be notified when stock is available" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getUserSubscriptions = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.json({ success: false, message: "Email required" });
        const subscriptions = await BackInStock.find({ email }).populate('productId').sort({ createdAt: -1 });
        res.json({ success: true, subscriptions });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const unsubscribe = async (req, res) => {
    try {
        const { id } = req.body;
        await BackInStock.findByIdAndDelete(id);
        res.json({ success: true, message: "Unsubscribed successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await BackInStock.find({}).populate('productId').sort({ createdAt: -1 });
        res.json({ success: true, subscribers });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}