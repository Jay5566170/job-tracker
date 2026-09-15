import { useState, useEffect } from 'react';
import api from '../services/api';

function Matches() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resumesRes, jobsRes] = await Promise.all([
        api.get('/resumes/'),
        api.get('/jobs/'),
      ]);
      setResumes(resumesRes.data);
      setJobs(jobsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!selectedResume || !selectedJob) {
      alert('Please select both a resume and a job');
      return;
    }

    setMatching(true);
    setResult(null);

    try {
      const response = await api.post(`/matches/${selectedResume}/${selectedJob}`);
      setResult(response.data);
    } catch (error) {
      console.error('Match error:', error);
      alert('Matching failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setMatching(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎯 AI Resume Matching</h1>
      <p style={styles.subtitle}>Compare your resume to a job using AI</p>

      <div style={styles.formCard}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Select Resume</label>
          <select
            value={selectedResume}
            onChange={(e) => setSelectedResume(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Choose a resume --</option>
            {resumes.map(r => (
              <option key={r.id} value={r.id}>{r.filename}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Select Job</label>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Choose a job --</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.role} at {j.company}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleMatch}
          disabled={matching || !selectedResume || !selectedJob}
          style={styles.button}
        >
          {matching ? 'Analyzing...' : '🎯 Match with AI'}
        </button>
      </div>

      {result && (
        <div style={styles.resultCard}>
          <h2>Match Result</h2>
          <div style={styles.scoreContainer}>
            <div style={{
              ...styles.scoreCircle,
              borderColor: result.match_score >= 70 ? '#4caf50' : 
                           result.match_score >= 50 ? '#ff9800' : '#f44336'
            }}>
              <div style={styles.scoreNumber}>{result.match_score}%</div>
              <div style={styles.scoreLabel}>Match</div>
            </div>
          </div>

          <div style={styles.section}>
            <h3>✅ Matching Skills</h3>
            {result.matching_skills?.length > 0 ? (
              <div style={styles.skills}>
                {result.matching_skills.map((s, i) => (
                  <span key={i} style={styles.matchSkill}>{s}</span>
                ))}
              </div>
            ) : (
              <p style={styles.emptyText}>No matching skills found</p>
            )}
          </div>

          <div style={styles.section}>
            <h3>❌ Missing Skills</h3>
            {result.missing_skills?.length > 0 ? (
              <div style={styles.skills}>
                {result.missing_skills.map((s, i) => (
                  <span key={i} style={styles.missSkill}>{s}</span>
                ))}
              </div>
            ) : (
              <p style={styles.emptyText}>No missing skills — perfect match!</p>
            )}
          </div>

          <div style={styles.section}>
            <h3>💡 Recommendation</h3>
            <p style={styles.recommendation}>{result.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '900px', margin: '0 auto' },
  title: { marginBottom: '10px', color: '#1a1a2e' },
  subtitle: { color: '#666', marginBottom: '30px' },
  formCard: { 
    background: 'white', 
    padding: '30px', 
    borderRadius: '10px', 
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' },
  select: { 
    width: '100%', 
    padding: '12px', 
    border: '1px solid #ddd', 
    borderRadius: '5px',
    fontSize: '14px',
  },
  button: { 
    width: '100%',
    padding: '14px 24px', 
    background: '#4fc3f7', 
    color: 'white', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  resultCard: { 
    background: 'white', 
    padding: '30px', 
    borderRadius: '10px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
  },
  scoreContainer: { textAlign: 'center', margin: '20px 0' },
  scoreCircle: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '6px solid #4caf50',
  },
  scoreNumber: { fontSize: '36px', fontWeight: 'bold', color: '#1a1a2e' },
  scoreLabel: { fontSize: '14px', color: '#666' },
  section: { marginTop: '25px' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' },
  matchSkill: { 
    background: '#e8f5e9', 
    color: '#2e7d32', 
    padding: '6px 14px', 
    borderRadius: '15px', 
    fontSize: '13px' 
  },
  missSkill: { 
    background: '#ffebee', 
    color: '#c62828', 
    padding: '6px 14px', 
    borderRadius: '15px', 
    fontSize: '13px' 
  },
  recommendation: { 
    color: '#444', 
    lineHeight: '1.6',
    background: '#f5f5f5',
    padding: '15px',
    borderRadius: '8px',
    fontStyle: 'italic',
  },
  emptyText: { color: '#999', fontStyle: 'italic', marginTop: '10px' },
  loading: { padding: '40px', textAlign: 'center' },
};

export default Matches;