import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import api from '../services/api';

function AddJob() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [requirements, setRequirements] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [parseUrl, setParseUrl] = useState('');
  const [parseText, setParseText] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    const trimmedCompany = company.trim();
    const trimmedRole = role.trim();
    if (!trimmedCompany || !trimmedRole) {
      setError('Company and job title are required.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/jobs/', {
        company: trimmedCompany,
        role: trimmedRole,
        url: url.trim() || null,
        description: description.trim() || null,
        location: location.trim() || null,
        skills: JSON.stringify(skills.split(',').map((item) => item.trim()).filter(Boolean)),
        requirements: JSON.stringify(requirements.split('\n').map((item) => item.trim()).filter(Boolean)),
      });
      navigate(`/jobs/${response.data.id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message || 'Could not create the job.');
    } finally {
      setSaving(false);
    }
  };

  const parseJob = async (endpoint, payload, sourceUrl = '') => {
    setError('');
    setNotice('');
    setParsing(true);
    try {
      const response = await api.post(endpoint, payload);
      setCompany(response.data.company || '');
      setRole(response.data.title || response.data.role || '');
      setLocation(response.data.location || '');
      setSkills(Array.isArray(response.data.skills) ? response.data.skills.join(', ') : '');
      setRequirements(Array.isArray(response.data.requirements) ? response.data.requirements.join('\n') : '');
      setUrl(response.data.url || sourceUrl);
      setDescription(response.data.description || '');
      setMode('manual');
      setNotice('Job details parsed. Review them and save the job.');
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message || 'Could not parse the job details.');
    } finally {
      setParsing(false);
    }
  };

  return (
    <main style={styles.container}>
      <Link to="/jobs" style={styles.back}><FaArrowLeft /> Back to Jobs</Link>
      <section style={styles.card}>
        <h1>Add Job</h1>
        {error && <p role="alert" style={styles.error}>{error}</p>}
        {notice && <p role="status" style={styles.notice}>{notice}</p>}

        <div style={styles.tabs} aria-label="Job entry method">
          <button type="button" onClick={() => setMode('manual')} style={mode === 'manual' ? styles.activeTab : styles.tab}>Manual</button>
          <button type="button" onClick={() => setMode('url')} style={mode === 'url' ? styles.activeTab : styles.tab}>From URL</button>
          <button type="button" onClick={() => setMode('text')} style={mode === 'text' ? styles.activeTab : styles.tab}>From Text</button>
        </div>

        {mode === 'url' && (
          <div>
            <label style={styles.label} htmlFor="parse-url">Job posting URL</label>
            <input
              id="parse-url"
              type="url"
              value={parseUrl}
              onChange={(event) => setParseUrl(event.target.value)}
              placeholder="https://example.com/jobs/123"
              required
              style={styles.input}
            />
            <button
              type="button"
              disabled={parsing || !parseUrl.trim()}
              onClick={() => parseJob('/jobs/parse-url', { url: parseUrl.trim() }, parseUrl.trim())}
              style={styles.submit}
            >
              {parsing ? 'Parsing...' : 'Parse URL'}
            </button>
          </div>
        )}

        {mode === 'text' && (
          <div>
            <label style={styles.label} htmlFor="parse-text">Job description text</label>
            <textarea
              id="parse-text"
              value={parseText}
              onChange={(event) => setParseText(event.target.value)}
              rows={8}
              required
              style={styles.textarea}
            />
            <button
              type="button"
              disabled={parsing || !parseText.trim()}
              onClick={() => parseJob('/jobs/parse-text', { text: parseText.trim() })}
              style={styles.submit}
            >
              {parsing ? 'Parsing...' : 'Parse Text'}
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleSubmit}>
            <label style={styles.label} htmlFor="company">Company *</label>
            <input
              id="company"
              name="company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              maxLength={100}
              required
              style={styles.input}
            />

            <label style={styles.label} htmlFor="role">Job title *</label>
            <input
              id="role"
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              maxLength={100}
              required
              style={styles.input}
            />

            <label style={styles.label} htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={255}
              style={styles.input}
            />

            <label style={styles.label} htmlFor="skills">Skills (comma-separated)</label>
            <input
              id="skills"
              name="skills"
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              style={styles.input}
            />

            <label style={styles.label} htmlFor="requirements">Requirements (one per line)</label>
            <textarea
              id="requirements"
              name="requirements"
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
              rows={4}
              style={styles.textarea}
            />

            <label style={styles.label} htmlFor="url">Job posting URL</label>
            <input
              id="url"
              name="url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              maxLength={500}
              placeholder="https://example.com/jobs/123"
              style={styles.input}
            />

            <label style={styles.label} htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={7}
              style={styles.textarea}
            />

            <button type="submit" disabled={saving} style={styles.submit}>
              <FaSave /> {saving ? 'Saving...' : 'Save Job'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '30px' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' },
  card: { background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,.08)' },
  tabs: { display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '20px 0' },
  tab: { padding: '10px 16px', border: 0, borderRadius: '6px', background: '#e2e8f0', cursor: 'pointer' },
  activeTab: { padding: '10px 16px', border: 0, borderRadius: '6px', background: '#0284c7', color: '#fff', cursor: 'pointer' },
  label: { display: 'block', margin: '16px 0 8px', fontWeight: 600 },
  input: { width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' },
  textarea: { width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', resize: 'vertical' },
  submit: { display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '22px', padding: '11px 18px', border: 0, borderRadius: '6px', background: '#0284c7', color: '#fff', cursor: 'pointer' },
  error: { color: '#b91c1c' },
  notice: { color: '#166534' },
};

export default AddJob;
