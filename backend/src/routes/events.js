const express = require('express');
const { z } = require('zod');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function computeStatus(datetimeISO) {
  const now = new Date();
  const dt = new Date(datetimeISO);
  if (dt.getTime() < now.getTime()) return 'finalizado';
  // simples: se for no mesmo instante/até agora consideraria ocorrendo; aqui usamos margem de 1 dia
  const diff = dt.getTime() - now.getTime();
  if (diff <= 24 * 60 * 60 * 1000) return 'ocorrendo';
  return 'futuro';
}

async function withRemaining(event) {
  const enrolledRow = await db.get(
    'SELECT COUNT(*) as c FROM event_inscriptions WHERE event_id = ?',
    [event.id]
  );
  const enrolled = enrolledRow?.c || 0;
  const remaining = Math.max(0, event.capacity - enrolled);
  const status = computeStatus(event.datetime);
  return { ...event, enrolled, remaining, status };
}

router.get('/events', async (req, res, next) => {
  try {
    const { category, q, sort } = req.query;
    const where = [];
    const params = [];

    if (category) {
      where.push('category = ?');
      params.push(category);
    }

    if (q) {
      where.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    const order = sort === 'desc' ? 'datetime DESC' : 'datetime ASC';
    const sql = `SELECT * FROM events ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${order}`;

    const rows = await db.all(sql, params);
    const events = [];
    for (const e of rows) events.push(await withRemaining(e));

    res.json({ events });
  } catch (err) {
    next(err);
  }
});

router.get('/events/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) return res.status(404).json({ error: 'event_not_found' });
    res.json({ event: await withRemaining(event) });
  } catch (err) {
    next(err);
  }
});

// Organizador: meus eventos
router.get('/organizer/events', requireAuth, async (req, res, next) => {
  try {
    const organizerId = req.user.userId;
    const rows = await db.all('SELECT * FROM events WHERE organizer_id = ? ORDER BY datetime ASC', [organizerId]);
    const events = [];
    for (const e of rows) events.push(await withRemaining(e));
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

router.post('/organizer/events', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'ORGANIZADOR') return res.status(403).json({ error: 'forbidden' });

    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      datetime: z.string().min(1),
      location: z.string().min(1),
      category: z.string().min(1),
      capacity: z.coerce.number().int().min(1),
      imageUrl: z.string().optional().nullable()
    });

    const payload = schema.parse(req.body);

    const status = computeStatus(payload.datetime);
    // regra sugerida: pode editar/excluir enquanto ainda não ocorreu (futuro)
    if (status !== 'futuro') {
      return res.status(400).json({ error: 'event_already_started' });
    }

    const r = await db.run(
      'INSERT INTO events (organizer_id,title,description,datetime,location,category,capacity,image_url) VALUES (?,?,?,?,?,?,?,?)',
      [
        req.user.userId,
        payload.title,
        payload.description,
        payload.datetime,
        payload.location,
        payload.category,
        payload.capacity,
        payload.imageUrl || null
      ]
    );

    const event = await db.get('SELECT * FROM events WHERE id = ?', [r.lastID]);
    res.status(201).json({ event: await withRemaining(event) });
  } catch (err) {
    next(err);
  }
});

router.put('/organizer/events/:id', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'ORGANIZADOR') return res.status(403).json({ error: 'forbidden' });

    const { id } = req.params;
    const existing = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'event_not_found' });
    if (existing.organizer_id !== req.user.userId) return res.status(403).json({ error: 'forbidden' });

    const status = computeStatus(existing.datetime);
    if (status !== 'futuro') return res.status(400).json({ error: 'event_already_started' });

    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      datetime: z.string().min(1),
      location: z.string().min(1),
      category: z.string().min(1),
      capacity: z.coerce.number().int().min(1),
      imageUrl: z.string().optional().nullable()
    });

    const payload = schema.parse(req.body);

    await db.run(
      'UPDATE events SET title=?, description=?, datetime=?, location=?, category=?, capacity=?, image_url=? WHERE id=?',
      [
        payload.title,
        payload.description,
        payload.datetime,
        payload.location,
        payload.category,
        payload.capacity,
        payload.imageUrl || null,
        id
      ]
    );

    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    res.json({ event: await withRemaining(event) });
  } catch (err) {
    next(err);
  }
});

router.delete('/organizer/events/:id', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'ORGANIZADOR') return res.status(403).json({ error: 'forbidden' });

    const { id } = req.params;
    const existing = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'event_not_found' });
    if (existing.organizer_id !== req.user.userId) return res.status(403).json({ error: 'forbidden' });

    const status = computeStatus(existing.datetime);
    if (status !== 'futuro') return res.status(400).json({ error: 'event_already_started' });

    await db.run('DELETE FROM events WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Inscrição (participante)
router.post('/events/:id/inscriptions', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'PARTICIPANTE') return res.status(403).json({ error: 'forbidden' });

    const { id } = req.params;
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) return res.status(404).json({ error: 'event_not_found' });

    const enrolledRow = await db.get('SELECT COUNT(*) as c FROM event_inscriptions WHERE event_id = ?', [id]);
    const enrolled = enrolledRow?.c || 0;

    if (enrolled >= event.capacity) return res.status(400).json({ error: 'no_vacancies' });

    // evita duplicado pela PK
    await db.run('INSERT OR IGNORE INTO event_inscriptions (event_id, user_id) VALUES (?,?)', [id, req.user.userId]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/events/:id/inscriptions', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'PARTICIPANTE') return res.status(403).json({ error: 'forbidden' });

    const { id } = req.params;
    await db.run('DELETE FROM event_inscriptions WHERE event_id = ? AND user_id = ?', [id, req.user.userId]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/me/inscriptions', requireAuth, async (req, res, next) => {
  try {
    const rows = await db.all(
      `SELECT e.id as eventId, e.title, e.datetime, u.name as organizerName
       FROM event_inscriptions i
       JOIN events e ON e.id = i.event_id
       JOIN users u ON u.id = e.organizer_id
       WHERE i.user_id = ?
       ORDER BY e.datetime ASC`,
      [req.user.userId]
    );

    res.json({ inscriptions: rows });
  } catch (err) {
    next(err);
  }
});

// Organizador: lista de inscritos por evento
router.get('/organizer/events/:id/inscriptions', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'ORGANIZADOR') return res.status(403).json({ error: 'forbidden' });

    const { id } = req.params;
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);
    if (!event) return res.status(404).json({ error: 'event_not_found' });
    if (event.organizer_id !== req.user.userId) return res.status(403).json({ error: 'forbidden' });

    const participants = await db.all(
      `SELECT u.id as user_id, u.name, u.email, i.created_at
       FROM event_inscriptions i
       JOIN users u ON u.id = i.user_id
       WHERE i.event_id = ?
       ORDER BY i.created_at ASC`,
      [id]
    );

    res.json({
      event: await withRemaining(event),
      participants
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

