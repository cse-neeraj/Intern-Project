import express from 'express';
import { subscribeToBackInStock, getUserSubscriptions, unsubscribe, getAllSubscribers } from '../controllers/notifyController.js';
import authSeller from '../middlewares/authSeller.js';

const notifyRouter = express.Router();

notifyRouter.post('/subscribe', subscribeToBackInStock);
notifyRouter.post('/list', getUserSubscriptions);
notifyRouter.post('/remove', unsubscribe);
notifyRouter.get('/all-subscribers', authSeller, getAllSubscribers);

export default notifyRouter;