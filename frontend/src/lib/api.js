import axios from 'axios';

const baseURL = `${import.meta.env.VITE_API_URL || ''}/api/v1`;

export const api = axios.create({ baseURL, withCredentials: true, timeout: 20000 });

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    const isAuthRoute = config?.url?.startsWith('/auth/');
    if (response?.status === 401 && !config._retried && !isAuthRoute) {
      config._retried = true;
      try {
        refreshing ??= api.post('/auth/refresh').finally(() => (refreshing = null));
        await refreshing;
        return api(config);
      } catch {
        /* fall through to reject */
      }
    }
    return Promise.reject(error);
  },
);

/** Normalises axios errors into { message, errors: {field: message} } */
export const parseError = (err) => {
  const data = err?.response?.data;
  const fieldErrors = {};
  (data?.errors || []).forEach((e) => {
    if (e.field && !fieldErrors[e.field]) fieldErrors[e.field] = e.message;
  });
  return { message: data?.message || err?.message || 'Something went wrong', errors: fieldErrors, status: err?.response?.status };
};

export const get = (url, params) => api.get(url, { params }).then((r) => r.data);
export const post = (url, body, cfg) => api.post(url, body, cfg).then((r) => r.data);
export const put = (url, body) => api.put(url, body).then((r) => r.data);
export const patch = (url, body) => api.patch(url, body).then((r) => r.data);
export const del = (url) => api.delete(url).then((r) => r.data);

export const assetUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${import.meta.env.VITE_API_URL || ''}${url.startsWith('/') ? '' : '/'}${url}`;
};
