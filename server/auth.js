import jwt from 'jsonwebtoken';

export function mustLogin(req, res, next) {
  const hdr = req.headers.authorization;
  if (!hdr) return res.status(401).json({ error: 'missing token' });
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : hdr;
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}