import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
  voucherNumber: { type: String, unique: true, index: true },
  voucherDate: { type: Date, required: true, default: Date.now },
  expenseDate: { type: Date, required: true },
  department: { type: String, required: true, trim: true },
  expenseTitle: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  amount: { type: Number, required: true, min: [0.01, 'Amount must be greater than zero'] },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  employeeName: { type: String, required: true },
  employeeId: { type: String, default: '' },
  employeeSignature: { type: String, default: '' },
  directorSignature: { type: String, default: '' },
  status: { type: String, enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'], default: 'DRAFT', index: true },
  approvalDate: { type: Date, default: null },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rejectionReason: { type: String, default: '' }
}, { timestamps: true });

voucherSchema.pre('validate', async function () {
  if (!this.voucherNumber) {
    const count = await mongoose.model('Voucher').countDocuments();
    this.voucherNumber = `EV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
});
export default mongoose.model('Voucher', voucherSchema);
