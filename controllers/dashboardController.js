const User = require('../models/User');
const Complaint = require('../models/Complaint');

exports.getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalComplaints, openComplaints, paidAgg, unpaidAgg] = await Promise.all([
            User.countDocuments(),
            Complaint.countDocuments(),
            Complaint.countDocuments({ status: 'open' }),
            Complaint.aggregate([
                { $match: { 'payment.status': 'paid' } },
                { $group: { _id: null, total: { $sum: "$payment.amount" } } }
            ]),
            Complaint.aggregate([
                { $match: { 'payment.status': 'unpaid' } },
                { $group: { _id: null, total: { $sum: "$payment.amount" } } }
            ])
        ]);

        const totalRevenue = paidAgg.length > 0 ? paidAgg[0].total : 0;
        const pendingPayments = unpaidAgg.length > 0 ? unpaidAgg[0].total : 0;

        res.status(200).json({
            totalUsers,
            totalComplaints,
            openComplaints,
            totalRevenue,
            pendingPayments
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
