require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();

// ========== CORS：明确指定源 + 允许凭证 ==========
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// ================================================

app.use(express.json());

// 获取候选人列表
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
app.post('/api/vote', async (req, res) => {
  const { candidateId } = req.body;
  if (!candidateId) return res.status(400).json({ error: 'missing candidateId' });

  // 简单防重复：检查 cookie
  const hasVoted = req.headers.cookie && req.headers.cookie.includes('voted=true');
  if (hasVoted) return res.status(403).json({ error: 'already voted' });

  try {
    await pool.query('UPDATE candidates SET votes = votes + 1 WHERE id = $1', [candidateId]);
    res.setHeader('Set-Cookie', 'voted=true; Max-Age=86400; Path=/; HttpOnly');
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'db error' });
  }
});

// 兜底 404
app.use((_req, res) => res.status(404).json({ error: 'not found' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));