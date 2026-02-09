import Banner from "../models/Banner.js";
import { v2 as cloudinary } from "cloudinary";

const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find({});
        res.json({ success: true, banners });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const addBanner = async (req, res) => {
    try {
        const { title, description, buttonText, buttonLink, showBanner, showPages } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.json({ success: false, message: "Image is required" });
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        
        const parsedShowPages = showPages ? JSON.parse(showPages) : ['home'];

        const banner = new Banner({
            title,
            description,
            image: imageUpload.secure_url,
            buttonText,
            buttonLink,
            showBanner: showBanner === 'true' || showBanner === true,
            showPages: parsedShowPages
        });

        await banner.save();
        res.json({ success: true, message: "Banner Added" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const updateBanner = async (req, res) => {
    try {
        const { id, title, description, buttonText, buttonLink, showBanner, showPages } = req.body;
        const imageFile = req.file;

        const banner = await Banner.findById(id);
        if (!banner) {
             return res.json({ success: false, message: "Banner not found" });
        }

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            banner.image = imageUpload.secure_url;
        }

        const parsedShowPages = showPages ? JSON.parse(showPages) : banner.showPages;

        banner.title = title;
        banner.description = description;
        banner.buttonText = buttonText;
        banner.buttonLink = buttonLink;
        banner.showBanner = showBanner === 'true' || showBanner === true;
        banner.showPages = parsedShowPages;

        await banner.save();
        res.json({ success: true, message: "Banner Updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        await Banner.findByIdAndDelete(id);
        res.json({ success: true, message: "Banner Deleted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { getBanners, addBanner, updateBanner, deleteBanner };