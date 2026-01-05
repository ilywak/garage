import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Ventes() {
  const [ventes, setVentes] = useState([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const { data } = await api.get('/api/ventes');
      setVentes(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2>Ventes</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Voiture</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Client</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Date</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>Prix</th>
          </tr>
        </thead>
        <tbody>
          {ventes.map(v => (
            <tr key={v.id}>
              <td>{v.voiture_marque} {v.voiture_modele}</td>
              <td>{v.client_prenom} {v.client_nom}</td>
              <td>{new Date(v.date_vente).toLocaleString()}</td>
              <td>{v.prix_vente} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
