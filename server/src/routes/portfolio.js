import { Router } from 'express';
import { db } from '../db/index.js';
import { portfolioHoldings } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  const holdings = await db.select().from(portfolioHoldings);
  res.json(holdings);
});

router.post('/', async (req, res) => {
  const { coinId, coinSymbol, coinName, coinImage, quantity, avgBuyPrice, notes } = req.body;

  const rows = await db.select().from(portfolioHoldings)
    .where(eq(portfolioHoldings.coinId, coinId));
  const existing = rows[0];

  if (existing) {
    const totalQty = existing.quantity + quantity;
    const newAvg = ((existing.avgBuyPrice * existing.quantity) + (avgBuyPrice * quantity)) / totalQty;
    const updatedRows = await db.update(portfolioHoldings)
      .set({ quantity: totalQty, avgBuyPrice: newAvg })
      .where(eq(portfolioHoldings.id, existing.id))
      .returning();
    return res.json(updatedRows[0]);
  }

  const insertedRows = await db.insert(portfolioHoldings).values({
    coinId, coinSymbol, coinName, coinImage,
    quantity, avgBuyPrice, notes,
  }).returning();
  res.status(201).json(insertedRows[0]);
});

router.patch('/:id', async (req, res) => {
  const { quantity, avgBuyPrice, notes } = req.body;
  const updatedRows = await db.update(portfolioHoldings)
    .set({ quantity, avgBuyPrice, notes })
    .where(eq(portfolioHoldings.id, req.params.id))
    .returning();
  if (!updatedRows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(updatedRows[0]);
});

router.delete('/:id', async (req, res) => {
  await db.delete(portfolioHoldings)
    .where(eq(portfolioHoldings.id, req.params.id));
  res.status(204).send();
});

export default router;