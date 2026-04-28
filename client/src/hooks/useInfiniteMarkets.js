import { useInfiniteQuery } from '@tanstack/react-query';

const CG = 'https://api.coingecko.com/api/v3';

export function useInfiniteMarkets() {
  return useInfiniteQuery({
    queryKey: ['markets-infinite'],
    queryFn: ({ pageParam = 1 }) =>
      fetch(`${CG}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=${pageParam}&sparkline=true`)
        .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 25 ? pages.length + 1 : undefined,
    staleTime: 60_000,
  });
}