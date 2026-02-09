import express from 'express';
import { getUserNotifications, markRead, sendNotification, sendNotificationToAll, getAllNotifications, deleteNotification, deleteManyNotifications, clearAllNotifications } from '../controllers/notificationController.js';
import authUser from '../middlewares/authUser.js';
import authSeller from '../middlewares/authSeller.js';

const notificationRouter = express.Router();

notificationRouter.post('/user', authUser, getUserNotifications);
notificationRouter.post('/read', authUser, markRead);
notificationRouter.post('/clear-all', authUser, clearAllNotifications);
notificationRouter.post('/send', authSeller, sendNotification);
notificationRouter.post('/send-all', authSeller, sendNotificationToAll);
notificationRouter.get('/all', authSeller, getAllNotifications);
notificationRouter.post('/delete', authSeller, deleteNotification);
notificationRouter.post('/delete-many', authSeller, deleteManyNotifications);

export default notificationRouter;
