import mongoose from "mongoose";

const StockHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
        type: String,
        required: true
    },
    oldStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    action: {
      type: String,
      enum: ["update", "create", "delete", "order"],
      default: "update",
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },
  },
  { timestamps: true },
);

const StockHistory =
  mongoose.models.StockHistory || mongoose.model("StockHistory", StockHistorySchema);

export default StockHistory;
