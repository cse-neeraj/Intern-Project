import express from 'express';
import { addCategory, listCategories, removeCategory, updateCategory } from '../controllers/categoryController.js';
import { upload } from '../configs/multer.js';
import authSeller from '../middlewares/authSeller.js';

const categoryRouter = express.Router();

categoryRouter.post('/add', upload.single('image'), addCategory);
categoryRouter.get('/list', listCategories);
categoryRouter.post('/remove', authSeller, removeCategory);
categoryRouter.post('/update', upload.single('image'), updateCategory);

export default categoryRouter;
