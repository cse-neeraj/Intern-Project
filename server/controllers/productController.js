import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";

// Add Product : /api/product/add

export const addProduct = async (req, res) => {
  try {
    let productData = JSON.parse(req.body.productData);
    console.log(productData);

    const images = req.files || [];
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      }),
    );

    await Product.create({ ...productData, image: imagesUrl });
    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Update Product : /api/product/update
export const updateProduct = async (req, res) => {
  try {
    const { productId, ...updateData } = JSON.parse(req.body.productData);
    
    // Check if new images are uploaded
    const images = req.files || [];
    let imagesUrl = [];
    
    if (images.length > 0) {
       imagesUrl = await Promise.all(
        images.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        }),
      );
      // If new images, assume replacement or append? 
      // For now, let's Append to existing if specific logic isn't provided, 
      // OR mostly users expect replacement if they upload new ones.
      // Let's go with replacement if new images are provided, otherwise keep old.
      // Actually, typically in these forms, if you upload, you replace or add.
      // Let's just Add `image` to updateData if we have new ones.
      updateData.image = imagesUrl;
    }

    // However, if we want to KEEP old images and ADD new ones, we need to handle that on frontend or here.
    // For simplicity given the inputs, if new images are sent, we update the image array. 
    // If the user wants to keep old ones, they likely wouldn't upload new ones in a simple "replace" flow, 
    // or the frontend works by sending 'existing images' + 'new files'.
    // `AddProduct` logic suggests simple file upload. 
    // Let's stick to: If files uploaded, update `image` field.
    
    // IMPORTANT: If the user didn't upload new files, `req.files` is empty. We shouldn't overwrite `image` with empty array.
    
    const product = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    
    if(!product) {
        return res.json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product Updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Product List : /api/product/list

export const productList = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// get Product : /api/product/:id
export const productById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//get Products inStock : /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    await Product.findByIdAndUpdate(id, { inStock });
    res.json({ success: true, message: "Stock updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


// Update Product Quantity
export const updateProductQuantity = async (req, res) => {
    try {
        const { id, quantity } = req.body;
        
        const product = await Product.findById(id);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        product.quantity = quantity;
        await product.save();
        
        res.json({ success: true, message: "Quantity updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}
