import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Voitures() {
  const [voitures, setVoitures] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    marque: '', modele: '', annee: '', prix: '', carburant: 'essence', etat: 'occasion', disponible: true
  });

  async function load() {
    try {
      const { data } = await api.get('/api/voitures');
      setVoitures(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/voitures', {
        marque: form.marque,
        modele: form.modele,
        annee: Number(form.annee),
        prix: Number(form.prix),
        carburant: form.carburant,
        etat: form.etat,
        disponible: !!form.disponible
      });
      setForm({ marque: '', modele: '', annee: '', prix: '', carburant: 'essence', etat: 'occasion', disponible: true });
      load();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  }

  return (
    <div>
      <h2>Voitures</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={add} style={{ display: 'grid', gap: 8, maxWidth: 600 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <input placeholder="Marque" value={form.marque} onChange={e => setForm({ ...form, marque: e.target.value })} />
          <input placeholder="Modèle" value={form.modele} onChange={e => setForm({ ...form, modele: e.target.value })} />
          <input placeholder="Année" value={form.annee} onChange={e => setForm({ ...form, annee: e.target.value })} />
          <input placeholder="Prix" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} />
          <select value={form.carburant} onChange={e => setForm({ ...form, carburant: e.target.value })}>
            <option value="essence">Essence</option>
            <option value="diesel">Diesel</option>
            <option value="electrique">Électrique</option>
            <option value="hybride">Hybride</option>
            <option value="gpl">GPL</option>
          </select>
          <select value={form.etat} onChange={e => setForm({ ...form, etat: e.target.value })}>
            <option value="neuf">Neuf</option>
            <option value="occasion">Occasion</option>
            <option value="reconditionne">Reconditionné</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.disponible} onChange={e => setForm({ ...form, disponible: e.target.checked })} />
            Disponible
          </label>
        </div>
        <button type="submit">Ajouter</button>
      </form>
      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Marque</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Modèle</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Année</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Prix</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Disponible</th>
          </tr>
        </thead>
        <tbody>
          {voitures.map(v => (
            <tr key={v.id}>
              <td>{v.marque}</td>
              <td>{v.modele}</td>
              <td>{v.annee}</td>
              <td>{v.prix}</td>
              <td>{v.disponible ? 'Oui' : 'Non'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
