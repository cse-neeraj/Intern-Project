import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/User.js';
import { sendEmail } from '../utils/email.js'; 

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${user._id}/${token}`;

        const html = `<h1>Reset Your Password</h1>
                   <p>Click on the link below to reset your password:</p>
                   <a href="${resetUrl}">${resetUrl}</a>
                   <p>The link will expire in 1 hour.</p>`;

        await sendEmail({ to: email, subject: 'Reset Password', html });

        res.json({ success: true, message: "Reset link sent to your email" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { id, token, newPassword } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.id !== id) {
            return res.json({ success: false, message: "Invalid token" });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: "Password reset successfully" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};