import { useParams, Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { Loader, ErrorState, PageHeader, Img, RichHtml, Badge, Icon } from '../components/ui.jsx';
import { useApi, formatDate } from '../lib/hooks.js';
import NotFound from './NotFound.jsx';

export default function NewsDetail() {
  const { slug } = useParams();
  const { data, isLoading, isError, error } = useApi(`/news/${slug}`);
  if (isLoading) return <Loader full />;
  if (isError) return error?.response?.status === 404 ? <NotFound /> : <ErrorState error={error} />;
  const n = data.data;
  return (
    <>
      <Seo
        title={n.title}
        description={n.summary}
        image={n.featuredImage?.url}
        seo={n.seo}
        type="article"
        jsonLd={{ '@context': 'https://schema.org', '@type': n.type === 'event' ? 'Event' : 'NewsArticle', headline: n.title, datePublished: n.publishedAt, description: n.summary, ...(n.type === 'event' && { startDate: n.eventDate, location: n.eventLocation }) }}
      />
      <PageHeader title={n.title} crumbs={[{ label: 'News', to: '/news' }, { label: n.title }]} />
      <article className="section">
        <div className="container container--narrow">
          <p className="meta">
            <Badge tone="info">{n.type}</Badge> {formatDate(n.publishedAt)}
            {n.type === 'event' && n.eventDate && ` · Event date: ${formatDate(n.eventDate)}`}
            {n.eventLocation && ` · ${n.eventLocation}`}
          </p>
          {n.featuredImage?.url && <Img image={n.featuredImage} className="split__img" style={{ marginBottom: '2rem' }} />}
          {n.summary && <p className="lead">{n.summary}</p>}
          <RichHtml html={n.content} />
          <Link to="/news" className="link">
            <Icon name="arrow" /> Back to all news
          </Link>
        </div>
      </article>
    </>
  );
}
