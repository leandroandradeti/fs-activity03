const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(4),
      role: z.enum(['ORGANIZADOR', 'PARTICIPANTE'])
    });

    const { name, email, password, role } = schema.parse(req.body);

    const password_hash = await bcrypt.hash(password, 10);

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'email_already_used' });

    const r = await db.run('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)', [
      name,
      email,
      password_hash,
      role
    ]);

    const user = await db.get('SELECT id,name,email,role FROM users WHERE id = ?', [r.lastID]);

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1)
    });

    const { email, password } = schema.parse(req.body);

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const token = jwt.sign({
      userId: user.id,
      role: user.role,
      email: user.email,
      name: user.name
    }, secret, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await db.get('SELECT id,name,email,role FROM users WHERE id = ?', [userId]);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

