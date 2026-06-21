import { useEffect, useMemo, useState } from 'react';
import { authFetch, getToken, logout } from '../lib/auth.js';
import MyInscriptions from './participant/MyInscriptions.jsx';
import EventDetails from './participant/EventDetails.jsx';
import EventsCatalog from './participant/EventsCatalog.jsx';

export default function ParticipantHome() {
  const [me, setMe] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const token = getToken();

  useEffect(() => {
    const load = async () => {
      const data = await authFetch('/auth/me', { method: 'GET' }, { Authorization: `Bearer ${token}` });
      setMe(data.user);
    };
    load().catch(() => logout());
  }, [token]);

  const pageTitle = useMemo(() => {
    return selectedEventId ? 'Detalhes do evento' : 'Catálogo';
  }, [selectedEventId]);

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <div>
          <div style={{ fontWeight: 700 }}>Participante</div>
          <div style={{ color: '#555', fontSize: 13 }}>{me ? me.name : ''}</div>
          <div style={{ color: '#777', fontSize: 12 }}>{pageTitle}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => logout()} style={styles.linkBtn}>
            Sair
          </button>
        </div>
      </header>

      <div style={styles.grid}>
        <div style={styles.left}>
          {selectedEventId ? (
            <EventDetails
              eventId={selectedEventId}
              onBack={() => setSelectedEventId(null)}
              token={token}
            />
          ) : (
            <EventsCatalog onSelectEvent={(id) => setSelectedEventId(id)} />
          )}
        </div>

        <div style={styles.right}>
          <MyInscriptions token={token} onOpenEvent={(id) => setSelectedEventId(id)} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 1200, margin: '20px auto', padding: 10 },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: 12, padding: 12, border: '1px solid #eee', borderRadius: 10 },
  linkBtn: { padding: 8, borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 420px', gap: 12 },
  left: { border: '1px solid #eee', borderRadius: 10, padding: 12 },
  right: { border: '1px solid #eee', borderRadius: 10, padding: 12 }
};

