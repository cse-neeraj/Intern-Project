import mongoose from "mongoose";

const backInStockSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastNotifiedAt: { type: Date }
});

const BackInStock = mongoose.models.BackInStock || mongoose.model("BackInStock", backInStockSchema);
export default BackInStock;