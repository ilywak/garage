import React, { useState } from 'react';
import { api, setAuthToken } from '../api.js';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function login(e) {
    e.preventDefault();
    setMessage('');
    try {
      const { data } = await api.post('/api/login', { email, password });
      setAuthToken(data.token);
      setMessage('Logged in');
    } catch (e) {
      setMessage(e.response?.data?.error || e.message);
    }
  }

  function logout() {
    setAuthToken(null);
    setMessage('Logged out');
  }

  return (
    <div>
      <h2>Auth</h2>
      <form onSubmit={login} style={{ display: 'grid', gap: 8, maxWidth: 320 }}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <button onClick={logout} style={{ marginTop: 8 }}>Logout</button>
      {message && <p style={{ marginTop: 8 }}>{message}</p>}
    </div>
  );
}
