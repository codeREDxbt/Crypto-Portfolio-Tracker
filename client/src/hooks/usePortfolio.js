import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: () => api.get('/api/portfolio'),
  });
}

export function useAddHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/api/portfolio', data),
    onSuccess: () => qc.invalidateQueries(['portfolio']),
  });
}

export function useUpdateHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/api/portfolio/${id}`, data),
    onSuccess: () => qc.invalidateQueries(['portfolio']),
  });
}

export function useDeleteHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/api/portfolio/${id}`),
    onSuccess: () => qc.invalidateQueries(['portfolio']),
  });
}