import { useQuery } from '@tanstack/react-query';

const isDemo = () => localStorage.getItem('demoMode') === 'true';

/**
 * useMockQuery — drops in for useQuery.
 * In demo mode, returns mockFn() instantly.
 * In real mode, runs queryFn against the backend.
 */
export function useMockQuery({ queryKey, queryFn, mockFn, ...options }) {
  return useQuery({
    queryKey,
    queryFn: isDemo() ? mockFn : queryFn,
    ...options,
  });
}
