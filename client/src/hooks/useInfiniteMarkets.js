import { useInfiniteQuery } from '@tanstack/react-query';

const BINANCE = 'https://api.binance.com/api/v3';

const iconUrl = (symbol) =>
  `https://raw.githubusercontent.com/ErikThiart/cryptocurrency-icons/master/128/${symbol.toLowerCase()}.png`;

export function useInfiniteMarkets() {
  return useInfiniteQuery({
    queryKey: ['markets-infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const all = await fetch(`${BINANCE}/ticker/24hr`)
        .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); });

      const usdt = all
        .filter(t => t.symbol.endsWith('USDT'))
        .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));

      const start = (pageParam - 1) * 25;
      return usdt.slice(start, start + 25).map(t => {
        const symbol = t.symbol.replace('USDT', '');
        return {
          id: symbol.toLowerCase(),
          symbol: symbol.toLowerCase(),
          name: symbol,
          image: iconUrl(symbol),
          current_price: parseFloat(t.lastPrice),
          market_cap: parseFloat(t.quoteVolume),
          price_change_percentage_24h: parseFloat(t.priceChangePercent),
          total_volume: parseFloat(t.volume),
          sparkline_in_7d: { price: [] },
        };
      });
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 25 ? pages.length + 1 : undefined,
    staleTime: 60_000,
  });
}