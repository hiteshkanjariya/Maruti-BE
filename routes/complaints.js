const express = require('express');
const { auth } = require('../middlewares/auth');
const { createComplaint, getComplaints, getComplaintById, updateComplaint, deleteComplaint } = require('../controllers/complaintController');
const router = express.Router();

router.post('/', auth, createComplaint);
router.get('/', auth, getComplaints);
router.get('/:id', auth, getComplaintById);
router.put('/:id', auth, updateComplaint);  // ✅ Update
router.delete('/:id', auth, deleteComplaint); // ✅ Delete


module.exports = router;
