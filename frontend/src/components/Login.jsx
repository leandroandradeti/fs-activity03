import { useState } from 'react';
import { authFetch, setToken, getToken } from '../lib/auth.js';

export default function Login({ onLoggedIn }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('PARTICIPANTE');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);
  const token = getToken();

  async function submit(e) {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'register') {
        await authFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password, role })
        });
      }

      const data = await authFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      setToken(data.token);
      onLoggedIn(data.user);
    } catch (err) {
      setError(err.message || 'erro');
    }
  }

  return (
    <div style={styles.wrap}>
      <h2 style={{ marginBottom: 8 }}>Eventos</h2>
      <div style={styles.tabs}>
        <button style={mode === 'login' ? styles.activeTab : styles.tab} onClick={() => setMode('login')}>
          Login
        </button>
        <button style={mode === 'register' ? styles.activeTab : styles.tab} onClick={() => setMode('register')}>
          Cadastro
        </button>
      </div>

      <form onSubmit={submit} style={styles.form}>
        {mode === 'register' && (
          <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
        )}

        {token && <div style={{ marginBottom: 10, color: '#666' }}>Token encontrado</div>}

        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
        <input
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        {mode === 'register' && (
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ ...styles.input, cursor: 'pointer' }}>
            <option value="ORGANIZADOR">ORGANIZADOR</option>
            <option value="PARTICIPANTE">PARTICIPANTE</option>
          </select>
        )}

        {error && <div style={{ color: 'crimson', marginBottom: 10 }}>{error}</div>}

        <button style={styles.button} type="submit">
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 420, margin: '60px auto', padding: 20, border: '1px solid #ddd', borderRadius: 10 },
  tabs: { display: 'flex', gap: 8, marginBottom: 12 },
  tab: { flex: 1, padding: 10, cursor: 'pointer' },
  activeTab: { flex: 1, padding: 10, cursor: 'pointer', background: '#111', color: '#fff', border: 0, borderRadius: 8 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: { padding: 10, borderRadius: 8, border: '1px solid #ddd' },
  button: { padding: 12, borderRadius: 8, border: 0, background: '#111', color: '#fff', cursor: 'pointer' }
};

