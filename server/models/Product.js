import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: Array,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    offerPrice: {
      type: Number,
      required: true,
    },
    image: {
      type: Array,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    inStock: {
      type: Boolean,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
    },
    maxOrderQuantity: {
      type: Number,
    },
    weight: {
      type: String,
    },
    shelfLife: {
      type: String,
    },
    manufacturer: {
      type: String,
    },
    countryOfOrigin: {
      type: String,
    },
  },
  { timestamps: true },
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
