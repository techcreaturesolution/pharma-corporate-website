import { useQuery } from '@tanstack/react-query';
import { get } from './api.js';

/** Fetch a public/admin GET endpoint with React Query caching. */
export const useApi = (url, params, options = {}) =>
  useQuery({
    queryKey: [url, params],
    queryFn: () => get(url, params),
    staleTime: 60_000,
    retry: 1,
    ...options,
  });

export const useSettings = () => useApi('/settings/public', undefined, { staleTime: 5 * 60_000 });

export const usePage = (slug) => useApi(`/pages/${slug}`);

export const formatDate = (value, opts = { year: 'numeric', month: 'short', day: 'numeric' }) =>
  value ? new Date(value).toLocaleString(undefined, opts) : '';
