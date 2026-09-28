import { Link, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { Loader, ErrorState, EmptyState, PageHeader, Img, Pagination, Badge } from '../components/ui.jsx';
import { useApi, formatDate } from '../lib/hooks.js';

const TYPES = [
  ['', 'All'],
  ['news', 'News'],
  ['event', 'Events'],
  ['press-release', 'Press releases'],
];

export default function News() {
  const [params, setParams] = useSearchParams();
  const type = params.get('type') || '';
  const page = params.get('page') || 1;
  const { data, isLoading, isError, error } = useApi('/news', { limit: 9, page, type: type || undefined });

  return (
    <>
      <Seo title="News & Events" description="Company news, events and press releases." />
      <PageHeader title="News & Events" crumbs={[{ label: 'News' }]} />
      <section className="section">
        <div className="container">
          <div className="chips">
            {TYPES.map(([v, label]) => (
              <button key={v} className={`chip ${type === v ? 'active' : ''}`} onClick={() => setParams(v ? { type: v } : {})}>
                {label}
              </button>
            ))}
          </div>
          {isLoading && <Loader />}
          {isError && <ErrorState error={error} />}
          {data?.data?.length === 0 && <EmptyState title="No articles yet" />}
          <div className="grid grid--3">
            {data?.data?.map((n) => (
              <article key={n._id} className="card news-card">
                <Link to={`/news/${n.slug}`}>
                  <Img image={n.featuredImage} alt={n.title} />
                </Link>
                <p className="meta">
                  <Badge tone="info">{n.type}</Badge> {formatDate(n.type === 'event' && n.eventDate ? n.eventDate : n.publishedAt)}
                </p>
                <h3>
                  <Link to={`/news/${n.slug}`}>{n.title}</Link>
                </h3>
                <p className="meta">{n.summary}</p>
              </article>
            ))}
          </div>
          <Pagination meta={data?.meta} onChange={(p) => setParams({ ...(type && { type }), page: p })} />
        </div>
      </section>
    </>
  );
}
