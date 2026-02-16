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
    
    // Fallback: Check 'token' header
    if (!token && req.headers.token) {
      token = req.headers.token;
    }

    console.log("Auth Middleware - Headers:", req.headers);
    console.log("Auth Middleware - Token:", token);

    if (!token) {
      console.log("Auth Middleware - No token found");
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.body = req.body || {};
      req.body.userId = tokenDecode.id;
      req.userId = tokenDecode.id; // Also attach to req directly to avoid body parsing issues
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
