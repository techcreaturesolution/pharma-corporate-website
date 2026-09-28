import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { Loader, ErrorState, EmptyState, PageHeader, Icon, Img, RichHtml } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';
import NotFound from './NotFound.jsx';

export default function Facilities() {
  const { slug } = useParams();
  const list = useApi('/facilities', { limit: 50 });
  const detail = useApi(`/facilities/${slug}`, undefined, { enabled: Boolean(slug) });

  if (slug) {
    if (detail.isLoading) return <Loader full />;
    if (detail.isError) return detail.error?.response?.status === 404 ? <NotFound /> : <ErrorState error={detail.error} />;
    const f = detail.data.data;
    return (
      <>
        <Seo title={f.name} description={f.summary} seo={f.seo} image={f.images?.[0]?.url} />
        <PageHeader title={f.name} subtitle={[f.type, f.location].filter(Boolean).join(' · ')} crumbs={[{ label: 'Facilities', to: '/facilities' }, { label: f.name }]} />
        <section className="section">
          <div className="container split">
            {f.images?.[0] && <Img image={f.images[0]} className="split__img" />}
            <div>
              <RichHtml html={f.description} />
              {f.highlights?.length > 0 && (
                <ul>
                  {f.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {f.images?.length > 1 && (
            <div className="container gallery-grid" style={{ marginTop: '2rem' }}>
              {f.images.slice(1).map((img, i) => (
                <figure key={i}>
                  <Img image={img} />
                </figure>
              ))}
            </div>
          )}
        </section>
      </>
    );
  }

  return (
    <>
      <Seo title="Facilities" description="Our manufacturing, research and quality control facilities." />
      <PageHeader title="Facilities" subtitle="Manufacturing and research infrastructure." crumbs={[{ label: 'Facilities' }]} />
      <section className="section">
        <div className="container">
          {list.isLoading && <Loader />}
          {list.isError && <ErrorState error={list.error} />}
          {list.data?.data?.length === 0 && <EmptyState />}
          <div className="grid grid--3">
            {list.data?.data?.map((f) => (
              <article key={f._id} className="card product-card">
                <Link to={`/facilities/${f.slug}`}>
                  <Img image={f.images?.[0]} alt={f.name} />
                </Link>
                <div className="product-card__body">
                  <div className="product-card__meta">
                    {f.type && <span>{f.type}</span>}
                    {f.location && (
                      <span>
                        <Icon name="pin" /> {f.location}
                      </span>
                    )}
                  </div>
                  <h3>
                    <Link to={`/facilities/${f.slug}`}>{f.name}</Link>
                  </h3>
                  <p className="meta">{f.summary}</p>
                  <Link to={`/facilities/${f.slug}`} className="link">
                    Explore <Icon name="arrow" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
