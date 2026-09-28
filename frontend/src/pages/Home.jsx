import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Sections from '../components/Sections.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { Loader, ErrorState, Icon, Img } from '../components/ui.jsx';
import { useApi, usePage, formatDate, useSettings } from '../lib/hooks.js';

export default function Home() {
  const page = usePage('home');
  const featured = useApi('/products/featured', { limit: 4 });
  const news = useApi('/news', { limit: 3 });
  const capabilities = useApi('/capabilities', { limit: 4 });
  const { data: settings } = useSettings();
  const company = settings?.data?.company;

  if (page.isLoading) return <Loader full />;
  if (page.isError) return <ErrorState error={page.error} />;
  const p = page.data.data;
  const sections = p.sections || [];

  return (
    <>
      <Seo
        seo={p.seo}
        title={p.seo?.title ? undefined : company?.tagline}
        jsonLd={
          company && {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: company.name,
            url: window.location.origin,
            logo: company.logo?.url,
            sameAs: Object.values(settings?.data?.social || {}).filter(Boolean),
          }
        }
      />
      <Sections sections={sections.filter((s) => ['hero', 'stats'].includes(s.type))} />

      {featured.data?.data?.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section__head">
              <h2 className="section__title">Featured products</h2>
              <p className="lead">A selection from our portfolio.</p>
            </div>
            <div className="grid grid--4">
              {featured.data.data.map((pr) => (
                <ProductCard key={pr._id} product={pr} />
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/products" className="btn btn--primary">
                View all products <Icon name="arrow" />
              </Link>
            </p>
          </div>
        </section>
      )}

      <Sections sections={sections.filter((s) => !['hero', 'stats', 'cta'].includes(s.type))} />

      {capabilities.data?.data?.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section__head">
              <h2 className="section__title">Our capabilities</h2>
            </div>
            <div className="grid grid--4">
              {capabilities.data.data.map((c) => (
                <Link key={c._id} to={`/capabilities/${c.slug}`} className="card feature">
                  <span className="feature__icon">
                    <Icon name={c.icon || 'flask'} />
                  </span>
                  <h3>{c.title}</h3>
                  <p className="meta">{c.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {news.data?.data?.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section__head">
              <h2 className="section__title">Latest news</h2>
            </div>
            <div className="grid grid--3">
              {news.data.data.map((n) => (
                <article key={n._id} className="card news-card">
                  <Link to={`/news/${n.slug}`}>
                    <Img image={n.featuredImage} alt={n.title} />
                  </Link>
                  <span className="meta">{formatDate(n.publishedAt)}</span>
                  <h3>
                    <Link to={`/news/${n.slug}`}>{n.title}</Link>
                  </h3>
                  <p className="meta">{n.summary}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <Sections sections={sections.filter((s) => s.type === 'cta')} />
    </>
  );
}
