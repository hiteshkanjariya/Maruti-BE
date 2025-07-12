const Complaint = require("../models/Complaint");

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


// Get all complaints (admin or user can see their own)
exports.getComplaints = async (req, res) => {
    try {
        let query = {};

        // If the user is not admin, only return complaints they created
        if (req.user.role !== 'admin') {
            query.createdBy = req.user._id;
        }

        const complaints = await Complaint.find(query)
            .populate('createdBy', 'name phone') // optional
            .sort({ createdAt: -1 });

        res.status(200).json({ data: complaints });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('createdBy', 'name phone');

        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        // Only allow non-admin to access their own complaint
        if (req.user.role !== 'admin' && complaint.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.status(200).json({ complaint });
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
        if (req.user.role !== 'admin' && existingComplaint.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

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
