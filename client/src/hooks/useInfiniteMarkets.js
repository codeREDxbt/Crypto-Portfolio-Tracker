import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../lib/api.js';

export function useInfiniteMarkets() {
  return useInfiniteQuery({
    queryKey: ['markets'],
    queryFn: ({ pageParam = 1 }) => api.get(`/api/prices/markets?page=${pageParam}`),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 25 ? pages.length + 1 : undefined,
    staleTime: 60_000,
  });
}