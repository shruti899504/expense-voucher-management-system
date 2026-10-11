import { Router } from 'express';
import Voucher from '../models/Voucher.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.use(protect);
const directorOrAccounts = ['DIRECTOR', 'ACCOUNTS'];

function filePath(file) { return file ? `/uploads/${file.filename}` : undefined; }
function buildFilters(query) {
  const f = {};
  if (query.status) f.status = query.status;
  if (query.department) f.department = new RegExp(query.department, 'i');
  if (query.category) f.category = new RegExp(query.category, 'i');
  if (query.from || query.to) {
    f.expenseDate = {};
    if (query.from) f.expenseDate.$gte = new Date(query.from);
    if (query.to) { const end = new Date(query.to); end.setHours(23,59,59,999); f.expenseDate.$lte = end; }
  }
  if (query.minAmount || query.maxAmount) {
    f.amount = {};
    if (query.minAmount !== undefined && query.minAmount !== '') f.amount.$gte = Number(query.minAmount);
    if (query.maxAmount !== undefined && query.maxAmount !== '') f.amount.$lte = Number(query.maxAmount);
  }
  if (query.search) {
    const s = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    f.$or = [{ voucherNumber: new RegExp(s, 'i') }, { employeeName: new RegExp(s, 'i') }, { expenseTitle: new RegExp(s, 'i') }];
  }
  return f;
}
router.get('/', async (req, res, next) => {
  try {
    const filters = buildFilters(req.query);
    if (req.user.role === 'EMPLOYEE') filters.employee = req.user._id;
    const sort = req.query.sort === 'amount' ? { amount: 1 } : req.query.sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const vouchers = await Voucher.find(filters).sort(sort).populate('employee', 'name email department employeeId');
    res.json({ vouchers });
  } catch (e) { next(e); }
});
router.post('/', allowRoles('EMPLOYEE'), async (req, res, next) => {
  try {
    const { expenseDate, department, expenseTitle, category, description = '', amount, voucherDate } = req.body;
    if (!department?.trim() || !expenseTitle?.trim() || !expenseDate || !category?.trim() || amount === '' || amount === undefined || Number(amount) <= 0 || !Number.isFinite(Number(amount))) {
      return res.status(400).json({ message: 'Department, expense title, category, expense date, and a positive amount are required.' });
    }
    const voucher = await Voucher.create({
      voucherDate: voucherDate || new Date(), expenseDate, department, expenseTitle, category, description, amount: Number(amount),
      employee: req.user._id, employeeName: req.user.name, employeeId: req.user.employeeId || '', status: 'DRAFT'
    });
    res.status(201).json({ voucher });
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate('employee', 'name email department employeeId');
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    if (req.user.role === 'EMPLOYEE' && String(voucher.employee._id) !== String(req.user._id)) return res.status(403).json({ message: 'You cannot view another employee’s voucher.' });
    res.json({ voucher });
  } catch (e) { next(e); }
});
router.put('/:id', allowRoles('EMPLOYEE'), async (req, res, next) => {
  try {
    const voucher = await Voucher.findOne({ _id: req.params.id, employee: req.user._id });
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    if (voucher.status !== 'DRAFT') return res.status(400).json({ message: 'Only draft vouchers can be edited.' });
    const allowed = ['voucherDate', 'expenseDate', 'department', 'expenseTitle', 'category', 'description', 'amount'];
    for (const key of allowed) if (req.body[key] !== undefined) voucher[key] = key === 'amount' ? Number(req.body[key]) : req.body[key];
    if (!voucher.department?.trim() || !voucher.expenseTitle?.trim() || !voucher.category?.trim() || !voucher.expenseDate || !Number.isFinite(voucher.amount) || voucher.amount <= 0) {
      return res.status(400).json({ message: 'Please provide all required fields and an amount greater than zero.' });
    }
    await voucher.save();
    res.json({ voucher });
  } catch (e) { next(e); }
});
router.delete('/:id', allowRoles('EMPLOYEE'), async (req, res, next) => {
  try {
    const voucher = await Voucher.findOne({ _id: req.params.id, employee: req.user._id });
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    if (voucher.status !== 'DRAFT') return res.status(400).json({ message: 'Only draft vouchers can be deleted.' });
    await voucher.deleteOne();
    res.json({ message: 'Draft voucher deleted.' });
  } catch (e) { next(e); }
});
router.post('/:id/submit', allowRoles('EMPLOYEE'), upload.single('employeeSignature'), async (req, res, next) => {
  try {
    const voucher = await Voucher.findOne({ _id: req.params.id, employee: req.user._id });
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    if (voucher.status !== 'DRAFT') return res.status(400).json({ message: 'Only draft vouchers can be submitted.' });
    const signature = filePath(req.file) || voucher.employeeSignature;
    if (!signature) return res.status(400).json({ message: 'Employee signature is required before submission.' });
    voucher.employeeSignature = signature;
    voucher.status = 'PENDING_APPROVAL';
    await voucher.save();
    res.json({ voucher, message: 'Voucher submitted for approval.' });
  } catch (e) { next(e); }
});
router.post('/:id/approve', allowRoles('DIRECTOR'), upload.single('directorSignature'), async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    if (voucher.status !== 'PENDING_APPROVAL') return res.status(400).json({ message: 'Only pending vouchers can be approved.' });
    if (!req.file) return res.status(400).json({ message: 'Director signature is required for approval.' });
    voucher.directorSignature = filePath(req.file);
    voucher.status = 'APPROVED';
    voucher.approvalDate = new Date();
    voucher.approvedBy = req.user._id;
    await voucher.save();
    res.json({ voucher, message: 'Voucher approved.' });
  } catch (e) { next(e); }
});
router.post('/:id/reject', allowRoles('DIRECTOR'), async (req, res, next) => {
  try {
    const reason = (req.body.reason || '').trim();
    if (!reason) return res.status(400).json({ message: 'Rejection reason is required.' });
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found.' });
    if (voucher.status !== 'PENDING_APPROVAL') return res.status(400).json({ message: 'Only pending vouchers can be rejected.' });
    voucher.status = 'REJECTED';
    voucher.rejectionReason = reason;
    voucher.rejectedBy = req.user._id;
    await voucher.save();
    res.json({ voucher, message: 'Voucher rejected.' });
  } catch (e) { next(e); }
});
export default router;
