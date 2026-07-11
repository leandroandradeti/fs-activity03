const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const { errorHandler } = require('./middleware/errorHandler');
const { bootstrap } = require('./bootstrap');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => res.json({ ok: true, service: 'events-api' }));
app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/', eventsRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 5191;
bootstrap()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error('Failed to init backend', e);
    process.exit(1);
  });
