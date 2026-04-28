import { useQuery } from '@tanstack/react-query';

const BINANCE = 'https://api.binance.com/api/v3';

async function bFetch(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Binance ${r.status}`);
  return r.json();
}

// Primary: ErikThiart (2000+ coins, very comprehensive)
// Fallback: CoinCap, then generated avatar
const iconUrl = (symbol) =>
  `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/128/${symbol.toLowerCase()}.png`;

export const iconFallback = (symbol) => (e) => {
  if (e.target.src.includes('ErikThiart')) {
    e.target.src = `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png`;
  } else {
    e.target.src = `https://ui-avatars.com/api/?name=${symbol}&background=2a2a2f&color=fff&size=64`;
  }
};

// Normalize a Binance 24hr ticker to our standard shape
function normalizeTicker(t) {
  const symbol = t.symbol.replace('USDT', '');
  return {
    id: symbol.toLowerCase(),          // used as key everywhere
    symbol: symbol.toLowerCase(),
    name: symbol,                       // Binance doesn't give full names
    image: iconUrl(symbol),
    current_price: parseFloat(t.lastPrice),
    market_cap: parseFloat(t.quoteVolume), // best proxy available
    market_cap_rank: null,
    price_change_percentage_24h: parseFloat(t.priceChangePercent),
    total_volume: parseFloat(t.volume),
    sparkline_in_7d: { price: [] },
  };
}

export function useMarkets(page = 1) {
  return useQuery({
    queryKey: ['markets', page],
    queryFn: async () => {
      const all = await bFetch(`${BINANCE}/ticker/24hr`);
      const usdt = all
        .filter(t => t.symbol.endsWith('USDT'))
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
      const start = (page - 1) * 25;
      return usdt.slice(start, start + 25).map(normalizeTicker);
    },
    staleTime: 60_000,
  });
}

export function useSearchCoins(query) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const all = await bFetch(`${BINANCE}/ticker/price`);
      const q = query.toUpperCase();
      return all
        .filter(t => t.symbol.endsWith('USDT') && t.symbol.startsWith(q))
        .slice(0, 10)
        .map(t => {
          const sym = t.symbol.replace('USDT', '');
          return {
            id: sym.toLowerCase(),
            symbol: sym.toLowerCase(),
            name: sym,
            thumb: iconUrl(sym),
            market_cap_rank: null,
          };
        });
    },
    enabled: query.length > 1,
    staleTime: 30_000,
  });
}

export function useCoinChart(coinId, days = 7) {
  return useQuery({
    queryKey: ['chart', coinId, days],
    queryFn: async () => {
      const symbol = coinId.toUpperCase() + 'USDT';
      const interval = days == 1 ? '1h' : '1d';
      const limit = days == 1 ? 24 : Math.min(parseInt(days), 365);
      const data = await bFetch(
        `${BINANCE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      return { prices: data.map(k => [k[0], parseFloat(k[4])]) };
    },
    enabled: !!coinId,
    staleTime: 60_000,
  });
}

export function useBatchPrices(ids) {
  return useQuery({
    queryKey: ['batch', ids],
    queryFn: async () => {
      const idList = ids.split(',').map(id => `"${id.toUpperCase()}USDT"`);
      const data = await bFetch(
        `${BINANCE}/ticker/24hr?symbols=[${idList.join(',')}]`
      );
      const result = {};
      const items = Array.isArray(data) ? data : [data];
      items.forEach(t => {
        const key = t.symbol.replace('USDT', '').toLowerCase();
        result[key] = {
          current_price: parseFloat(t.lastPrice),
          price_change_percentage_24h: parseFloat(t.priceChangePercent),
        };
      });
      return result;
    },
    enabled: !!ids && ids.length > 0,
    staleTime: 60_000,
  });
}