import { Router } from 'express';

const router = Router();
const BINANCE_BASE = 'https://api.binance.com/api/v3';

const cache = new Map();

async function cached(key, ttlMs, fetchFn) {
  const hit = cache.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.data;

  try {
    const data = await fetchFn();
    if (data && !data.error) {
      cache.set(key, { data, expiresAt: Date.now() + ttlMs });
    }
    return data;
  } catch (e) {
    console.error(`Fetch failed for ${key}:`, e.message);
    throw e;
  }
}

const fetchWithHeaders = (url) => fetch(url, {
  headers: { 'User-Agent': 'CryptoPortfolioTracker/1.0' }
});

// Helper to get Coin Icon URL (using a premium, high-resolution icon pack)
const getIconUrl = (symbol) => `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;

router.get('/markets', async (req, res) => {
  const page = req.query.page || 1;
  const key = `markets_binance_p${page}`;
  try {
    const data = await cached(key, 60_000, async () => {
      const r = await fetchWithHeaders(`${BINANCE_BASE}/ticker/24hr`);
      if (!r.ok) throw new Error(`Binance status: ${r.status}`);
      const json = await r.json();
      
      const markets = json
        .filter(t => t.symbol.endsWith('USDT') && !t.symbol.includes('UP') && !t.symbol.includes('DOWN'))
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
        .slice((page - 1) * 25, page * 25);
        
      return markets.map(m => {
        const symbol = m.symbol.replace('USDT', '');
        return {
          id: symbol.toLowerCase(),
          symbol: symbol.toLowerCase(),
          name: symbol,
          image: getIconUrl(symbol),
          current_price: parseFloat(m.lastPrice),
          market_cap: 0,
          total_volume: parseFloat(m.quoteVolume),
          price_change_percentage_24h: parseFloat(m.priceChangePercent),
          circulating_supply: 0,
          ath: 0
        };
      });
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch from Binance', details: e.message });
  }
});

router.get('/search', async (req, res) => {
  const q = req.query.q?.toUpperCase();
  if (!q) return res.json([]);
  try {
    const data = await cached(`search_${q}`, 60_000, async () => {
      const r = await fetchWithHeaders(`${BINANCE_BASE}/ticker/price`);
      const json = await r.json();
      return json
        .filter(t => t.symbol.includes(q) && t.symbol.endsWith('USDT'))
        .slice(0, 10)
        .map(t => {
          const symbol = t.symbol.replace('USDT', '');
          return {
            id: symbol.toLowerCase(),
            symbol: symbol.toLowerCase(),
            name: symbol,
            image: getIconUrl(symbol)
          };
        });
    });
    res.json(data);
  } catch (e) {
    res.json([]);
  }
});

router.get('/chart/:id', async (req, res) => {
  const { id } = req.params;
  const days = req.query.days || 7;
  try {
    const data = await cached(`chart_${id}_${days}`, 60_000, async () => {
      const interval = days == 1 ? '1h' : '1d';
      const limit = days == 1 ? 24 : days;
      const symbol = id.toUpperCase() + 'USDT';
      const r = await fetchWithHeaders(`${BINANCE_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
      const json = await r.json();
      return { prices: json.map(k => [k[0], parseFloat(k[4])]) };
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch chart' });
  }
});

router.get('/coin/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await cached(`coin_${id}`, 60_000, async () => {
      const symbol = id.toUpperCase() + 'USDT';
      const r = await fetchWithHeaders(`${BINANCE_BASE}/ticker/24hr?symbol=${symbol}`);
      const json = await r.json();
      return {
        current_price: parseFloat(json.lastPrice),
        market_cap: 0,
        total_volume: parseFloat(json.quoteVolume),
        price_change_percentage_24h: parseFloat(json.priceChangePercent),
        circulating_supply: 0,
        ath: 0
      };
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch coin data' });
  }
});

router.get('/batch', async (req, res) => {
  const symbols = req.query.ids;
  if (!symbols) return res.json({});
  try {
    const data = await cached(`batch_${symbols}`, 60_000, async () => {
      const symbolList = symbols.toUpperCase().split(',').map(s => `"${s}USDT"`);
      const r = await fetchWithHeaders(`${BINANCE_BASE}/ticker/24hr?symbols=[${symbolList.join(',')}]`);
      const json = await r.json();
      const prices = {};
      const items = Array.isArray(json) ? json : [json];
      items.forEach(t => {
        const s = t.symbol.replace('USDT', '').toLowerCase();
        prices[s] = {
          usd: parseFloat(t.lastPrice),
          usd_24h_change: parseFloat(t.priceChangePercent)
        };
      });
      return prices;
    });
    res.json(data);
  } catch (e) {
    res.json({});
  }
});

export default router;