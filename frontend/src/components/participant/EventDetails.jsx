import { useEffect, useState } from 'react';
import { authFetch } from '../../lib/auth.js';

export default function EventDetails({ eventId, token, onBack }) {
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    authFetch(`/events/${eventId}`, { method: 'GET' }, {})
      .then((data) => setEvent(data.event))
      .catch((err) => setError(err.message || 'erro'));
  }, [eventId]);

  async function enroll() {
    setBusy(true);
    setError(null);
    try {
      await authFetch(`/events/${eventId}/inscriptions`, { method: 'POST', body: null }, { Authorization: `Bearer ${token}` });
      const data = await authFetch(`/events/${eventId}`, { method: 'GET' }, {});
      setEvent(data.event);
    } catch (err) {
      setError(err.data?.error || err.message || 'erro');
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      await authFetch(`/events/${eventId}/inscriptions`, { method: 'DELETE' }, { Authorization: `Bearer ${token}` });
      const data = await authFetch(`/events/${eventId}`, { method: 'GET' }, {});
      setEvent(data.event);
    } catch (err) {
      setError(err.data?.error || err.message || 'erro');
    } finally {
      setBusy(false);
    }
  }

  if (!event) return <div>Carregando...</div>;

  return (
    <div>
      <button onClick={onBack} style={{ ...styles.linkBtn, marginBottom: 10 }} type="button">
        ← Voltar
      </button>

      <h3 style={{ marginTop: 0 }}>{event.title}</h3>
      <div style={{ color: '#666', fontSize: 13, marginBottom: 6 }}>{event.category}</div>
      <div style={{ color: '#666', fontSize: 13, marginBottom: 6 }}>{new Date(event.datetime).toLocaleString()}</div>
      <div style={{ color: '#666', fontSize: 13, marginBottom: 6 }}>Local: {event.location}</div>
      <div style={{ color: '#666', fontSize: 13, marginBottom: 10 }}>
        Vagas: {event.remaining} (de {event.capacity})
      </div>

      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt=""
          style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }}
        />
      ) : null}

      <div style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>{event.description}</div>

      {error && <div style={{ color: 'crimson', marginBottom: 10 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button disabled={busy} onClick={enroll} style={styles.button} type="button">
          Inscrever
        </button>
        <button disabled={busy} onClick={cancel} style={styles.outlineButton} type="button">
          Cancelar inscrição
        </button>
      </div>
    </div>
  );
}

const styles = {
  linkBtn: { padding: 8, borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  button: { padding: '10px 12px', borderRadius: 8, border: 0, background: '#111', color: '#fff', cursor: 'pointer', flex: 1 },
  outlineButton: { padding: '10px 12px', borderRadius: 8, border: '1px solid #111', background: '#fff', color: '#111', cursor: 'pointer', flex: 1 }
};

