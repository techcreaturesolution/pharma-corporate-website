import slugify from 'slugify';

export const toSlug = (value) =>
  slugify(String(value || ''), { lower: true, strict: true, trim: true });

/** Returns a slug that is unique within `Model`, appending -2, -3... when needed. */
export const uniqueSlug = async (Model, base, excludeId) => {
  const root = toSlug(base) || 'item';
  let candidate = root;
  let counter = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.exists(query);
    if (!exists) return candidate;
    candidate = `${root}-${counter++}`;
  }
};
