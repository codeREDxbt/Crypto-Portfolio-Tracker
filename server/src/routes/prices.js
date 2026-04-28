import { Router } from 'express';

const router = Router();
const BASE = 'https://api.coingecko.com/api/v3';
const KEY = process.env.COINGECKO_API_KEY;
const headers = KEY ? { 'x-cg-demo-api-key': KEY } : {};

const cache = new Map();

async function cached(key, ttlMs, fetchFn) {
  const hit = cache.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.data;

  try {
    const data = await fetchFn();
    // Only cache if we didn't get an error object from CoinGecko
    if (data && !data.error && !data.status?.error_code) {
      cache.set(key, { data, expiresAt: Date.now() + ttlMs });
    }
    return data;
  } catch (e) {
    console.error(`Fetch failed for ${key}:`, e);
    throw e;
  }
}

router.get('/markets', async (req, res) => {
  const page = req.query.page || 1;
  const key = `markets_p${page}`;
  try {
    const data = await cached(key, 60_000, async () => {
      const r = await fetch(
        `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=${page}&sparkline=true&price_change_percentage=24h,7d`,
        { headers }
      );
      if (!r.ok) throw new Error(`CoinGecko status: ${r.status}`);
      return r.json();
    });
    res.json(data);
  } catch (e) {
    console.error('Price route error:', e.message);
    const status = e.message.includes('status:') ? parseInt(e.message.split('status:')[1]) : 500;
    res.status(status === 429 ? 429 : 500).json({ 
      error: status === 429 ? 'CoinGecko rate limit reached' : 'Failed to fetch data from CoinGecko',
      status 
    });
  }
});

router.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);
  try {
    const data = await cached(`search_${q}`, 30_000, async () => {
      const r = await fetch(`${BASE}/search?query=${encodeURIComponent(q)}`, { headers });
      if (!r.ok) throw new Error(`CoinGecko status: ${r.status}`);
      const json = await r.json();
      return json.coins?.slice(0, 10) || [];
    });
    res.json(data);
  } catch (e) {
    console.error('Price route error:', e.message);
    const status = e.message.includes('status:') ? parseInt(e.message.split('status:')[1]) : 500;
    res.status(status === 429 ? 429 : 500).json({ 
      error: status === 429 ? 'CoinGecko rate limit reached' : 'Failed to fetch data from CoinGecko',
      status 
    });
  }
});

router.get('/chart/:id', async (req, res) => {
  const { id } = req.params;
  const days = req.query.days || 7;
  const key = `chart_${id}_${days}`;
  try {
    const data = await cached(key, 60_000, async () => {
      const r = await fetch(
        `${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
        { headers }
      );
      if (!r.ok) throw new Error(`CoinGecko status: ${r.status}`);
      return r.json();
    });
    res.json(data);
  } catch (e) {
    console.error('Price route error:', e.message);
    const status = e.message.includes('status:') ? parseInt(e.message.split('status:')[1]) : 500;
    res.status(status === 429 ? 429 : 500).json({ 
      error: status === 429 ? 'CoinGecko rate limit reached' : 'Failed to fetch data from CoinGecko',
      status 
    });
  }
});

router.get('/coin/:id', async (req, res) => {
  const { id } = req.params;
  const key = `coin_${id}`;
  try {
    const data = await cached(key, 60_000, async () => {
      const r = await fetch(
        `${BASE}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`,
        { headers }
      );
      if (!r.ok) throw new Error(`CoinGecko status: ${r.status}`);
      return r.json();
    });
    res.json(data);
  } catch (e) {
    console.error('Price route error:', e.message);
    const status = e.message.includes('status:') ? parseInt(e.message.split('status:')[1]) : 500;
    res.status(status === 429 ? 429 : 500).json({ 
      error: status === 429 ? 'CoinGecko rate limit reached' : 'Failed to fetch data from CoinGecko',
      status 
    });
  }
});

router.get('/batch', async (req, res) => {
  const ids = req.query.ids;
  if (!ids) return res.json({});
  try {
    const data = await cached(`batch_${ids}`, 60_000, async () => {
      const r = await fetch(
        `${BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        { headers }
      );
      if (!r.ok) throw new Error(`CoinGecko status: ${r.status}`);
      return r.json();
    });
    res.json(data);
  } catch (e) {
    console.error('Price route error:', e.message);
    const status = e.message.includes('status:') ? parseInt(e.message.split('status:')[1]) : 500;
    res.status(status === 429 ? 429 : 500).json({ 
      error: status === 429 ? 'CoinGecko rate limit reached' : 'Failed to fetch data from CoinGecko',
      status 
    });
  }
});

export default router;