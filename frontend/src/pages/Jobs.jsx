import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await api.get('/jobs/');
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      loadJobs();
    } catch (error) {
      alert('Delete failed');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📋 My Jobs</h1>
        <div>
          <Link to="/jobs/add" style={styles.button}>+ Add Job</Link>
          <Link to="/" style={styles.backButton}>← Back</Link>
        </div>
      </div>

     {jobs.length === 0 ? (
  <div style={styles.empty}>
    <p>No jobs yet. Click <strong>+ Add Job</strong> above to create your first job.</p>
  </div>
            ) : (
        <div style={styles.grid}>
          {jobs.map(job => (
            <div key={job.id} style={styles.card}>
              <h3>{job.role}</h3>
              <p style={styles.company}>{job.company}</p>
              <p style={styles.date}>Added: {new Date(job.created_at).toLocaleDateString()}</p>
              <div style={styles.actions}>
                <button 
                  onClick={() => navigate(`/jobs/${job.id}`)} 
                  style={styles.viewButton}
                >
                  View
                </button>
                <button 
                  onClick={() => deleteJob(job.id)} 
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { color: '#1a1a2e' },
  button: { padding: '10px 20px', background: '#4fc3f7', color: 'white', textDecoration: 'none', borderRadius: '5px', marginLeft: '10px' },
  backButton: { padding: '10px 20px', background: '#666', color: 'white', textDecoration: 'none', borderRadius: '5px', marginLeft: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' },
  card: { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  company: { color: '#666', marginBottom: '10px' },
  date: { color: '#999', fontSize: '12px', marginBottom: '15px' },
  actions: { display: 'flex', gap: '10px' },
  viewButton: { padding: '8px 16px', background: '#4fc3f7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  deleteButton: { padding: '8px 16px', background: '#ef5350', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  loading: { padding: '40px', textAlign: 'center' },
  empty: { textAlign: 'center', padding: '40px', background: 'white', borderRadius: '10px' },
};

export default Jobs;