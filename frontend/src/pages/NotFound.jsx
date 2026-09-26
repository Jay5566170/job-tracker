import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <main style={{ maxWidth: '640px', margin: '80px auto', padding: '24px', textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/dashboard">Return to dashboard</Link>
    </main>
  );
}

export default NotFound;
