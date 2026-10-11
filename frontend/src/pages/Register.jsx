import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Notice from '../components/Notice';

export default function Register() {
  const { register } = useAuth(); const navigate = useNavigate();
  const [form,setForm]=useState({name:'',email:'',password:'',employeeId:'',department:''}); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e){e.preventDefault();setError('');setBusy(true);try{await register(form);navigate('/dashboard');}catch(err){setError(err.response?.data?.message||'Could not create account.');}finally{setBusy(false);}}
  return <div className="simple-auth"><div className="simple-auth-card"><div className="auth-logo"><Wallet/> VoucherFlow</div><span className="eyebrow">EMPLOYEE REGISTRATION</span><h2>Create your account</h2><p className="muted">Register to create and track your expense vouchers.</p><Notice>{error}</Notice><form onSubmit={submit} className="form-stack"><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name"/></label><label>Work email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@company.com"/></label><div className="form-grid"><label>Employee ID <span className="optional">(optional)</span><input value={form.employeeId} onChange={e=>setForm({...form,employeeId:e.target.value})} placeholder="EMP001"/></label><label>Department<input required value={form.department} onChange={e=>setForm({...form,department:e.target.value})} placeholder="e.g. Technology"/></label></div><label>Password<input type="password" minLength="8" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 8 characters"/></label><button className="btn btn-primary btn-full" disabled={busy}>{busy?'Creating account…':'Create employee account'} <ArrowRight size={17}/></button></form><p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p><p className="tiny-note">Registration creates an Employee account. Director and Accounts access is assigned by an administrator.</p></div></div>;
}
