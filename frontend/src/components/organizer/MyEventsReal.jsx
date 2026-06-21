import { useEffect, useState } from 'react';
import { authFetch } from '../../lib/auth.js';

export default function MyEvents({ token, onOpenInscriptions }) {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    datetime: '',
    location: '',
    category: '',
    capacity: 10,
    imageUrl: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    const data = await authFetch('/organizer/events', { method: 'GET' }, { Authorization: `Bearer ${token}` });
    setEvents(data.events || []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message || 'erro'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity)
      };

      if (editingId) {
        await authFetch(
          `/organizer/events/${editingId}`,
          { method: 'PUT', body: JSON.stringify(payload) },
          { Authorization: `Bearer ${token}` }
        );
      } else {
        await authFetch('/organizer/events', { method: 'POST', body: JSON.stringify(payload) }, { Authorization: `Bearer ${token}` });
      }

      setEditingId(null);
      setForm({ title: '', description: '', datetime: '', location: '', category: '', capacity: 10, imageUrl: '' });
      await load();
    } catch (err) {
      setError(err.data?.error || err.message || 'erro');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!confirm('Excluir evento?')) return;
    setBusy(true);
    setError(null);
    try {
      await authFetch(`/organizer/events/${id}`, { method: 'DELETE' }, { Authorization: `Bearer ${token}` });
      if (editingId === id) setEditingId(null);
      await load();
    } catch (err) {
      setError(err.data?.error || err.message || 'erro');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(ev) {
    setEditingId(ev.id);
    setForm({
      title: ev.title || '',
      description: ev.description || '',
      datetime: ev.datetime ? ev.datetime.slice(0, 16) : '',
      location: ev.location || '',
      category: ev.category || '',
      capacity: ev.capacity || 10,
      imageUrl: ev.imageUrl || ''
    });
  }

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Meus eventos</h3>

      {error && <div style={{ color: 'crimson', marginBottom: 10 }}>{error}</div>}

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        <input style={styles.input} placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea style={{ ...styles.input, minHeight: 70 }} placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input style={styles.input} type="datetime-local" value={form.datetime} onChange={(e) => setForm({ ...form, datetime: e.target.value })} />
        <input style={styles.input} placeholder="Local (ou online)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input style={styles.input} placeholder="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input style={styles.input} type="number" min={1} placeholder="Vagas" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        <input style={styles.input} placeholder="Imagem (URL opcional)" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />

        <button disabled={busy} style={styles.button} type="submit">
          {editingId ? 'Salvar alterações' : 'Criar evento'}
        </button>

        {editingId && (
          <button
            type="button"
            disabled={busy}
            style={styles.outlineButton}
            onClick={() => {
              setEditingId(null);
              setForm({ title: '', description: '', datetime: '', location: '', category: '', capacity: 10, imageUrl: '' });
            }}
          >
            Cancelar edição
          </button>
        )}
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.map((ev) => (
          <div key={ev.id} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 800 }}>{ev.title}</div>
                <div style={{ color: '#666', fontSize: 13 }}>
                  {ev.category} • {new Date(ev.datetime).toLocaleString()}
                </div>
                <div style={{ color: '#666', fontSize: 13 }}>
                  Vagas: {ev.remaining ?? (ev.capacity - (ev.enrolled || 0))} / {ev.capacity}
                </div>
                <div style={{ color: '#666', fontSize: 13 }}>Status: {ev.status}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button style={styles.buttonSmall} onClick={() => onOpenInscriptions(ev.id)} type="button">
                  Ver inscritos
                </button>
                <button style={styles.outlineButtonSmall} onClick={() => startEdit(ev)} type="button">
                  Editar
                </button>
                <button style={styles.dangerButtonSmall} onClick={() => remove(ev.id)} type="button">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && <div style={{ color: '#666' }}>Você ainda não criou eventos.</div>}
      </div>
    </div>
  );
}

const styles = {
  input: { padding: 10, borderRadius: 8, border: '1px solid #ddd' },
  button: { padding: '11px 12px', borderRadius: 8, border: 0, background: '#111', color: '#fff', cursor: 'pointer' },
  outlineButton: { padding: '11px 12px', borderRadius: 8, border: '1px solid #111', background: '#fff', color: '#111', cursor: 'pointer' },
  card: { border: '1px solid #eee', borderRadius: 10, padding: 12 },
  buttonSmall: { padding: '9px 10px', borderRadius: 8, border: 0, background: '#111', color: '#fff', cursor: 'pointer' },
  outlineButtonSmall: { padding: '9px 10px', borderRadius: 8, border: '1px solid #111', background: '#fff', color: '#111', cursor: 'pointer' },
  dangerButtonSmall: { padding: '9px 10px', borderRadius: 8, border: '1px solid #b00', background: '#fff', color: '#b00', cursor: 'pointer' }
};

