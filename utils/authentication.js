const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {

    const accessToken = req.headers["x-api-key"];
    if (accessToken) {
        try {
            const { userId, exp } = jwt.verify(accessToken, process.env.JWT_SECRET)
            
            if (exp < Date.now().valueOf() / 1000) {
                res.json({ status: 199, message: "JWT token has expired, please login to obtain a new one" });
                return
            }
            const user = await User.findById(userId);
            if (!user) {
                throw new Error()
            }
            req.user = user
            req.token = accessToken
            next()
        } catch (error) {
            res.json({ status: 199, message: 'Invalid Api key' });
        }
    } else {
        res.json({ message: 'API key missing', status: 199 });
    }
}
module.exports = auth
