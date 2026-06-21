import { useEffect, useState } from 'react';
import { authFetch, getToken, logout } from '../lib/auth.js';
import MyEvents from './organizer/MyEventsReal.jsx';
import OrganizerEventInscriptions from './organizer/OrganizerEventInscriptionsReal.jsx';

export default function OrganizerHome({ me }) {
  const token = getToken();
  const [selectedEventId, setSelectedEventId] = useState(null);


  useEffect(() => {
    if (!token) logout();
  }, [token]);

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <div>
          <div style={{ fontWeight: 700 }}>Organizador</div>
          <div style={{ color: '#555', fontSize: 13 }}>{me?.name}</div>
          {selectedEventId ? <div style={{ color: '#777', fontSize: 12 }}>Inscritos</div> : <div style={{ color: '#777', fontSize: 12 }}>Meus eventos</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => logout()} style={styles.linkBtn}>
            Sair
          </button>
        </div>
      </header>

      <div style={styles.grid}>
        <div style={styles.left}>
          <MyEvents token={token} onOpenInscriptions={(id) => setSelectedEventId(id)} />
        </div>
        <div style={styles.right}>
          {selectedEventId ? (
            <OrganizerEventInscriptions token={token} eventId={selectedEventId} onBack={() => setSelectedEventId(null)} />
          ) : (
            <div style={{ color: '#666' }}>Selecione um evento à esquerda.</div>
          )}
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

