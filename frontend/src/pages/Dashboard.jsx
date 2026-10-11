import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock3, CheckCircle2, XCircle, FileText, IndianRupee, Plus, ArrowRight, Wallet } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Notice from '../components/Notice';

const money = n => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(n||0);
const date = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
export default function Dashboard(){
  const {user}=useAuth(); const [data,setData]=useState(null); const [error,setError]=useState('');
  useEffect(()=>{api.get('/dashboard').then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message||'Could not load dashboard.'));},[]);
  const s=data?.stats||{}; const employee=user?.role==='EMPLOYEE'; const director=user?.role==='DIRECTOR';
  const cards=employee?[
    {label:'Total vouchers',value:s.total||0,icon:FileText,tone:'blue'},
    {label:'Pending approval',value:s.pending||0,icon:Clock3,tone:'amber'},
    {label:'Approved',value:s.approved||0,icon:CheckCircle2,tone:'green'},
    {label:'Rejected',value:s.rejected||0,icon:XCircle,tone:'red'}
  ]:director?[
    {label:'Pending approval',value:s.pending||0,icon:Clock3,tone:'amber'},
    {label:'Approved today',value:s.approvedToday||0,icon:CheckCircle2,tone:'green'},
    {label:'Rejected today',value:s.rejectedToday||0,icon:XCircle,tone:'red'},
    {label:'Total pending amount',value:money(s.pendingAmount),icon:IndianRupee,tone:'blue'}
  ]:[
    {label:'Total vouchers',value:s.total||0,icon:FileText,tone:'blue'},
    {label:'Pending approval',value:s.pending||0,icon:Clock3,tone:'amber'},
    {label:'Approved',value:s.approved||0,icon:CheckCircle2,tone:'green'},
    {label:'Rejected',value:s.rejected||0,icon:XCircle,tone:'red'}
  ];
  return <><div className="page-heading"><div><span className="eyebrow">{director?'APPROVAL OVERVIEW':employee?'YOUR WORKSPACE':'REIMBURSEMENT OVERVIEW'}</span><h1>{director?'Director dashboard':employee?`Good to see you, ${user?.name?.split(' ')[0]}`:'Accounts dashboard'}</h1><p className="muted">{director?'Review requests and keep approvals moving.':employee?'Create an expense voucher or check the status of your claims.':'Monitor voucher activity and approved expense claims.'}</p></div>{employee&&<Link className="btn btn-primary" to="/vouchers/new"><Plus size={17}/> New voucher</Link>}</div>
  <Notice>{error}</Notice>
  <div className="stats-grid">{cards.map(c=><div className="stat-card" key={c.label}><div className={`stat-icon tone-${c.tone}`}><c.icon size={20}/></div><span className="stat-label">{c.label}</span><strong className="stat-value">{data?c.value:'—'}</strong><span className="stat-foot">{director&&c.label==='Pending approval'?'Needs your attention':employee&&c.label==='Pending approval'?'Awaiting Director review':c.label==='Approved'?'Successfully approved':'Current overview'}</span></div>)}</div>
  <div className="overview-grid"><div className="panel recent-panel"><div className="panel-heading"><div><h3>{employee?'Your recent vouchers':director?'Recent voucher activity':'Recently updated vouchers'}</h3><p>Latest records in your workspace</p></div><Link to="/vouchers" className="text-link">View all <ArrowUpRight size={15}/></Link></div>
  {!data?<div className="empty-state">Loading vouchers…</div>:data.recent.length===0?<div className="empty-state"><div className="empty-icon"><FileText size={23}/></div><b>No vouchers yet</b><p>New voucher records will appear here.</p>{employee&&<Link to="/vouchers/new" className="btn btn-secondary">Create your first voucher</Link>}</div>:<div className="table-wrap"><table><thead><tr><th>VOUCHER</th><th>EXPENSE</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th><th></th></tr></thead><tbody>{data.recent.map(v=><tr key={v._id}><td><Link className="voucher-link" to={`/vouchers/${v._id}`}>{v.voucherNumber}</Link><small className="table-sub">{v.employeeName}</small></td><td><b>{v.expenseTitle}</b><small className="table-sub">{v.category}</small></td><td>{date(v.expenseDate)}</td><td className="amount-cell">{money(v.amount)}</td><td><StatusBadge status={v.status}/></td><td><Link className="row-arrow" to={`/vouchers/${v._id}`} aria-label="View voucher"><ArrowRight size={16}/></Link></td></tr>)}</tbody></table></div>}</div>
  <div className="side-stack"><div className="panel amount-panel"><div className="amount-panel-icon"><Wallet size={20}/></div><span>{employee?'Total amount claimed':director?'Total amount awaiting approval':'Total approved expense amount'}</span><strong>{!data?'—':money(employee?s.totalClaimed:director?s.pendingAmount:s.approvedAmount)}</strong><small>{employee?'Across your vouchers':director?'Across pending requests':'Across approved vouchers'}</small></div><div className="panel workflow-panel"><h3>Voucher workflow</h3><p>Every request follows a clear approval path.</p><div className="workflow-step"><span className="workflow-dot draft-dot">1</span><div><b>Draft</b><small>Prepare your expense details</small></div></div><div className="workflow-line"></div><div className="workflow-step"><span className="workflow-dot pending-dot">2</span><div><b>Pending approval</b><small>Director reviews the request</small></div></div><div className="workflow-line"></div><div className="workflow-step"><span className="workflow-dot approved-dot">3</span><div><b>Approved or rejected</b><small>Decision is recorded in the system</small></div></div></div></div></div></>;
}
