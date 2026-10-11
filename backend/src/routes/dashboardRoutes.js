import { Router } from 'express';
import Voucher from '../models/Voucher.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', protect, async (req, res, next) => {
  try {
    const scope = req.user.role === 'EMPLOYEE' ? { employee: req.user._id } : {};
    const all = await Voucher.find(scope).sort({ createdAt: -1 }).limit(8);
    const count = async (status) => Voucher.countDocuments({ ...scope, status });
    const [total, drafts, pending, approved, rejected, amountAgg, approvedToday, rejectedToday, pendingAmount, approvedAmount] = await Promise.all([
      Voucher.countDocuments(scope), count('DRAFT'), count('PENDING_APPROVAL'), count('APPROVED'), count('REJECTED'),
      Voucher.aggregate([{ $match: scope.employee ? { employee: scope.employee } : {} }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Voucher.countDocuments({ status: 'APPROVED', approvalDate: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      Voucher.countDocuments({ status: 'REJECTED', updatedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      Voucher.aggregate([{ $match: { status: 'PENDING_APPROVAL' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Voucher.aggregate([{ $match: { status: 'APPROVED' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
    ]);
    res.json({
      stats: {
        total, drafts, pending, approved, rejected,
        totalClaimed: amountAgg[0]?.total || 0,
        approvedToday, rejectedToday,
        pendingAmount: pendingAmount[0]?.total || 0,
        approvedAmount: approvedAmount[0]?.total || 0
      },
      recent: all
    });
  } catch (e) { next(e); }
});
export default router;
