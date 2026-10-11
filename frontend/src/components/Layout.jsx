import { NavLink, useNavigate } from 'react-router-dom';
import { Wallet, LayoutDashboard, Files, PlusCircle, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isEmployee = user?.role === 'EMPLOYEE';
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon"><Wallet size={20} /></span><span>Voucher<span className="brand-light">Flow</span></span></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>
        <NavLink to="/dashboard"><LayoutDashboard size={18} /> Dashboard</NavLink>
        <NavLink to="/vouchers"><Files size={18} /> {isEmployee ? 'My Vouchers' : 'All Vouchers'}</NavLink>
        {isEmployee && <NavLink to="/vouchers/new"><PlusCircle size={18} /> Create Voucher</NavLink>}
      </nav>
      <div className="sidebar-bottom"><div className="security-note"><ShieldCheck size={18}/><span><b>Secure workspace</b><small>Role-based access enabled</small></span></div>
        <div className="profile-row"><div className="avatar">{user?.name?.slice(0,1)?.toUpperCase()}</div><div className="profile-text"><b>{user?.name}</b><small>{user?.role?.replace('_',' ')}</small></div><button className="icon-button" title="Log out" onClick={() => { logout(); navigate('/login'); }}><LogOut size={17}/></button></div>
      </div>
    </aside>
    <main className="main-area"><header className="topbar"><div><span className="topbar-kicker">ABC COMPANY</span><span className="topbar-divider">/</span><span>{user?.role === 'EMPLOYEE' ? 'Employee portal' : user?.role === 'DIRECTOR' ? 'Director portal' : 'Accounts portal'}</span></div><div className="topbar-user"><span className="online-dot"></span>Signed in as <b>{user?.name}</b></div></header><div className="page-content">{children}</div></main>
  </div>;
}
