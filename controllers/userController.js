const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.addUser = async (req, res, next) => {
    const { name, phone, password, role } = req.body;

    if (!name || !phone || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const exists = await User.findOne({ phone });
        if (exists) {
            return res.status(400).json({ message: 'User already exists with this phone number' });
        }

        const newUser = new User({ name, phone, password, role, createdBy: req.user._id });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error adding user:', error);
        next();
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, phone, password, role } = req.body;

    if (!name || !phone || !role) {
        return res.status(400).json({ message: 'Name, phone, and role are required' });
    }

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = name;
        user.phone = phone;
        user.role = role;

        if (password) {
            user.password = password;
        }

        await user.save();
        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password from response
        res.status(200).json({ data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndDelete(id);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error while deleting user' });
    }
};
