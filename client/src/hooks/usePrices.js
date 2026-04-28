import { useQuery } from '@tanstack/react-query';
import api from '../lib/api.js';

export function useMarkets(page = 1) {
  return useQuery({
    queryKey: ['markets', page],
    queryFn: () => api.get(`/api/prices/markets?page=${page}`),
    staleTime: 60_000,
  });
}

export function useSearchCoins(query) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => api.get(`/api/prices/search?q=${encodeURIComponent(query)}`),
    enabled: query.length > 1,
    staleTime: 30_000,
  });
}

export function useCoinChart(coinId, days = 7) {
  return useQuery({
    queryKey: ['chart', coinId, days],
    queryFn: () => api.get(`/api/prices/chart/${coinId}?days=${days}`),
    enabled: !!coinId,
    staleTime: 60_000,
  });
}

export function useBatchPrices(ids) {
  return useQuery({
    queryKey: ['batch', ids],
    queryFn: () => api.get(`/api/prices/batch?ids=${ids}`),
    enabled: !!ids && ids.length > 0,
    staleTime: 60_000,
  });
}