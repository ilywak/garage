import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function App({ children }) {
  const { pathname } = useLocation();
  return (
    <div style={{ fontFamily: 'system-ui, Arial', minHeight: '100vh' }}>
      <header style={{ display: 'flex', gap: 16, padding: 16, borderBottom: '1px solid #ddd' }}>
        <strong>Autosales Hub (MySQL + JS)</strong>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/dashboard" style={{ color: pathname === '/dashboard' ? '#000' : '#555' }}>Dashboard</Link>
          <Link to="/voitures" style={{ color: pathname === '/voitures' ? '#000' : '#555' }}>Voitures</Link>
          <Link to="/clients" style={{ color: pathname === '/clients' ? '#000' : '#555' }}>Clients</Link>
          <Link to="/ventes" style={{ color: pathname === '/ventes' ? '#000' : '#555' }}>Ventes</Link>
          <Link to="/auth" style={{ marginLeft: 'auto' }}>Auth</Link>
        </nav>
      </header>
      <main style={{ padding: 16 }}>{children}</main>
    </div>
  );
}
