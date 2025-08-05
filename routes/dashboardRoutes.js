const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middlewares/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

// Dashboard summary stats
router.get('/', auth, adminOnly, getDashboardStats);

module.exports = router;
