import express from "express";
import {
  isSellerAuth,
  sellerLogin,
  sellerLogout,
  updateStock,
  updateProductFeatures,
  toggleProductStock,
} from "../controllers/sellerController.js";
import authSeller from "../middlewares/authSeller.js";

const sellerRouter = express.Router();

sellerRouter.post("/login", sellerLogin);
sellerRouter.get("/is-auth", authSeller, isSellerAuth);
sellerRouter.post("/logout", sellerLogout);
sellerRouter.post("/update-stock", authSeller, updateStock);
sellerRouter.post("/update-product-features", authSeller, updateProductFeatures);
sellerRouter.post("/toggle-stock", authSeller, toggleProductStock);


export default sellerRouter;
