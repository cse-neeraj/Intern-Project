import express from "express";
import {
  isSellerAuth,
  sellerLogin,
  registerSeller,
  getAllSellers,
  toggleSellerStatus,
  deleteSeller,
  sellerLogout,
  updateStock,
  updateProductFeatures,
  toggleProductStock,
  getStockHistory,
} from "../controllers/sellerController.js";
import authSeller from "../middlewares/authSeller.js";

const sellerRouter = express.Router();

sellerRouter.post("/login", sellerLogin);
sellerRouter.post("/register", authSeller, registerSeller);
sellerRouter.get("/list", authSeller, getAllSellers);
sellerRouter.post("/toggle-status", authSeller, toggleSellerStatus);
sellerRouter.post("/delete", authSeller, deleteSeller);
sellerRouter.get("/is-auth", authSeller, isSellerAuth);
sellerRouter.post("/logout", sellerLogout);
sellerRouter.post("/update-stock", authSeller, updateStock);
sellerRouter.post("/update-product-features", authSeller, updateProductFeatures);
sellerRouter.post("/toggle-stock", authSeller, toggleProductStock);
sellerRouter.get("/stock-history", authSeller, getStockHistory);


export default sellerRouter;
