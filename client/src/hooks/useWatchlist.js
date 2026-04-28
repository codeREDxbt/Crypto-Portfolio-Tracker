import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';

export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.get('/api/watchlist'),
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/api/watchlist', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/api/watchlist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });
}

export function useAlerts(coinId) {
  return useQuery({
    queryKey: ['alerts', coinId],
    queryFn: () => api.get(`/api/watchlist/alerts?coinId=${coinId}`),
    enabled: !!coinId,
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/api/watchlist/alerts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/api/watchlist/alerts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}