import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome, {user?.email}</h1>
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>📋 My Jobs</h3>
          <p>Track your job applications</p>
        </div>
        <div style={styles.card}>
          <h3>📄 My Resumes</h3>
          <p>Upload and manage resumes</p>
        </div>
        <div style={styles.card}>
          <h3>🎯 AI Matches</h3>
          <p>Match resumes to jobs</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
  title: { marginBottom: '30px', color: '#1a1a2e' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
  card: { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
};

export default Dashboard;