const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User');
dotenv.config();
const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Auth token missing' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ message: 'User not found' });

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};

module.exports = { auth, adminOnly };
