import notificationModel from "../models/notificationModel.js";
import User from "../models/User.js";

// Fetch user notifications
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.body;
        const notifications = await notificationModel.find({ userId }).sort({ date: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Mark all notifications as read
const markRead = async (req, res) => {
    try {
        const { userId } = req.body;
        await notificationModel.updateMany({ userId }, { isRead: true });
        res.json({ success: true, message: "Notifications marked as read" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Helper function to create a notification
const createNotification = async (userId, title, message, type = 'general') => {
    try {
        const notification = new notificationModel({
            userId,
            title,
            message,
            type
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.log(error);
    }
}

// Send notification (Seller/Admin)
const sendNotification = async (req, res) => {
    try {
        const { email, title, message, type } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        const notification = await createNotification(user._id.toString(), title, message, type);
        if (notification) {
            const io = req.app.get('io');
            io.to(user._id.toString()).emit('new_notification', notification);
        }
        res.json({ success: true, message: "Notification sent successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const sendNotificationToAll = async (req, res) => {
    try {
        const { title, message, type } = req.body;
        const users = await User.find({});
        if (!users || users.length === 0) {
            return res.json({ success: false, message: "No users found" });
        }
        const io = req.app.get('io');
        const notificationDocs = users.map(user => ({ userId: user._id, title, message, type }));
        const createdNotifications = await notificationModel.insertMany(notificationDocs);
        createdNotifications.forEach(notification => {
            io.to(notification.userId.toString()).emit('new_notification', notification);
        });
        res.json({ success: true, message: `Notification sent to ${users.length} users.` });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Get all notifications (Seller/Admin)
const getAllNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const skip = (page - 1) * limit;

        let query = {};
        if (search) {
            const users = await User.find({ email: { $regex: search, $options: 'i' } }).select('_id');
            const userIds = users.map(u => u._id.toString());
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { message: { $regex: search, $options: 'i' } },
                    { userId: { $in: userIds } }
                ]
            };
        }

        const notifications = await notificationModel.find(query).sort({ date: -1 }).skip(skip).limit(limit).populate('userId', 'email');
        const totalNotifications = await notificationModel.countDocuments(query);

        res.json({
            success: true,
            notifications,
            totalPages: Math.ceil(totalNotifications / limit),
            currentPage: page
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete notification (Seller/Admin)
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.body;
        await notificationModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Notification deleted" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Delete multiple notifications (Seller/Admin)
const deleteManyNotifications = async (req, res) => {
    try {
        const { ids } = req.body;
        await notificationModel.deleteMany({ _id: { $in: ids } });
        res.json({ success: true, message: "Notifications deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Clear all notifications for a user
const clearAllNotifications = async (req, res) => {
    try {
        const { userId } = req.body;
        await notificationModel.deleteMany({ userId });
        res.json({ success: true, message: "All notifications cleared" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { getUserNotifications, markRead, createNotification, sendNotification, sendNotificationToAll, getAllNotifications, deleteNotification, deleteManyNotifications, clearAllNotifications };
