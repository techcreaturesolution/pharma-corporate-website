import { useEffect, useState } from 'react';
import Seo from '../components/Seo.jsx';
import { Loader, ErrorState, EmptyState, PageHeader, Img, Pagination, Icon } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';
import { assetUrl } from '../lib/api.js';

export default function Gallery() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [open, setOpen] = useState(null);
  const { data, isLoading, isError, error } = useApi('/gallery', { limit: 24, page, category: category || undefined });
  const all = useApi('/gallery', { limit: 100 });
  const categories = [...new Set((all.data?.data || []).map((g) => g.category).filter(Boolean))];

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Seo title="Gallery" description="Photos of our facilities, events and team." />
      <PageHeader title="Gallery" crumbs={[{ label: 'Gallery' }]} />
      <section className="section">
        <div className="container">
          {categories.length > 0 && (
            <div className="chips">
              <button className={`chip ${!category ? 'active' : ''}`} onClick={() => (setCategory(''), setPage(1))}>
                All
              </button>
              {categories.map((c) => (
                <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => (setCategory(c), setPage(1))}>
                  {c}
                </button>
              ))}
            </div>
          )}
          {isLoading && <Loader />}
          {isError && <ErrorState error={error} />}
          {data?.data?.length === 0 && <EmptyState title="No images yet" />}
          <div className="gallery-grid">
            {data?.data?.map((g) => (
              <figure key={g._id} onClick={() => setOpen(g)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setOpen(g)} role="button" aria-label={`Open ${g.title}`}>
                <Img image={g.image} alt={g.image?.alt || g.title} />
                <figcaption>{g.title}</figcaption>
              </figure>
            ))}
          </div>
          <Pagination meta={data?.meta} onChange={setPage} />
        </div>
      </section>
      {open && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={open.title} onClick={() => setOpen(null)}>
          <button aria-label="Close" onClick={() => setOpen(null)}>
            <Icon name="close" />
          </button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={assetUrl(open.image.url)} alt={open.image.alt || open.title} />
            <figcaption style={{ color: '#fff', textAlign: 'center', marginTop: '.5rem' }}>
              {open.title}
              {open.caption && ` — ${open.caption}`}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
