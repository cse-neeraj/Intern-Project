import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    if (req.originalUrl.includes("/logout")) {
      return next();
    }

    let token = req.cookies?.token;

    // Fallback: Check Authorization header (Bearer token)
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    console.log("Token:", token ? "Found" : "Missing");

    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", tokenDecode);
    if (tokenDecode.id) {
      req.body = req.body || {};
      req.body.userId = tokenDecode.id;
    } else {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default authUser;
