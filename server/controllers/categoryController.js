import Category from "../models/Category.js";
import { v2 as cloudinary } from "cloudinary";

// Add Category
export const addCategory = async (req, res) => {
    try {
        const { name, bgColor } = req.body;
        let imagePath;

        if (req.file) {
            imagePath = req.file.path;
        } else if (req.files) {
            if (Array.isArray(req.files) && req.files.length > 0) {
                imagePath = req.files[0].path;
            } else if (typeof req.files === 'object') {
                const files = Object.values(req.files).flat();
                if (files.length > 0) {
                    imagePath = files[0].path;
                }
            }
        }

        if (!imagePath && req.body.image) {
            imagePath = req.body.image;
        }

        if (!name || !imagePath || !bgColor) {
            return res.json({ success: false, message: "Name, image, and bgColor are required" });
        }

        let imageUpload;
        try {
            console.log("Uploading image:", imagePath);
            imageUpload = await cloudinary.uploader.upload(imagePath, { resource_type: "image" });
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            return res.json({ success: false, message: "Image upload failed. " + (error.message || "Check server logs.") });
        }

        const category = new Category({
            name,
            image: imageUpload.secure_url,
            bgColor
        });

        await category.save();
        res.json({ success: true, message: "Category Added" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// List Categories
export const listCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json({ success: true, categories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Remove Category
export const removeCategory = async (req, res) => {
    try {
        const { id } = req.body;
        await Category.findByIdAndDelete(id);
        res.json({ success: true, message: "Category Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update Category
export const updateCategory = async (req, res) => {
    try {
        const { id, name, bgColor } = req.body;
        const category = await Category.findById(id);

        if (!category) {
            return res.json({ success: false, message: "Category not found" });
        }

        if (name) category.name = name;
        if (bgColor) category.bgColor = bgColor;

        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
            category.image = imageUpload.secure_url;
        }

        await category.save();
        res.json({ success: true, message: "Category Updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}