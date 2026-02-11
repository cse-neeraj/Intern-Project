import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { sendEmail } from "../utils/email.js";

//register user

export const register = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }
    
    if (mobile) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        return res.json({ success: false, message: "Mobile number already exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = { name, email, password: hashedPassword };
    if (mobile) {
      userData.mobile = mobile;
    }

    const user = await User.create(userData);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      success: true,
      message: "User registered successfully",
      token,
      user: { email: user.email, name: user.name, mobile: user.mobile },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//login user : /api/user/login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body; // email param can be email or mobile

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and Password are required",
      });
    }
    
    let user;
    if (email.includes('@')) {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ mobile: email });
    }

    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      success: true,
      message: "User logged in successfully",
      token,
      user: { email: user.email, name: user.name, mobile: user.mobile },
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId, name, mobile, email } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    
    if (mobile !== undefined) {
        if (mobile !== user.mobile) {
             const existingUser = await User.findOne({ mobile });
             if (existingUser) {
                 return res.json({ success: false, message: "Mobile number already exists" });
             }
             user.mobile = mobile;
        }
    }

    await user.save();

    return res.json({ success: true, message: "Profile updated successfully", user: { name: user.name, email: user.email, mobile: user.mobile } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Check Auth: /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Authorized", user });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Logout User: /api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    return res.json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { mobile, email } = req.body;

    if (!mobile && !email) {
      return res.json({ success: false, message: "Mobile number or Email is required" });
    }

    let user;

    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        const hashedPassword = await bcrypt.hash(email, 10);
        user = await User.create({
          name: "New User",
          email,
          password: hashedPassword,
        });
      }
    } else {
      const cleanMobile = mobile.replace(/[\s-]/g, '');

      if (!/^\d{10}$/.test(cleanMobile) && !/^\+\d{10,15}$/.test(cleanMobile)) {
        return res.json({ success: false, message: "Invalid mobile number format" });
      }

      let searchMobile = cleanMobile;

      if (cleanMobile.startsWith('+')) {
        // If Indian number with code, strip for DB to match existing 10-digit records
        if (cleanMobile.startsWith('+91') && cleanMobile.length === 13) {
          searchMobile = cleanMobile.slice(3);
        }
      } else {
        searchMobile = cleanMobile;
      }

      user = await User.findOne({ mobile: searchMobile });

      if (!user) {
        const hashedPassword = await bcrypt.hash(searchMobile, 10);
        user = await User.create({
          name: "New User",
          email: `${searchMobile}@buyfresh.com`,
          mobile: searchMobile,
          password: hashedPassword,
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log(`OTP for ${email || user.mobile}: ${otp}`);

    // 1. Try sending OTP via Email if user has a valid registered email
    if (user.email && !user.email.endsWith("@buyfresh.com")) {
      try {
        await sendEmail({
          to: user.email,
          subject: "BuyFresh Login OTP",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #333;">Your Login OTP</h2>
              <p>Use the following OTP to login to your account:</p>
              <h1 style="color: #22c55e; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
              <p style="color: #666; font-size: 12px;">This OTP is valid for 10 minutes.</p>
            </div>
          `
        });
        return res.json({ success: true, message: `OTP sent to registered email: ${user.email}` });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Fallback to response if email fails
      }
    }

    // 2. Fallback: Return OTP in response (Free/Dev Mode)
    // This works for new users (who don't have an email yet) or if email fails
    res.json({ success: true, message: "OTP generated (Dev Mode)", otp });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const loginWithOtp = async (req, res) => {
  try {
    const { mobile, email, otp } = req.body;

    if ((!mobile && !email) || !otp) {
      return res.json({ success: false, message: "Mobile/Email and OTP are required" });
    }

    let user;

    if (email) {
      user = await User.findOne({ email });
    } else {
      const cleanMobile = mobile.replace(/[\s-]/g, '');
      let searchMobile = cleanMobile;
      if (cleanMobile.startsWith('+91') && cleanMobile.length === 13) {
        searchMobile = cleanMobile.slice(3);
      }
      user = await User.findOne({ mobile: searchMobile });
    }

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpire < Date.now()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpire = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      success: true,
      message: "User logged in successfully",
      token,
      user: { email: user.email, name: user.name, mobile: user.mobile },
      isNewUser: user.name === "New User",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
