import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const response = await api.get('/resumes/');
      setResumes(response.data);
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.txt')) {
      alert('Only PDF and TXT files allowed');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Resume uploaded and analyzed!');
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadResumes();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteResume = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      loadResumes();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const parseSkills = (skills) => {
    try {
      return JSON.parse(skills || '[]');
    } catch {
      return [];
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📄 My Resumes</h1>

      <div style={styles.uploadCard}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={styles.uploadButton}
        >
          {uploading ? 'Uploading...' : '📤 Upload Resume (PDF/TXT)'}
        </button>
        <p style={styles.hint}>AI will extract your skills automatically</p>
      </div>

      {resumes.length === 0 ? (
        <div style={styles.empty}>
          <p>No resumes yet. Upload your first one above!</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {resumes.map(resume => (
            <div key={resume.id} style={styles.card}>
              <h3>📄 {resume.filename}</h3>
              <p style={styles.date}>
                Uploaded: {new Date(resume.created_at).toLocaleDateString()}
              </p>
              {parseSkills(resume.skills).length > 0 && (
                <div>
                  <p style={styles.skillsLabel}>Skills:</p>
                  <div style={styles.skills}>
                    {parseSkills(resume.skills).map((skill, i) => (
                      <span key={i} style={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={styles.actions}>

  <a
    href={`http://127.0.0.1:8000/${resume.file_path}`}
    target="_blank"
    rel="noopener noreferrer"
    style={styles.viewButton}
  >
    👁 View
  </a>

  <a
    href={`http://127.0.0.1:8000/${resume.file_path}`}
    download
    style={styles.downloadButton}
  >
    ⬇ Download
  </a>

  <button 
    onClick={() => deleteResume(resume.id)}
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
  title: { marginBottom: '30px', color: '#1a1a2e' },
  uploadCard: { 
    background: 'white', 
    padding: '30px', 
    borderRadius: '10px', 
    marginBottom: '30px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  uploadButton: { 
    padding: '12px 24px', 
    background: '#4fc3f7', 
    color: 'white', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer',
    fontSize: '15px',
  },
  hint: { color: '#666', fontSize: '13px', marginTop: '10px' },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '20px' 
  },
  card: { 
    background: 'white', 
    padding: '20px', 
    borderRadius: '10px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)' 
  },
  date: { color: '#999', fontSize: '13px', marginBottom: '15px' },
  skillsLabel: { fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px' },
  skillTag: { 
    background: '#e3f2fd', 
    color: '#0d47a1', 
    padding: '4px 10px', 
    borderRadius: '12px', 
    fontSize: '12px' 
  },
  actions: {
  display: 'flex',
  gap: '10px',
  marginTop: '15px',
  flexWrap: 'wrap',
},

viewButton: {
  padding: '8px 16px',
  background: '#4fc3f7',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
},

downloadButton: {
  padding: '8px 16px',
  background: '#66bb6a',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
},
  deleteButton: { 
    padding: '8px 16px', 
    background: '#ef5350', 
    color: 'white', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer',
    marginTop: '10px',
  },
  loading: { padding: '40px', textAlign: 'center' },
  empty: { 
    textAlign: 'center', 
    padding: '40px', 
    background: 'white', 
    borderRadius: '10px',
    color: '#666',
  },
};

export default Resumes;