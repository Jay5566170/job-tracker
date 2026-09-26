import { Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function ProtectedRoute() {
  const { user, loading, authError } = useAuth();

  if (loading) {
    return <div role="status" style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (authError) {
    return (
      <main role="alert" style={{ maxWidth: '640px', margin: '40px auto', padding: '24px' }}>
        <p>{authError}</p>
        <p>Please sign in again once the API is available.</p>
        <Link to="/login">Go to login</Link>
      </main>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
