import { useEffect, useState } from 'react';
import { authFetch } from '../../lib/auth.js';

export default function OrganizerEventInscriptions({ token, eventId, onBack }) {
  const [participants, setParticipants] = useState([]);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    const data = await authFetch(`/organizer/events/${eventId}/inscriptions`, { method: 'GET' }, { Authorization: `Bearer ${token}` });
    setEvent(data.event);
    setParticipants(data.participants || []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message || 'erro'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  return (
    <div>
      <button style={{ ...styles.linkBtn, marginBottom: 10 }} onClick={onBack} type="button">
        ← Voltar
      </button>

      <h3 style={{ marginTop: 0 }}>Inscritos</h3>
      {error && <div style={{ color: 'crimson', marginBottom: 10 }}>{error}</div>}

      <div style={{ color: '#666', marginBottom: 10 }}>{event ? event.title : ''}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {participants.map((p) => (
          <div key={p.user_id} style={styles.card}>
            <div style={{ fontWeight: 700 }}>{p.name}</div>
            <div style={{ color: '#666', fontSize: 13 }}>{p.email}</div>
            <div style={{ color: '#666', fontSize: 13 }}>Inscrito em: {new Date(p.created_at).toLocaleString()}</div>
          </div>
        ))}

        {participants.length === 0 && <div style={{ color: '#666' }}>Nenhuma inscrição.</div>}
      </div>
    </div>
  );
}

const styles = {
  linkBtn: { padding: 8, borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  card: { border: '1px solid #eee', borderRadius: 10, padding: 12 }
};

