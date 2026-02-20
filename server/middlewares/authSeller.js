import jwt from 'jsonwebtoken';

const authSeller = async (req, res, next) => {
    try {
        const { sellerToken } = req.cookies;

        if (!sellerToken) {
            return res.json({ success: false, message: 'Not Authorized. Login Again.' });
        }

        const token_decode = jwt.verify(sellerToken, process.env.JWT_SECRET);
        if (!req.body) req.body = {};
        req.body.sellerId = token_decode.id;
        req.sellerId = token_decode.id;
        next();

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export default authSeller;