import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    loadJob();
    loadApplication();
}, [id]);

  const loadJob = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      alert('Job not found');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadApplication = async () => {
    try {
        const response = await api.get("/applications/");
        
        const existingApplication = response.data.find(
            app => app.job_id === Number(id)
        );

        setApplication(existingApplication || null);

    } catch(error) {
        console.log("No application found");
    }
};

  const deleteJob = async () => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      navigate('/jobs');
    } catch (error) {
      alert('Delete failed');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!job) return null;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/jobs')} style={styles.back}>← Back</button>
      <div style={styles.card}>
        <h1>{job.role}</h1>
        <p style={styles.company}>🏢 {job.company}</p>
      {job.url && (
  <p style={styles.url}>
    <a href={job.url} target="_blank" rel="noreferrer">{job.url}</a>
  </p>
)}
        {job.description && (
          <>
            <h3>Description</h3>
            <p style={styles.description}>{job.description}</p>
          </>
        )}
        <p style={styles.date}>Added: {new Date(job.created_at).toLocaleString()}</p>
        <button onClick={deleteJob} style={styles.delete}>Delete Job</button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '800px', margin: '0 auto' },
  back: { padding: '10px 20px', background: '#666', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' },
  card: { background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  company: { color: '#666', fontSize: '18px', marginBottom: '15px' },
  description: { color: '#444', lineHeight: '1.6', marginBottom: '20px' },
  date: { color: '#999', fontSize: '13px' },
   url: { wordBreak: 'break-all', color: '#4fc3f7', marginBottom: '15px' }, 
  delete: { padding: '10px 20px', background: '#ef5350', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' },
  loading: { padding: '40px', textAlign: 'center' },
};

export default JobDetails;