import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Notice from '../components/Notice';

export default function Login() {
  const { login } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e) { e.preventDefault(); setError(''); setBusy(true); try { await login(form); navigate('/dashboard'); } catch (err) { setError(err.response?.data?.message || 'Unable to log in. Check the backend connection.'); } finally { setBusy(false); } }
  return <div className="auth-page"><div className="auth-art"><div className="auth-art-brand"><Wallet size={23}/> VoucherFlow</div><div className="art-copy"><span className="eyebrow">EXPENSES, MADE CLEAR</span><h1>A simpler way to manage every expense.</h1><p>From voucher submission to final approval, keep every step organized in one place.</p><div className="art-stat-row"><div><b>One workspace</b><small>Every voucher in view</small></div><div><b>Clear workflow</b><small>Know what happens next</small></div></div></div><div className="art-footer"><ShieldCheck size={17}/> A secure workspace for your team</div></div>
  <div className="auth-panel"><div className="auth-form-wrap"><div className="mobile-brand"><Wallet size={21}/> VoucherFlow</div><span className="eyebrow">WELCOME BACK</span><h2>Sign in to your account</h2><p className="muted">Enter your work credentials to continue.</p><Notice>{error}</Notice><form onSubmit={submit} className="form-stack"><label>Work email<input type="email" required autoComplete="username" placeholder="you@company.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Password<input type="password" required autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><button className="btn btn-primary btn-full" disabled={busy}>{busy?'Signing in…':'Sign in'} <ArrowRight size={17}/></button></form><p className="auth-switch">New employee? <Link to="/register">Create an account</Link></p><div className="auth-help">Access is based on your assigned role.</div></div></div></div>;
}
