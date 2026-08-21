import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth.js';

function AdminRoute() {
  const { user } = useAuth();

  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

export default AdminRoute;
