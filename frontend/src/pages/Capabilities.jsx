import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { Loader, ErrorState, EmptyState, PageHeader, Icon, Img, RichHtml } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';
import NotFound from './NotFound.jsx';

export default function Capabilities() {
  const { slug } = useParams();
  const list = useApi('/capabilities', { limit: 50 });
  const detail = useApi(`/capabilities/${slug}`, undefined, { enabled: Boolean(slug) });

  if (slug) {
    if (detail.isLoading) return <Loader full />;
    if (detail.isError) return detail.error?.response?.status === 404 ? <NotFound /> : <ErrorState error={detail.error} />;
    const c = detail.data.data;
    return (
      <>
        <Seo title={c.title} description={c.summary} seo={c.seo} image={c.images?.[0]?.url} />
        <PageHeader title={c.title} subtitle={c.summary} crumbs={[{ label: 'Capabilities', to: '/capabilities' }, { label: c.title }]} />
        <section className="section">
          <div className="container split">
            <div>
              <RichHtml html={c.description} />
              {c.highlights?.length > 0 && (
                <ul>
                  {c.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
              <Link to="/contact" className="btn btn--primary">
                Discuss your project <Icon name="arrow" />
              </Link>
            </div>
            {c.images?.[0] && <Img image={c.images[0]} className="split__img" />}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo title="Capabilities & Services" description="Our manufacturing, development and analytical capabilities." />
      <PageHeader title="Capabilities & Services" subtitle="End-to-end pharmaceutical capabilities." crumbs={[{ label: 'Capabilities' }]} />
      <section className="section">
        <div className="container">
          {list.isLoading && <Loader />}
          {list.isError && <ErrorState error={list.error} />}
          {list.data?.data?.length === 0 && <EmptyState />}
          <div className="grid grid--3">
            {list.data?.data?.map((c) => (
              <article key={c._id} className="card feature">
                <span className="feature__icon">
                  <Icon name={c.icon || 'flask'} />
                </span>
                <h3>
                  <Link to={`/capabilities/${c.slug}`}>{c.title}</Link>
                </h3>
                <p className="meta">{c.summary}</p>
                <Link to={`/capabilities/${c.slug}`} className="link">
                  Learn more <Icon name="arrow" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
