import jwt from "jsonwebtoken";
import productModel from "../models/Product.js";
import BackInStock from "../models/BackInStock.js";
import { getBackInStockEmailTemplate } from "./emailTemplates.js";
import { sendEmail } from "../utils/email.js";

// login seller : /api/seller/login

export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      password === process.env.SELLER_PASSWORD &&
      email === process.env.SELLER_EMAIL
    ) {
      const token = jwt.sign({ id: email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return res.json({
        success: true,
        message: "Seller logged in successfully",
        seller: { email },
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

      const product = await productModel.findById(productId);
      if (!product) {
          return res.json({ success: false, message: "Product not found" });
      }

      product.quantity = Number(stock);
      await product.save();

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
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
