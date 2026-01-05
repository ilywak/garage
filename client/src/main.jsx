import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Voitures from './pages/Voitures.jsx';
import Clients from './pages/Clients.jsx';
import Ventes from './pages/Ventes.jsx';
import Auth from './pages/Auth.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/voitures" element={<Voitures />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/ventes" element={<Ventes />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </App>
    </BrowserRouter>
  </React.StrictMode>
);
