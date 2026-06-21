import { useEffect, useMemo, useState } from 'react';
import { authFetch } from '../../lib/auth.js';

export default function EventsCatalog({ onSelectEvent }) {
  const [category, setCategory] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('asc');
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (q) params.set('q', q);
    if (sort) params.set('sort', sort);

    authFetch(`/events${params.toString() ? `?${params.toString()}` : ''}`, { method: 'GET' }, {})
      .then((data) => setEvents(data.events || []))
      .catch((err) => setError(err.message || 'erro'));
  }, [category, q, sort]);

  const categories = useMemo(() => {
    const set = new Set(events.map((e) => e.category));
    return Array.from(set);
  }, [events]);

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Catálogo de eventos</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.input}>
          <option value="">Todas categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={styles.input}>
          <option value="asc">Ordenar (data ↑)</option>
          <option value="desc">Ordenar (data ↓)</option>
        </select>
      </div>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar" style={{ ...styles.input, width: '100%', marginBottom: 10 }} />

      {error && <div style={{ color: 'crimson', marginBottom: 10 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.map((ev) => (
          <div key={ev.id} style={styles.card}>
            <div style={{ fontWeight: 700 }}>{ev.title}</div>
            <div style={{ color: '#555', fontSize: 13 }}>{ev.category}</div>
            <div style={{ color: '#666', fontSize: 13 }}>{new Date(ev.datetime).toLocaleString()}</div>
            <div style={{ color: '#666', fontSize: 13 }}>{ev.remaining ?? (ev.capacity - (ev.enrolled || 0))} vagas</div>
            {ev.imageUrl ? (
              <img src={ev.imageUrl} alt="" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }} />
            ) : null}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => onSelectEvent(ev.id)} style={styles.button}>
                Ver detalhes
              </button>
            </div>
          </div>
        ))}

        {events.length === 0 && <div style={{ color: '#666' }}>Nenhum evento encontrado.</div>}
      </div>
    </div>
  );
}

const styles = {
  input: { padding: 10, borderRadius: 8, border: '1px solid #ddd', background: '#fff' },
  card: { border: '1px solid #eee', borderRadius: 10, padding: 12 },
  button: { padding: '10px 12px', borderRadius: 8, border: 0, background: '#111', color: '#fff', cursor: 'pointer' }
};

