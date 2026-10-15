import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { Loader, ErrorState, EmptyState, PageHeader, Pagination } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';

function CustomSelect({ value, onChange, placeholder, options = [], ariaLabel }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`filter-select ${open ? 'filter-select--open' : ''}`} ref={containerRef}>
      <button
        type="button"
        className="filter-select__trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className="filter-select__label">{displayLabel}</span>
        <svg
          className={`filter-select__chevron ${open ? 'filter-select__chevron--open' : ''}`}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="filter-select__menu" role="listbox">
          <div
            className={`filter-select__item ${!value ? 'filter-select__item--selected' : ''}`}
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            role="option"
            aria-selected={!value}
          >
            <span className="filter-select__item-text">{placeholder}</span>
            {!value && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20BF55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <div className="filter-select__divider" />
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <div
                key={opt.value}
                className={`filter-select__item ${isSelected ? 'filter-select__item--selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <span className="filter-select__item-text">{opt.label}</span>
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#20BF55" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
            <CustomSelect
              ariaLabel="Category"
              value={query.category || ''}
              onChange={(val) => update({ category: val })}
              placeholder="All categories"
              options={categories.data?.data?.map((c) => ({ value: c.slug, label: c.name })) || []}
            />
            <CustomSelect
              ariaLabel="Therapeutic area"
              value={query.therapeuticArea || ''}
              onChange={(val) => update({ area: val })}
              placeholder="All therapeutic areas"
              options={areas.data?.data?.map((a) => ({ value: a, label: a })) || []}
            />
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
