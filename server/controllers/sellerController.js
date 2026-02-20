import jwt from "jsonwebtoken";
import productModel from "../models/Product.js";
import BackInStock from "../models/BackInStock.js";
import { getBackInStockEmailTemplate } from "./emailTemplates.js";
import { sendEmail } from "../utils/email.js";

import Seller from "../models/Seller.js";
import StockHistory from "../models/StockHistory.js";
import bcrypt from "bcryptjs";

// login seller : /api/seller/login

export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });

    if (!seller) {
        return res.json({ success: false, message: "Invalid email or password" });
    }

    if (seller.isActive === false) {
        return res.json({ success: false, message: "Account is deactivated. Please contact admin." });
    }

    const isMatch = await bcrypt.compare(password, seller.password);

    if (isMatch) {
      const token = jwt.sign({ id: seller._id, role: seller.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || process.env.FRONTEND_URL?.includes("https"),
        sameSite: process.env.NODE_ENV === "production" || process.env.FRONTEND_URL?.includes("https") ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return res.json({
        success: true,
        message: "Seller logged in successfully",
        seller: { email: seller.email, name: seller.name },
      });
    } else {
      return res.json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Update product stock
export const updateStock = async (req, res) => {
  try {
      const { productId, stock } = req.body;
      const sellerId = req.sellerId; // Assuming authSeller middleware attaches sellerId

      const product = await productModel.findById(productId);
      if (!product) {
          return res.json({ success: false, message: "Product not found" });
      }

      const oldStock = product.quantity;
      product.quantity = Number(stock);
      await product.save();

      // Log to history
      await StockHistory.create({
          productId,
          productName: product.name,
          oldStock,
          newStock: Number(stock),
          action: "update",
          sellerId: sellerId || null 
      });

      // Check for back-in-stock subscriptions
      if (Number(stock) > 0) {
        const subscribers = await BackInStock.find({ productId });
        if (subscribers.length > 0) {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const productUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/product/${product.category.toLowerCase()}/${product._id}`;

                for (const sub of subscribers) {
                    sendEmail({
                        to: sub.email,
                        subject: 'Product Back in Stock!',
                        html: getBackInStockEmailTemplate(product.name, productUrl)
                    }).catch(err => console.log("Email error:", err));
                }
            } else {
                console.log("Skipping email notifications: EMAIL_USER or EMAIL_PASS not set.");
            }

            // Mark subscriptions as notified instead of deleting
            await BackInStock.updateMany({ productId }, { lastNotifiedAt: new Date() });
        }
      }

      res.json({ success: true, message: "Stock updated" });

  } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
  }
}

// Get Stock History
export const getStockHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20, startDate, endDate } = req.query;
        
        let query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59))
            };
        } else if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        }

        const history = await StockHistory.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await StockHistory.countDocuments(query);

        res.json({ success: true, history, total, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Update product features (min/max qty)
export const updateProductFeatures = async (req, res) => {
  try {
      const { productId, minOrderQuantity, maxOrderQuantity } = req.body;

      const product = await productModel.findById(productId);
      if (!product) {
          return res.json({ success: false, message: "Product not found" });
      }

      if (minOrderQuantity !== undefined) product.minOrderQuantity = Number(minOrderQuantity);
      if (maxOrderQuantity !== undefined) product.maxOrderQuantity = maxOrderQuantity === "" ? undefined : Number(maxOrderQuantity);

      await product.save();

      res.json({ success: true, message: "Product updated" });

  } catch (error) {
      console.log(error);
      res.json({ success: false, message: error.message });
  }
}

// Toggle product stock status
export const toggleProductStock = async (req, res) => {
  try {
    const { productId, inStock } = req.body;

    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    product.inStock = inStock;
    await product.save();

    // Check for back-in-stock subscriptions if product is now in stock and has quantity
    if (inStock && product.quantity > 0) {
      const subscribers = await BackInStock.find({ productId });
      if (subscribers.length > 0) {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          const productUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/product/${product.category.toLowerCase()}/${product._id}`;

          for (const sub of subscribers) {
            sendEmail({
              to: sub.email,
              subject: 'Product Back in Stock!',
              html: getBackInStockEmailTemplate(product.name, productUrl)
            }).catch(err => console.log("Email error:", err));
          }
        } else {
          console.log("Skipping email notifications: EMAIL_USER or EMAIL_PASS not set.");
        }

        // Mark subscriptions as notified instead of deleting
        await BackInStock.updateMany({ productId }, { lastNotifiedAt: new Date() });
      }
    }

    res.json({ success: true, message: "Stock status updated" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

// Register Seller : /api/seller/register
export const registerSeller = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.json({ success: false, message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await Seller.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({ success: true, message: "New Seller Created Successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get All Sellers : /api/seller/list
export const getAllSellers = async (req, res) => {
    try {
        // Exclude the current seller from the list if desired, or show all.
        // For now preventing showing password
        const sellers = await Seller.find({}).select("-password").sort({ createdAt: -1 });
        res.json({ success: true, sellers });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Toggle Seller Status : /api/seller/toggle-status
export const toggleSellerStatus = async (req, res) => {
    try {
        const { targetId } = req.body;
        
         if (targetId === req.body.sellerId) {
             return res.json({ success: false, message: "You cannot change your own status" });
         }

        const seller = await Seller.findById(targetId);
        if (!seller) {
            return res.json({ success: false, message: "Seller not found" });
        }

        seller.isActive = !seller.isActive;
        await seller.save();

        res.json({ success: true, message: `Seller ${seller.isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete Seller : /api/seller/delete
export const deleteSeller = async (req, res) => {
    try {
        const { targetId } = req.body;

        if (targetId === req.body.sellerId) {
            return res.json({ success: false, message: "You cannot delete your own account" });
        }

        const seller = await Seller.findByIdAndDelete(targetId);
        if (!seller) {
            return res.json({ success: false, message: "Seller not found" });
        }

        res.json({ success: true, message: "Seller account deleted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Seller Auth : /api/seller/is-auth

export const isSellerAuth = async (req, res) => {
  try {
    return res.json({ success: true, message: "Seller is authenticated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Seller Logout : /api/seller/logout

export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || process.env.FRONTEND_URL?.includes("https"),
      sameSite: process.env.NODE_ENV === "production" || process.env.FRONTEND_URL?.includes("https") ? "none" : "lax",
      path: "/",
    });
    return res.json({
      success: true,
      message: "Seller logged out successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
