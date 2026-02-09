import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    buttonText: { type: String, default: "Shop Now" },
    buttonLink: { type: String, default: "/products" },
    showBanner: { type: Boolean, default: true },
    showPages: { type: [String], default: ['home'] }
})

const Banner = mongoose.models.banner || mongoose.model("banner", bannerSchema);

export default Banner;