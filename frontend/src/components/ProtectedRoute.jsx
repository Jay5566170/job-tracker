import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div role="status" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
