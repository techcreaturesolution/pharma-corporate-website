import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get, assetUrl } from './api.js';

/** Fetch a public/admin GET endpoint with React Query caching. */
export const useApi = (url, params, options = {}) =>
  useQuery({
    queryKey: [url, params],
    queryFn: () => get(url, params),
    staleTime: 60_000,
    retry: 1,
    ...options,
  });

export const useSettings = () => useApi('/settings/public', undefined, { staleTime: 30_000 });

export const usePage = (slug) => useApi(`/pages/${slug}`);

export const formatDate = (value, opts = { year: 'numeric', month: 'short', day: 'numeric' }) =>
  value ? new Date(value).toLocaleString(undefined, opts) : '';

export const updateFavicon = (url) => {
  if (!url) return;
  const fullUrl = assetUrl(url);
  const link = document.getElementById('favicon-link') || document.querySelector("link[rel~='icon']");
  if (link) {
    if (fullUrl.endsWith('.png')) link.type = 'image/png';
    else if (fullUrl.endsWith('.svg')) link.type = 'image/svg+xml';
    else if (fullUrl.endsWith('.ico')) link.type = 'image/x-icon';
    else link.removeAttribute('type');
    link.href = fullUrl;
  }
};

export const useFavicon = (url) => {
  useEffect(() => {
    if (url) updateFavicon(url);
  }, [url]);
};
