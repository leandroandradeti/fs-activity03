import { useEffect, useMemo, useState } from 'react';
import Login from './components/Login.jsx';
import ParticipantHome from './components/ParticipantHome.jsx';
import OrganizerHome from './components/OrganizerHome.jsx';
import { authFetch, getToken, logout } from './lib/auth.js';

export default function App() {
  const [me, setMe] = useState(null);
  const token = getToken();

  const headers = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  useEffect(() => {
    const loadMe = async () => {
      if (!token) {
        setMe(null);
        return;
      }
      try {
        const res = await authFetch('/auth/me', { method: 'GET' }, headers);
        setMe(res.user);
      } catch {
        setMe(null);
      }
    };
    loadMe();
  }, [token]);

  if (!token || !me) {
    return <Login onLoggedIn={setMe} />;
  }

  if (me.role === 'ORGANIZADOR') {
    return <OrganizerHome me={me} />;
  }

  return <ParticipantHome />;
}

