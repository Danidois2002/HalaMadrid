/* Point d'entrée : connexion à la base, préparation, puis écoute HTTP */
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { connect } from './db.js';
import { setupDatabase } from './setup.js';

const config = loadConfig();
const db = await connect(config.databaseUrl);
await setupDatabase(db, config);

const server = createApp({ db, config }).listen(config.port, () => {
  console.log(`API ¡Hala Madrid! prête sur http://localhost:${config.port}/api/health`);
});

async function shutdown() {
  server.close();
  await db.close();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
