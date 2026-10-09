/* Configuration lue dans les variables d'environnement (voir .env.example) */
const list = (value, fallback) => (value || fallback).split(',').map((s) => s.trim()).filter(Boolean);

export function loadConfig(env = process.env) {
  const isProd = env.NODE_ENV === 'production';
  const config = {
    isProd,
    port: Number(env.PORT) || 3000,
    // En local et pour les tests : PGlite (PostgreSQL en WebAssembly, rien à installer)
    databaseUrl: env.DATABASE_URL || 'pglite://memory',
    jwtSecret: env.JWT_SECRET,
    // Origines autorisées à appeler l'API depuis un navigateur
    corsOrigins: list(env.CORS_ORIGINS, 'http://localhost,http://127.0.0.1,http://localhost:5173,http://localhost:4173,https://danidois2002.github.io'),
    // Compte admin privé : créé ou mis à jour au démarrage si ADMIN_PASSWORD est défini
    adminUsername: env.ADMIN_USERNAME || 'admin',
    adminPassword: env.ADMIN_PASSWORD || '',
    // Limites anti-abus (par adresse IP)
    loginLimit: Number(env.LOGIN_LIMIT) || 10,
    orderLimit: Number(env.ORDER_LIMIT) || 30,
  };
  if (!config.jwtSecret) {
    if (isProd) throw new Error('JWT_SECRET est obligatoire en production');
    config.jwtSecret = 'secret-de-developpement-uniquement';
  }
  return config;
}
