const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: String,
    description: String,

    customerName: String,
    customerPhone: String,
    customerAddress: String,

    acType: String,
    acBrand: String,
    acModel: String,
    acSerialNumber: String,

    serviceType: { type: String, enum: ['repair', 'maintenance', 'installation'] },
    priority: { type: String, enum: ['low', 'medium', 'high'] },
    status: { type: String, enum: ['open', 'in_progress', 'closed', 'done'], default: 'open' }, // ✅ Add this

    payment: {
        amount: { type: Number, default: 0 },
        status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
        method: { type: String, enum: ['cash', 'online', 'upi'], default: 'cash' },
        notes: { type: String }
    },

    technicianNotes: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 🆕 assigned user

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
