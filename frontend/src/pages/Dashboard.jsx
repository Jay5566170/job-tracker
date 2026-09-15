import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome, {user?.email}</h1>
      <div style={styles.grid}>
        <Link to="/jobs" style={styles.card}>
          <h3>📋 My Jobs</h3>
          <p>Track your job applications</p>
        </Link>
        <Link to="/resumes" style={styles.card}>
          <h3>📄 My Resumes</h3>
          <p>Upload and manage resumes</p>
        </Link>
        <Link to="/matches" style={styles.card}>
          <h3>🎯 AI Matches</h3>
          <p>Match resumes to jobs</p>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
  title: { marginBottom: '30px', color: '#1a1a2e' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  card: { 
    background: 'white', 
    padding: '25px', 
    borderRadius: '10px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textDecoration: 'none',
    color: '#1a1a2e',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
};

export default Dashboard;