import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { Loader, ErrorState, EmptyState, PageHeader, Pagination } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const query = {
    page: params.get('page') || 1,
    limit: 12,
    search: params.get('search') || undefined,
    category: params.get('category') || undefined,
    therapeuticArea: params.get('area') || undefined,
    sort: params.get('sort') || undefined,
    order: params.get('sort') ? 'asc' : undefined,
  };
  const products = useApi('/products', query);
  const categories = useApi('/categories', { limit: 100 });
  const areas = useApi('/products/therapeutic-areas');

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const activeCategory = categories.data?.data?.find((c) => c.slug === query.category);

  return (
    <>
      <Seo
        title={activeCategory ? `${activeCategory.name} Products` : 'Products'}
        description={activeCategory?.description || 'Browse our pharmaceutical product portfolio by category, therapeutic area, product code or CAS number.'}
        seo={activeCategory?.seo}
      />
      <PageHeader title={activeCategory?.name || 'Products'} subtitle={activeCategory?.description || 'Search and filter our product portfolio.'} crumbs={[{ label: 'Products', to: activeCategory ? '/products' : undefined }, ...(activeCategory ? [{ label: activeCategory.name }] : [])]} />
      <section className="section">
        <div className="container">
          <form
            className="filters"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              update({ search: e.currentTarget.search.value });
            }}
          >
            <input name="search" type="search" placeholder="Search by name, product code or CAS number" defaultValue={query.search || ''} aria-label="Search products" />
            <select aria-label="Category" value={query.category || ''} onChange={(e) => update({ category: e.target.value })}>
              <option value="">All categories</option>
              {categories.data?.data?.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <select aria-label="Therapeutic area" value={query.therapeuticArea || ''} onChange={(e) => update({ area: e.target.value })}>
              <option value="">All therapeutic areas</option>
              {areas.data?.data?.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <button className="btn btn--primary" type="submit">
              Search
            </button>
          </form>

          {categories.data?.data?.length > 0 && (
            <div className="chips" role="tablist" aria-label="Categories">
              <button className={`chip ${!query.category ? 'active' : ''}`} onClick={() => update({ category: '' })}>
                All
              </button>
              {categories.data.data.map((c) => (
                <button key={c._id} className={`chip ${query.category === c.slug ? 'active' : ''}`} onClick={() => update({ category: c.slug })}>
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {products.isLoading && <Loader />}
          {products.isError && <ErrorState error={products.error} />}
          {products.data && (
            <>
              <p className="meta">
                {products.data.meta.total} product{products.data.meta.total === 1 ? '' : 's'} found
              </p>
              {products.data.data.length === 0 ? (
                <EmptyState title="No products match your search" text="Try a different keyword or clear the filters." />
              ) : (
                <div className="grid grid--4">
                  {products.data.data.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              )}
              <Pagination meta={products.data.meta} onChange={(page) => update({ page })} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
