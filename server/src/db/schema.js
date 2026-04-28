import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const portfolioHoldings = sqliteTable('portfolio_holdings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  coinId: text('coin_id').notNull(),
  coinSymbol: text('coin_symbol').notNull(),
  coinName: text('coin_name').notNull(),
  coinImage: text('coin_image'),
  quantity: real('quantity').notNull(),
  avgBuyPrice: real('avg_buy_price').notNull(),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const watchlistItems = sqliteTable('watchlist_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  coinId: text('coin_id').notNull(),
  coinSymbol: text('coin_symbol').notNull(),
  coinName: text('coin_name').notNull(),
  coinImage: text('coin_image'),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const priceAlerts = sqliteTable('price_alerts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  coinId: text('coin_id').notNull(),
  coinSymbol: text('coin_symbol').notNull(),
  targetPrice: real('target_price').notNull(),
  condition: text('condition').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isTriggered: integer('is_triggered', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});