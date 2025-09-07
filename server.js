const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoute = require("./routes/userRoutes");
const complainRoutes = require("./routes/complaints")
const dashboardRoutes = require("./routes/dashboardRoutes")
const errorHandler = require('./middlewares/errorMiddleware');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root route for health check
app.get('/', (req, res) => {
    res.json({ 
        message: 'Maruti BE API is running!', 
        status: 'success',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoute);
app.use('/api/complaint', complainRoutes);
app.use('/api/dashboard', dashboardRoutes);

// // Catch-all route for debugging
// app.use('*', (req, res) => {
//     res.status(404).json({
//         error: 'Route not found',
//         method: req.method,
//         path: req.originalUrl,
//         availableRoutes: [
//             'GET /',
//             'POST /api/auth/login',
//             'GET /api/user/*',
//             'GET /api/complaint/*',
//             'GET /api/dashboard/*'
//         ]
//     });
// });

// Error handler middleware should be after all routes
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
}).catch(err => console.error('MongoDB error:', err));