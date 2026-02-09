import express from 'express';
import { subscribe, listSubscribers, sendOffer } from '../controllers/newsletterController.js';
import authSeller from '../middlewares/authSeller.js';

const newsletterRouter = express.Router();

newsletterRouter.post('/subscribe', subscribe);
newsletterRouter.get('/list', authSeller, listSubscribers);
newsletterRouter.post('/send-offer', authSeller, sendOffer);

export default newsletterRouter;