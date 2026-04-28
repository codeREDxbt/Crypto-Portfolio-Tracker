import express from 'express';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 });
const BASE = 'https://api.coincap.io/v2';

// Helper to get Coin Icon URL (Premium CoinCap Assets)
const getIconUrl = (symbol) => `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;

async function fetchWithHeaders(url) {
  const r = await fetch(url, {
    headers: { 'Accept-Encoding': 'gzip' }
  });
  if (!r.ok) throw new Error(`Status: ${r.status}`);
  return r.json();
}

router.get('/markets', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 25;
  const offset = (page - 1) * limit;
  const cacheKey = `markets_v2_${page}`;

  try {
    const data = await (async () => {
      const hit = cache.get(cacheKey);
      if (hit) return hit;

      const { data: rawData } = await fetchWithHeaders(`${BASE}/assets?limit=${limit}&offset=${offset}`);
      const coins = rawData.map(c => ({
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        image: getIconUrl(c.symbol),
        current_price: parseFloat(c.priceUsd),
        market_cap: parseFloat(c.marketCapUsd),
        market_cap_rank: parseInt(c.rank),
        price_change_percentage_24h: parseFloat(c.changePercent24Hr),
        sparkline_in_7d: { price: [] } // CoinCap doesn't provide sparklines in this endpoint
      }));

      cache.set(cacheKey, coins, 60);
      return coins;
    })();

    res.json(data);
  } catch (e) {
    console.error('CoinCap Markets Error:', e.message);
    res.status(500).json({ error: 'Failed to fetch markets', details: e.message });
  }
});

router.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);
  try {
    const { data: rawData } = await fetchWithHeaders(`${BASE}/assets?search=${q}&limit=10`);
    const results = rawData.map(c => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      thumb: getIconUrl(c.symbol),
      market_cap_rank: parseInt(c.rank)
    }));
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/chart/:id', async (req, res) => {
  const { id } = req.params;
  const days = req.query.days || 7;
  const interval = days == 1 ? 'm15' : 'd1';
  
  try {
    const cacheKey = `chart_${id}_${days}`;
    const data = await (async () => {
      const hit = cache.get(cacheKey);
      if (hit) return hit;

      const { data: rawData } = await fetchWithHeaders(`${BASE}/assets/${id.toLowerCase()}/history?interval=${interval}`);
      const prices = rawData.map(p => [p.time, parseFloat(p.priceUsd)]);
      
      const result = { prices };
      cache.set(cacheKey, result, 300);
      return result;
    })();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Chart failed' });
  }
});

router.get('/coin/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: c } = await fetchWithHeaders(`${BASE}/assets/${id.toLowerCase()}`);
    res.json({
      current_price: parseFloat(c.priceUsd),
      market_cap: parseFloat(c.marketCapUsd),
      total_volume: parseFloat(c.volumeUsd24Hr),
      price_change_percentage_24h: parseFloat(c.changePercent24Hr),
      circulating_supply: parseFloat(c.supply),
      ath: 0 // Not provided by CoinCap
    });
  } catch (e) {
    res.status(500).json({ error: 'Coin detail failed' });
  }
});

router.get('/batch', async (req, res) => {
  const { ids } = req.query;
  if (!ids) return res.json({});
  try {
    const { data: rawData } = await fetchWithHeaders(`${BASE}/assets?ids=${ids.toLowerCase()}`);
    const prices = {};
    rawData.forEach(c => {
      prices[c.id] = {
        current_price: parseFloat(c.priceUsd),
        price_change_percentage_24h: parseFloat(c.changePercent24Hr)
      };
    });
    res.json(prices);
  } catch (e) {
    res.status(500).json({ error: 'Batch failed' });
  }
});

export default router;