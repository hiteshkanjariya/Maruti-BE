const express = require('express');
const router = express.Router();
const { addUser, updateUser, getAllUsers, deleteUser } = require('../controllers/userController');
const { auth, adminOnly } = require('../middlewares/auth');

// Add new user (Admin only)
router.post('/', auth, adminOnly, addUser);
router.get('/', auth, adminOnly, getAllUsers);
router.delete('/:id', deleteUser);


// Update existing user (Admin only)
router.put('/:id', auth, adminOnly, updateUser);

module.exports = router;