import express from 'express';
import { getBanners, addBanner, updateBanner, deleteBanner } from '../controllers/bannerController.js';
import { upload } from '../configs/multer.js'; 
import authSeller from '../middlewares/authSeller.js'; 

const bannerRouter = express.Router();

bannerRouter.get('/', getBanners);
bannerRouter.post('/add', upload.single('image'), authSeller, addBanner);
bannerRouter.post('/update', upload.single('image'), authSeller, updateBanner);
bannerRouter.delete('/delete/:id', authSeller, deleteBanner);

export default bannerRouter;
