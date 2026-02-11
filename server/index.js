import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, getConnection } from './db.js';

dotenv.config();

const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { email, password, nom, prenom, garage_id } = req.body || {};
  if (!email || !password || !nom || !prenom) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'Email already registered' });
    const password_hash = await bcrypt.hash(password, 10);
    const conn = await getConnection();
    try {
      await conn.beginTransaction();
      const [userResult] = await conn.query(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
        [email, password_hash, 'employe']
      );
      const user_id = userResult.insertId;
      await conn.query(
        'INSERT INTO profiles (user_id, nom, prenom, email, garage_id) VALUES (?, ?, ?, ?, ?)',
        [user_id, nom, prenom, email, garage_id || null]
      );
      await conn.commit();
      const token = jwt.sign({ user_id, role: 'employe' }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  try {
    const rows = await query('SELECT id, password_hash, role FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ user_id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const [[{ totalVoitures }]] = await Promise.all([
      query('SELECT COUNT(*) AS totalVoitures FROM voitures'),
    ]);
    const [[{ voituresDisponibles }]] = await Promise.all([
      query('SELECT COUNT(*) AS voituresDisponibles FROM voitures WHERE disponible = 1'),
    ]);
    const [[{ totalClients }]] = await Promise.all([
      query('SELECT COUNT(*) AS totalClients FROM clients'),
    ]);
    const [[{ totalVentes }]] = await Promise.all([
      query('SELECT COUNT(*) AS totalVentes FROM ventes'),
    ]);
    const [[{ chiffreAffaires }]] = await Promise.all([
      query('SELECT COALESCE(SUM(prix_vente),0) AS chiffreAffaires FROM ventes'),
    ]);
    const recentVentes = await query(
      `SELECT v.id, v.prix_vente, v.date_vente,
              c.nom AS client_nom, c.prenom AS client_prenom,
              vt.marque AS voiture_marque, vt.modele AS voiture_modele
       FROM ventes v
       JOIN clients c ON c.id = v.client_id
       JOIN voitures vt ON vt.id = v.voiture_id
       ORDER BY v.date_vente DESC
       LIMIT 5`
    );
    res.json({
      totalVoitures,
      voituresDisponibles,
      totalClients,
      totalVentes,
      chiffreAffaires,
      recentVentes,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/voitures', authMiddleware, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM voitures ORDER BY updated_at DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/voitures', authMiddleware, async (req, res) => {
  const {
    garage_id, marque, modele, annee, prix, kilometrage,
    carburant, etat, disponible, couleur, description, image_url,
  } = req.body || {};
  if (!marque || !modele || !annee || !prix || !carburant || !etat) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await query(
      `INSERT INTO voitures
       (garage_id, marque, modele, annee, prix, kilometrage, carburant, etat, disponible, couleur, description, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        garage_id || null, marque, modele, annee, prix, kilometrage || 0, carburant, etat,
        disponible ? 1 : 0, couleur || null, description || null, image_url || null,
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/voitures/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const fields = [
    'garage_id', 'marque', 'modele', 'annee', 'prix', 'kilometrage',
    'carburant', 'etat', 'disponible', 'couleur', 'description', 'image_url',
  ];
  const values = [];
  const sets = [];
  for (const f of fields) {
    if (f in req.body) {
      sets.push(`${f} = ?`);
      let v = req.body[f];
      if (f === 'disponible') v = v ? 1 : 0;
      values.push(v);
    }
  }
  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
  try {
    await query(`UPDATE voitures SET ${sets.join(', ')} WHERE id = ?`, [...values, id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/voitures/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM voitures WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/clients', authMiddleware, async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM clients ORDER BY updated_at DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/clients', authMiddleware, async (req, res) => {
  const { garage_id, nom, prenom, email, telephone, adresse } = req.body || {};
  if (!garage_id || !nom || !prenom) return res.status(400).json({ error: 'Missing fields' });
  try {
    const result = await query(
      `INSERT INTO clients (garage_id, nom, prenom, email, telephone, adresse)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [garage_id, nom, prenom, email || null, telephone || null, adresse || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/clients/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const fields = ['garage_id', 'nom', 'prenom', 'email', 'telephone', 'adresse'];
  const values = [];
  const sets = [];
  for (const f of fields) {
    if (f in req.body) {
      sets.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
  try {
    await query(`UPDATE clients SET ${sets.join(', ')} WHERE id = ?`, [...values, id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/clients/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/ventes', authMiddleware, async (_req, res) => {
  try {
    const rows = await query(
      `SELECT v.*, c.nom AS client_nom, c.prenom AS client_prenom,
              vt.marque AS voiture_marque, vt.modele AS voiture_modele
       FROM ventes v
       JOIN clients c ON c.id = v.client_id
       JOIN voitures vt ON vt.id = v.voiture_id
       ORDER BY v.date_vente DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/ventes', authMiddleware, async (req, res) => {
  const { voiture_id, client_id, employe_id, garage_id, prix_vente, notes } = req.body || {};
  if (!voiture_id || !client_id || !employe_id || !garage_id || !prix_vente) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const result = await query(
      `INSERT INTO ventes (voiture_id, client_id, employe_id, garage_id, prix_vente, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [voiture_id, client_id, employe_id, garage_id, prix_vente, notes || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
