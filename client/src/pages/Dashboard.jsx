import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/stats');
        setStats(data);
      } catch (e) {
        setError(e.response?.data?.error || e.message);
      }
    })();
  }, []);

  if (error) return <p>{error}</p>;
  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Card title="Voitures" value={stats.totalVoitures} />
        <Card title="Disponibles" value={stats.voituresDisponibles} />
        <Card title="Clients" value={stats.totalClients} />
        <Card title="Ventes" value={stats.totalVentes} />
        <Card title="Chiffre d’Affaires" value={`${Number(stats.chiffreAffaires).toFixed(2)} €`} />
      </div>
      <h3 style={{ marginTop: 24 }}>Ventes Récentes</h3>
      <ul>
        {stats.recentVentes.map(v => (
          <li key={v.id}>
            {v.voiture_marque} {v.voiture_modele} — {v.client_prenom} {v.client_nom} — {new Date(v.date_vente).toLocaleString()} — {v.prix_vente} €
          </li>
        ))}
      </ul>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
      <div style={{ color: '#555', fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
