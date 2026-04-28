import { Router } from 'express';

const router = Router();
const BINANCE_BASE = 'https://api.binance.com/api/v3';

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
  const key = `markets_binance_p${page}`;
  try {
    const data = await cached(key, 60_000, async () => {
      // Binance 24hr ticker for all pairs
      const r = await fetch(`${BINANCE_BASE}/ticker/24hr`);
      if (!r.ok) throw new Error(`Binance status: ${r.status}`);
      const json = await r.json();
      
      // Filter for USDT pairs and sort by volume
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
          image: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`,
          current_price: parseFloat(m.lastPrice),
          market_cap: 0, // Binance doesn't provide market cap
          total_volume: parseFloat(m.quoteVolume),
          price_change_percentage_24h: parseFloat(m.priceChangePercent),
          circulating_supply: 0,
          ath: 0,
          sparkline_in_7d: { price: [] }
        };
      });
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
  const { id } = req.params; // Expecting symbol like 'btc'
  const days = req.query.days || 7;
  const key = `chart_binance_${id}_${days}`;
  try {
    const data = await cached(key, 60_000, async () => {
      const interval = days == 1 ? '1h' : '1d';
      const limit = days == 1 ? 24 : days;
      const symbol = id.toUpperCase() + 'USDT';
      
      const r = await fetch(
        `${BINANCE_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      if (!r.ok) throw new Error(`Binance status: ${r.status}`);
      const json = await r.json();
      
      return {
        prices: json.map(k => [k[0], parseFloat(k[4])]) // [openTime, closePrice]
      };
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
  const key = `coin_coincap_${id}`;
  try {
    const data = await cached(key, 60_000, async () => {
      const r = await fetch(
        `${CC_BASE}/assets/${id}`,
        { headers: ccHeaders }
      );
      if (!r.ok) throw new Error(`CoinCap status: ${r.status}`);
      const json = await r.json();
      
      const coin = json.data;
      return {
        current_price: parseFloat(coin.priceUsd),
        market_cap: parseFloat(coin.marketCapUsd),
        total_volume: parseFloat(coin.volumeUsd24Hr),
        price_change_percentage_24h: parseFloat(coin.changePercent24Hr),
        circulating_supply: parseFloat(coin.supply),
        ath: 0
      };
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
  const symbols = req.query.ids; // Actually symbols now: btc,eth
  if (!symbols) return res.json({});
  try {
    const data = await cached(`batch_binance_${symbols}`, 60_000, async () => {
      const symbolList = symbols.toUpperCase().split(',').map(s => `"${s}USDT"`);
      const r = await fetch(`${BINANCE_BASE}/ticker/24hr?symbols=[${symbolList.join(',')}]`);
      if (!r.ok) throw new Error(`Binance status: ${r.status}`);
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
    console.error('Price route error:', e.message);
    const status = e.message.includes('status:') ? parseInt(e.message.split('status:')[1]) : 500;
    res.status(status === 429 ? 429 : 500).json({ 
      error: status === 429 ? 'Binance rate limit reached' : 'Failed to fetch data from Binance',
      status 
    });
  }
});

export default router;