import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ garage_id: '', nom: '', prenom: '', email: '', telephone: '', adresse: '' });

  async function load() {
    try {
      const { data } = await api.get('/api/clients');
      setClients(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/clients', {
        garage_id: Number(form.garage_id || 1),
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        telephone: form.telephone,
        adresse: form.adresse
      });
      setForm({ garage_id: '', nom: '', prenom: '', email: '', telephone: '', adresse: '' });
      load();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  }

  return (
    <div>
      <h2>Clients</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={add} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <input placeholder="Garage ID" value={form.garage_id} onChange={e => setForm({ ...form, garage_id: e.target.value })} />
          <input placeholder="Nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
          <input placeholder="Prénom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Téléphone" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
          <input placeholder="Adresse" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
        </div>
        <button type="submit">Ajouter</button>
      </form>
      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Nom</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Prénom</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Email</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Téléphone</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <tr key={c.id}>
              <td>{c.nom}</td>
              <td>{c.prenom}</td>
              <td>{c.email || '-'}</td>
              <td>{c.telephone || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
