export const parsePagination = (query, { defaultLimit = 12, maxLimit = 100 } = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

export const parseSort = (query, allowed, fallback = '-createdAt') => {
  const field = allowed.includes(query.sort) ? query.sort : null;
  if (!field) return fallback;
  return query.order === 'asc' ? field : `-${field}`;
};

export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
