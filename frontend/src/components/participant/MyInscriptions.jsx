import { useEffect, useState } from 'react';
import { authFetch } from '../../lib/auth.js';

export default function MyInscriptions({ token, onOpenEvent }) {
  const [inscriptions, setInscriptions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    authFetch('/me/inscriptions', { method: 'GET' }, { Authorization: `Bearer ${token}` })
      .then((data) => setInscriptions(data.inscriptions || []))
      .catch((err) => setError(err.message || 'erro'));
  }, [token]);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Minhas inscrições</h3>
      {error && <div style={{ color: 'crimson', marginBottom: 10 }}>{error}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {inscriptions.map((it) => (
          <div key={it.eventId} style={styles.card}>
            <div style={{ fontWeight: 700 }}>{it.title}</div>
            <div style={{ color: '#666', fontSize: 13 }}>{new Date(it.datetime).toLocaleString()}</div>
            <div style={{ color: '#666', fontSize: 13 }}>{it.organizerName}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => onOpenEvent(it.eventId)} style={styles.button}>
                Abrir
              </button>
            </div>
          </div>
        ))}
        {inscriptions.length === 0 && <div style={{ color: '#666' }}>Nenhuma inscrição ainda.</div>}
      </div>
    </div>
  );
}

const styles = {
  card: { border: '1px solid #eee', borderRadius: 10, padding: 12 },
  button: { padding: '10px 12px', borderRadius: 8, border: 0, background: '#111', color: '#fff', cursor: 'pointer' }
};

