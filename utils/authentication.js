const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {

    const accessToken = req.headers["x-api-key"];
    if (accessToken) {
        const { userId } = jwt.verify(accessToken, process.env.JWT_SECRET)
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error()
            }
            req.user = user
            req.token = accessToken
            next()
        } catch (error) {
            res.json({ status: 199, message: 'Not authorized to access this resource' });
        }
    } else {
        res.json({ message: 'Invalid Api key', status: 199 });
    }
}
module.exports = auth
