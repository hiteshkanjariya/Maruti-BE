// seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require("../models/User")
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Remove existing users
        await User.deleteMany();

        // Create and save users (pre-save hook will hash passwords)
        const users = [
            new User({ phone: '1234567890', password: 'admin123', role: 'admin', name: 'admin' }),
            new User({ phone: '1234567891', password: 'user123', role: 'user', name: 'user' }),
        ];

        for (const user of users) {
            await user.save(); // Triggers pre('save') hook
        }

        console.log('✅ Users seeded successfully');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding error:', err.message);
        process.exit(1);
    }
};

seedUsers();
