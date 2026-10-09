-- Schéma de la base ¡Hala Madrid! (idempotent : peut être rejoué à chaque démarrage)

CREATE TABLE IF NOT EXISTS users (
  id            serial PRIMARY KEY,
  username      text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  -- admin : tous les droits · demo : compte public, ne peut supprimer que ce qu'il a créé
  role          text NOT NULL CHECK (role IN ('admin', 'demo')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id       text PRIMARY KEY,
  name     text NOT NULL,
  short    text NOT NULL,
  season   text NOT NULL,
  feminine boolean NOT NULL DEFAULT false,
  photo    text,
  intro    text NOT NULL DEFAULT '',
  staff    jsonb NOT NULL DEFAULT '[]',
  lineup   jsonb NOT NULL DEFAULT '{}',
  sort     int NOT NULL DEFAULT 0
);

-- Contenus créés avec le compte démo : expires_at est rempli, ils disparaissent au bout de 24 h
CREATE TABLE IF NOT EXISTS players (
  id         text PRIMARY KEY,
  team_id    text NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
  name       text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 40),
  short      text,
  pos        text NOT NULL CHECK (pos IN ('GK', 'DEF', 'MID', 'ATT')),
  photo      text,
  sort       int NOT NULL DEFAULT 0,
  created_by int REFERENCES users (id) ON DELETE SET NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS players_team_idx ON players (team_id, sort);

CREATE TABLE IF NOT EXISTS news (
  id           text PRIMARY KEY,
  title        text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 80),
  cat          text NOT NULL,
  img          text NOT NULL DEFAULT '',
  created_by   int REFERENCES users (id) ON DELETE SET NULL,
  expires_at   timestamptz,
  published_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS news_published_idx ON news (published_at DESC);

CREATE TABLE IF NOT EXISTS products (
  id          text PRIMARY KEY,
  type        text NOT NULL CHECK (type IN ('jersey', 'scarf', 'ball')),
  name        text NOT NULL,
  tag         text NOT NULL DEFAULT '',
  price_cents int NOT NULL CHECK (price_cents > 0),
  description text NOT NULL DEFAULT '',
  kit         jsonb,
  sort        int NOT NULL DEFAULT 0
);

-- Commandes : anonymes (aucune donnée personnelle), montants en centimes calculés par le serveur
CREATE TABLE IF NOT EXISTS orders (
  id             serial PRIMARY KEY,
  reference      text NOT NULL UNIQUE,
  subtotal_cents int NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents int NOT NULL CHECK (shipping_cents >= 0),
  total_cents    int NOT NULL CHECK (total_cents >= 0),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id               serial PRIMARY KEY,
  order_id         int NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id       text NOT NULL REFERENCES products (id),
  size             text CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  flocage_name     text,
  flocage_number   int CHECK (flocage_number BETWEEN 0 AND 99),
  qty              int NOT NULL CHECK (qty BETWEEN 1 AND 10),
  unit_price_cents int NOT NULL CHECK (unit_price_cents > 0)
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);
