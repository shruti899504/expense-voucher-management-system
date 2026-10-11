import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vouchers from './pages/Vouchers';
import VoucherForm from './pages/VoucherForm';
import VoucherDetails from './pages/VoucherDetails';

function Protected({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading your workspace…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}
export default function App() {
  const { user } = useAuth();
  return <Routes>
    <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
    <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
    <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
    <Route path="/vouchers" element={<Protected><Vouchers /></Protected>} />
    <Route path="/vouchers/new" element={<Protected roles={['EMPLOYEE']}><VoucherForm /></Protected>} />
    <Route path="/vouchers/:id/edit" element={<Protected roles={['EMPLOYEE']}><VoucherForm /></Protected>} />
    <Route path="/vouchers/:id" element={<Protected><VoucherDetails /></Protected>} />
    <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
  </Routes>;
}
