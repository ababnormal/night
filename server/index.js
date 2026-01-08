import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { mustLogin } from './auth.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// 注册
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'missing field' });
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1,$2)', [username, hash]);
    res.json({ success: true });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'username exists' });
    console.error(e);
    res.status(500).json({ error: 'db error' });
  }
});

// 登录
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'missing field' });
  try {
    const { rows } = await pool.query('SELECT id, password FROM users WHERE username=$1', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'invalid credential' });
    const ok = await bcrypt.compare(password, rows[0].password);
    if (!ok) return res.status(401).json({ error: 'invalid credential' });
    const token = jwt.sign({ userId: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'db error' });
  }
});

// 候选人列表
app.get('/api/candidates', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM candidates ORDER BY id');
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'db error' });
  }
});

// 投票
app.post('/api/vote', mustLogin, async (req, res) => {
  const { candidateId } = req.body;
  if (!candidateId) return res.status(400).json({ error: 'missing candidateId' });
  const userId = req.user.userId;
  try {
    await pool.query('INSERT INTO votes (user_id, candidate_id) VALUES ($1,$2)', [userId, candidateId]);
    await pool.query('UPDATE candidates SET votes = votes + 1 WHERE id = $1', [candidateId]);
    res.json({ success: true });
  } catch (e) {
    if (e.code === '23505') return res.status(403).json({ error: 'already voted' });
    console.error(e);
    res.status(500).json({ error: 'db error' });
  }
});

app.use((_req, res) => res.status(404).json({ error: 'not found' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API on :${PORT}`));