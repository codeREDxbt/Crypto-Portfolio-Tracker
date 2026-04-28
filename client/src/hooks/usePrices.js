import { useQuery } from '@tanstack/react-query';

const CG = 'https://api.coingecko.com/api/v3';

async function cgFetch(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`CoinGecko ${r.status}`);
  return r.json();
}

export function useMarkets(page = 1) {
  return useQuery({
    queryKey: ['markets', page],
    queryFn: () => cgFetch(
      `${CG}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=${page}&sparkline=true`
    ),
    staleTime: 60_000,
  });
}

export function useSearchCoins(query) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const data = await cgFetch(`${CG}/search?query=${encodeURIComponent(query)}`);
      return data.coins?.slice(0, 10) ?? [];
    },
    enabled: query.length > 1,
    staleTime: 30_000,
  });
}

export function useCoinChart(coinId, days = 7) {
  return useQuery({
    queryKey: ['chart', coinId, days],
    queryFn: () => cgFetch(
      `${CG}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    ),
    enabled: !!coinId,
    staleTime: 60_000,
  });
}

export function useBatchPrices(ids) {
  return useQuery({
    queryKey: ['batch', ids],
    queryFn: async () => {
      const data = await cgFetch(
        `${CG}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      // Normalize to { id: { current_price, price_change_percentage_24h } }
      const result = {};
      for (const [id, val] of Object.entries(data)) {
        result[id] = {
          current_price: val.usd,
          price_change_percentage_24h: val.usd_24h_change,
        };
      }
      return result;
    },
    enabled: !!ids && ids.length > 0,
    staleTime: 60_000,
  });
}