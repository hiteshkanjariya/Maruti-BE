const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require("../models/User");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_PHONE = process.env.ADMIN_PHONE;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "admin";

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');

        // Remove any existing admin
        await User.deleteMany({ role: 'admin' });

        // Create admin from .env
        const adminUser = new User({
            phone: ADMIN_PHONE,
            password: ADMIN_PASSWORD, // Will be hashed by pre('save')
            role: 'admin',
            name: ADMIN_NAME
        });

        await adminUser.save();

        console.log(`✅ Admin created: ${ADMIN_PHONE}`);
        process.exit();
    } catch (err) {
        console.error('❌ Seeding error:', err.message);
        process.exit(1);
    }
};

seedAdmin();

// seeder.js
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const User = require("../models/User");

// dotenv.config();
// const MONGO_URI = process.env.MONGO_URI;

// const seedUsers = async () => {
//     try {
//         await mongoose.connect(MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });

//         console.log('✅ Connected to MongoDB');

//         const seedData = [
//             { phone: '1234567890', password: 'admin123', role: 'admin', name: 'admin' },
//             { phone: '1234567891', password: 'user123', role: 'user', name: 'user' }
//         ];

//         for (const data of seedData) {
//             let user = await User.findOne({ phone: data.phone });
//             if (user) {
//                 // Update existing user password and other fields
//                 user.password = data.password; // Will be hashed by pre('save')
//                 user.role = data.role;
//                 user.name = data.name;
//                 await user.save();
//                 console.log(`🔄 Updated user: ${data.phone}`);
//             } else {
//                 // Create a new user
//                 const newUser = new User(data);
//                 await newUser.save();
//                 console.log(`✨ Created user: ${data.phone}`);
//             }
//         }

//         console.log('✅ Users seeded/updated successfully');
//         process.exit();
//     } catch (err) {
//         console.error('❌ Seeding error:', err.message);
//         process.exit(1);
//     }
// };

// seedUsers();
