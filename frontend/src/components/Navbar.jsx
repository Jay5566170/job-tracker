import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>📄 Job Tracker</Link>
      <div>
        {user ? (
          <>
            <span style={styles.user}>👤 {user.email}</span>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    background: '#1a1a2e',
    color: 'white',
  },
  logo: { fontSize: '20px', fontWeight: 'bold', color: 'white', textDecoration: 'none' },
  user: { marginRight: '15px', color: '#ccc' },
  button: { padding: '8px 16px', background: '#ef5350', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  link: { marginLeft: '15px', color: 'white', textDecoration: 'none' },
};

export default Navbar;