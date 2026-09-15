import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AddJob() {
  const [mode, setMode] = useState('manual'); // 'manual', 'url', 'text'
  const [formData, setFormData] = useState({ company: '', role: '', url: '', description: '' });
  const [parseUrl, setParseUrl] = useState('');
  const [parseText, setParseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/jobs/', formData);
      alert('Job created!');
      navigate('/jobs');
    } catch (error) {
      alert('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const handleParseUrl = async () => {
    if (!parseUrl) return;
    setParsing(true);
    try {
      const response = await api.post('/jobs/parse-url', { url: parseUrl });
      setFormData({
        company: response.data.company || '',
        role: response.data.role || '',
        url: parseUrl,
        description: response.data.description || '',
      });
      setMode('manual');
      alert('Parsed! Review and submit.');
    } catch (error) {
      alert('Could not parse URL. Try pasting the text instead.');
    } finally {
      setParsing(false);
    }
  };

  const handleParseText = async () => {
    if (!parseText) return;
    setParsing(true);
    try {
      const response = await api.post('/jobs/parse-text', { text: parseText });
      setFormData({
        company: response.data.company || '',
        role: response.data.role || '',
        url: '',
        description: response.data.description || '',
      });
      setMode('manual');
      alert('Parsed! Review and submit.');
    } catch (error) {
      alert('Could not parse text.');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>➕ Add Job</h1>

      <div style={styles.tabs}>
        <button 
          onClick={() => setMode('manual')} 
          style={mode === 'manual' ? styles.activeTab : styles.tab}
        >
          Manual
        </button>
        <button 
          onClick={() => setMode('url')} 
          style={mode === 'url' ? styles.activeTab : styles.tab}
        >
          From URL
        </button>
        <button 
          onClick={() => setMode('text')} 
          style={mode === 'text' ? styles.activeTab : styles.tab}
        >
          From Text
        </button>
      </div>

      {mode === 'url' && (
        <div style={styles.card}>
          <h3>Paste Job URL</h3>
          <p style={styles.hint}>Works best with company career pages. LinkedIn may block.</p>
          <input 
            type="url" 
            placeholder="https://..." 
            value={parseUrl} 
            onChange={(e) => setParseUrl(e.target.value)} 
            style={styles.input} 
          />
          <button onClick={handleParseUrl} disabled={parsing} style={styles.button}>
            {parsing ? 'Parsing...' : 'Parse URL'}
          </button>
        </div>
      )}

      {mode === 'text' && (
        <div style={styles.card}>
          <h3>Paste Job Description</h3>
          <p style={styles.hint}>Paste the full job description text.</p>
          <textarea 
            placeholder="Paste job description here..." 
            value={parseText} 
            onChange={(e) => setParseText(e.target.value)} 
            style={styles.textarea} 
            rows="6"
          />
          <button onClick={handleParseText} disabled={parsing} style={styles.button}>
            {parsing ? 'Parsing...' : 'Parse Text'}
          </button>
        </div>
      )}

      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} style={styles.card}>
          <input 
            name="company" 
            placeholder="Company *" 
            value={formData.company} 
            onChange={handleChange} 
            required 
            style={styles.input} 
          />
          <input 
            name="role" 
            placeholder="Role *" 
            value={formData.role} 
            onChange={handleChange} 
            required 
            style={styles.input} 
          />
          <input 
            name="url" 
            placeholder="Job URL (optional)" 
            value={formData.url} 
            onChange={handleChange} 
            style={styles.input} 
          />
          <textarea 
            name="description" 
            placeholder="Job description (optional)" 
            value={formData.description} 
            onChange={handleChange} 
            style={styles.textarea} 
            rows="5"
          />
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating...' : 'Create Job'}
          </button>
        </form>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '30px', maxWidth: '700px', margin: '0 auto' },
  title: { marginBottom: '20px', color: '#1a1a2e' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { padding: '10px 20px', background: '#ddd', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  activeTab: { padding: '10px 20px', background: '#4fc3f7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  card: { background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' },
  textarea: { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', fontFamily: 'inherit' },
  button: { padding: '12px 24px', background: '#4fc3f7', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
  hint: { color: '#666', fontSize: '13px', marginBottom: '10px' },
};

export default AddJob;