import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
function makeToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'development_only_change_me', { expiresIn: '8h' });
}
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, employeeId: user.employeeId, department: user.department };
}
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, employeeId = '', department = '' } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name, email, password, employeeId, department, role: 'EMPLOYEE' });
    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (e) { next(e); }
});
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password || ''))) return res.status(401).json({ message: 'Invalid email or password.' });
    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch (e) { next(e); }
});
router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
