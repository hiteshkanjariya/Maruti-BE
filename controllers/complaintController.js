const Complaint = require("../models/Complaint");
const User = require("../models/User");

exports.createComplaint = async (req, res) => {
    try {
        const complaint = new Complaint({
            ...req.body,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        await complaint.save();
        res.status(201).json({ message: 'Complaint created successfully', complaint });
    } catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Get ALL complaints (admin only)
exports.getAllComplaints = async (req, res) => {
    try {
        const role = req.user.role;

        let complaints = await Complaint.find()
            .populate('createdBy', 'name phone')
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 })
            .lean(); // Use lean() so we can easily add custom keys

        // Add canAssign key
        complaints = complaints.map(c => ({
            ...c,
            canAssign: role === 'admin' // true if admin, false otherwise
        }));

        res.status(200).json({ data: complaints });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get MY complaints
exports.getMyComplaints = async (req, res) => {
    try {
        const role = req.user.role;

        let complaints = await Complaint.find({ assignedTo: req.user._id })
            .populate('createdBy', 'name phone')
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 })
            .lean(); // Use lean() so we can easily add custom keys

        // Add canAssign key
        complaints = complaints.map(c => ({
            ...c,
            canAssign: role === 'admin' // true if admin, false otherwise
        }));

        res.status(200).json({ data: complaints });
    } catch (error) {
        console.error('Error fetching my complaints:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('updatedBy', 'name')
            .populate('assignedTo', 'name phone')

        console.log("🚀 ~ exports.getComplaintById= ~ complaint:", complaint)
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // Only allow non-admin to access their own complaint
        // if (req.user.role !== 'admin' && complaint.createdBy._id.toString() !== req.user._id.toString()) {
        //     return res.status(403).json({ message: 'Unauthorized' });
        // }

        res.status(200).json({ data: complaint });
    } catch (error) {
        console.error('Error fetching complaint by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update complaint
exports.updateComplaint = async (req, res) => {
    try {
        const complaintId = req.params.id;

        const existingComplaint = await Complaint.findById(complaintId);
        if (!existingComplaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // If not admin, allow only creator to update
        // if (req.user.role !== 'admin' && existingComplaint.createdBy.toString() !== req.user._id.toString()) {
        //     return res.status(403).json({ message: 'Unauthorized' });
        // }

        // Merge updated fields (all optional)
        Object.assign(existingComplaint, req.body);
        existingComplaint.updatedBy = req.user._id; // track updater

        const updatedComplaint = await existingComplaint.save();
        res.status(200).json({ message: 'Complaint updated', complaint: updatedComplaint });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Delete complaint
exports.deleteComplaint = async (req, res) => {
    try {
        const complaintId = req.params.id;

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Only admin or creator can delete
        if (req.user.role !== 'admin' && complaint.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Complaint.findByIdAndDelete(complaintId);
        res.status(200).json({ message: 'Complaint deleted' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: Date.now() },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.updatePaymentDetails = async (req, res) => {
    try {
        const { amount, status, method, notes } = req.body;

        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // Optional: Authorization check
        if (req.user.role !== 'admin' && complaint.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update payment fields only
        if (amount !== undefined) complaint.payment.amount = amount;
        if (status) complaint.payment.status = status;
        if (method) complaint.payment.method = method;
        if (notes !== undefined) complaint.payment.notes = notes;

        complaint.updatedBy = req.user._id;
        await complaint.save();

        res.status(200).json({ message: 'Payment details updated successfully', data: complaint });
    } catch (error) {
        console.error('Error updating payment details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.assignComplaint = async (req, res) => {
    try {
        const { userId } = req.body; // technician id
        const complaintId = req.params.id;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can assign complaints' });
        }

        // Check if complaint exists
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        complaint.assignedTo = userId;
        complaint.updatedBy = req.user._id;
        await complaint.save();

        res.status(200).json({
            message: 'Complaint assigned successfully',
            complaint
        });
    } catch (error) {
        console.error('Assign complaint error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
