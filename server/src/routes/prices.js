import { Router } from 'express';

const router = Router();
const CG_BASE = 'https://api.coingecko.com/api/v3';
const CC_BASE = 'https://min-api.cryptocompare.com/data';
const CG_KEY = process.env.COINGECKO_API_KEY;
const CC_KEY = process.env.CRYPTOCOMPARE_API_KEY;

const cgHeaders = CG_KEY ? { 'x-cg-demo-api-key': CG_KEY } : {};
const ccHeaders = CC_KEY ? { 'authorization': `Apikey ${CC_KEY}` } : {};

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
  const key = `markets_cc_p${page}`;
  try {
    const data = await cached(key, 60_000, async () => {
      // CryptoCompare Top List by Market Cap
      const r = await fetch(
        `${CC_BASE}/top/mktcapfull?limit=25&tsym=USD&page=${page - 1}`,
        { headers: ccHeaders }
      );
      if (!r.ok) throw new Error(`CryptoCompare status: ${r.status}`);
      const json = await r.json();
      
      // Map to a common format similar to what we had
      return (json.Data || []).map(coin => ({
        id: coin.CoinInfo.Name.toLowerCase(), // Use symbol as ID fallback
        symbol: coin.CoinInfo.Name.toLowerCase(),
        name: coin.CoinInfo.FullName,
        image: `https://www.cryptocompare.com${coin.CoinInfo.ImageUrl}`,
        current_price: coin.RAW?.USD?.PRICE || 0,
        market_cap: coin.RAW?.USD?.MKTCAP || 0,
        total_volume: coin.RAW?.USD?.VOLUME24HOUR || 0,
        price_change_percentage_24h: coin.RAW?.USD?.CHANGEPCT24HOUR || 0,
        circulating_supply: coin.RAW?.USD?.SUPPLY || 0,
        ath: 0, // CryptoCompare doesn't give ATH in this endpoint
        sparkline_in_7d: { price: [] } // Handled separately or skipped
      }));
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
  const { id } = req.params; // Expecting symbol here for CC
  const days = req.query.days || 7;
  const key = `chart_cc_${id}_${days}`;
  try {
    const data = await cached(key, 60_000, async () => {
      const limit = days == 1 ? 24 : days;
      const endpoint = days == 1 ? 'v2/histohour' : 'v2/histoday';
      
      const r = await fetch(
        `${CC_BASE}/${endpoint}?fsym=${id.toUpperCase()}&tsym=USD&limit=${limit}`,
        { headers: ccHeaders }
      );
      if (!r.ok) throw new Error(`CryptoCompare status: ${r.status}`);
      const json = await r.json();
      
      // Format to match [timestamp, price]
      return {
        prices: (json.Data?.Data || []).map(d => [d.time * 1000, d.close])
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
  const { id } = req.params; // Expecting symbol
  const key = `coin_cc_${id}`;
  try {
    const data = await cached(key, 60_000, async () => {
      const r = await fetch(
        `${CC_BASE}/pricemultifull?fsyms=${id.toUpperCase()}&tsyms=USD`,
        { headers: ccHeaders }
      );
      if (!r.ok) throw new Error(`CryptoCompare status: ${r.status}`);
      const json = await r.json();
      
      if (!json.RAW || !json.RAW[id.toUpperCase()]) {
        throw new Error('Coin not found');
      }

      const raw = json.RAW[id.toUpperCase()].USD;
      return {
        current_price: raw.PRICE,
        market_cap: raw.MKTCAP,
        total_volume: raw.VOLUME24HOUR,
        price_change_percentage_24h: raw.CHANGEPCT24HOUR,
        circulating_supply: raw.SUPPLY,
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
  const ids = req.query.ids; // Symbols (BTC,ETH)
  if (!ids) return res.json({});
  try {
    const data = await cached(`batch_cc_${ids}`, 60_000, async () => {
      const r = await fetch(
        `${CC_BASE}/pricemultifull?fsyms=${ids.toUpperCase()}&tsyms=USD`,
        { headers: ccHeaders }
      );
      if (!r.ok) throw new Error(`CryptoCompare status: ${r.status}`);
      const json = await r.json();
      
      const prices = {};
      if (json.RAW) {
        Object.keys(json.RAW).forEach(symbol => {
          prices[symbol.toLowerCase()] = {
            usd: json.RAW[symbol].USD.PRICE,
            usd_24h_change: json.RAW[symbol].USD.CHANGEPCT24HOUR
          };
        });
      }
      return prices;
    });
    res.json(data);
  } catch (e) {
    console.error('Price route error:', e.message);
    const status = e.message.includes('status:') ? parseInt(e.message.split('status:')[1]) : 500;
    res.status(status === 429 ? 429 : 500).json({ 
      error: status === 429 ? 'CryptoCompare rate limit reached' : 'Failed to fetch data from CryptoCompare',
      status 
    });
  }
});

export default router;