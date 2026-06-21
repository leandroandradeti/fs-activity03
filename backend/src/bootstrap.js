const db = require('./db');

async function bootstrap() {
  await db.init();
  console.log('Database initialized');
}

module.exports = { bootstrap };

