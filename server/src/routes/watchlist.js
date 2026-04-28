import { Router } from 'express';
import { db } from '../db/index.js';
import { watchlistItems, priceAlerts } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  const items = await db.select().from(watchlistItems);
  res.json(items);
});

router.post('/', async (req, res) => {
  const { coinId, coinSymbol, coinName, coinImage } = req.body;

  const existing = await db.select().from(watchlistItems)
    .where(eq(watchlistItems.coinId, coinId)).get();

  if (existing) {
    return res.json(existing);
  }

  const item = await db.insert(watchlistItems).values({
    coinId, coinSymbol, coinName, coinImage,
  }).returning().get();
  res.status(201).json(item);
});

router.delete('/:id', async (req, res) => {
  await db.delete(watchlistItems)
    .where(eq(watchlistItems.id, req.params.id));
  res.status(204).send();
});

router.get('/alerts', async (req, res) => {
  const { coinId } = req.query;
  if (!coinId) {
    const alerts = await db.select().from(priceAlerts);
    return res.json(alerts);
  }
  const alerts = await db.select().from(priceAlerts)
    .where(eq(priceAlerts.coinId, coinId));
  res.json(alerts);
});

router.post('/alerts', async (req, res) => {
  const { coinId, coinSymbol, targetPrice, condition } = req.body;
  const alert = await db.insert(priceAlerts).values({
    coinId, coinSymbol, targetPrice, condition,
  }).returning().get();
  res.status(201).json(alert);
});

router.delete('/alerts/:id', async (req, res) => {
  await db.delete(priceAlerts)
    .where(eq(priceAlerts.id, req.params.id));
  res.status(204).send();
});

export default router;