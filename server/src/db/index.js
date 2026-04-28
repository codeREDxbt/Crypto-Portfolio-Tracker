import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

const client = createClient({
  url: 'file:./sqlite.db',
});

// Auto-create tables if they don't exist (works on fresh Railway deployments)
await client.execute(`CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id TEXT PRIMARY KEY,
  coin_id TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_image TEXT,
  quantity REAL NOT NULL,
  avg_buy_price REAL NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
)`);

await client.execute(`CREATE TABLE IF NOT EXISTS watchlist_items (
  id TEXT PRIMARY KEY,
  coin_id TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  coin_image TEXT,
  added_at INTEGER NOT NULL DEFAULT (unixepoch())
)`);

await client.execute(`CREATE TABLE IF NOT EXISTS price_alerts (
  id TEXT PRIMARY KEY,
  coin_id TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  target_price REAL NOT NULL,
  condition TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  is_triggered INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
)`);

export const db = drizzle(client, { schema });