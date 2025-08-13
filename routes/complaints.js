const express = require('express');
const { auth } = require('../middlewares/auth');
const { createComplaint, getComplaintById, updateComplaint, deleteComplaint, updatePaymentDetails, assignComplaint, getAllComplaints, getMyComplaints } = require('../controllers/complaintController');
const router = express.Router();

router.post('/', auth, createComplaint);
router.get('/', auth, getAllComplaints);
router.get('/my', auth, getMyComplaints);
router.get('/:id', auth, getComplaintById);
router.put('/:id', auth, updateComplaint);  // ✅ Update
router.delete('/:id', auth, deleteComplaint); // ✅ Delete
router.put('/:id/payment', auth, updatePaymentDetails);
router.put('/:id/assign', auth, assignComplaint);


module.exports = router;
