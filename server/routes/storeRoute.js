import express from 'express';
import { getStoreInfo, updateStoreInfo } from '../controllers/storeController.js';
import authSeller from '../middlewares/authSeller.js';

const storeRouter = express.Router();

storeRouter.get('/info', getStoreInfo);
storeRouter.post('/update', authSeller, updateStoreInfo);

export default storeRouter;