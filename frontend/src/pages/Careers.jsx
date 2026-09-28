import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { Loader, ErrorState, EmptyState, PageHeader, Icon } from '../components/ui.jsx';
import { useApi, formatDate } from '../lib/hooks.js';

export default function Careers() {
  const { data, isLoading, isError, error } = useApi('/careers', { limit: 50 });
  return (
    <>
      <Seo title="Careers" description="Explore current job openings and join our team." />
      <PageHeader title="Careers" subtitle="Build your career with a quality-driven pharmaceutical company." crumbs={[{ label: 'Careers' }]} />
      <section className="section">
        <div className="container container--narrow">
          {isLoading && <Loader />}
          {isError && <ErrorState error={error} />}
          {data?.data?.length === 0 && <EmptyState title="No open positions right now" text="Please check back soon or send your CV via the contact page." />}
          <div className="grid">
            {data?.data?.map((j) => (
              <article key={j._id} className="card job-card">
                <div>
                  <h3>
                    <Link to={`/careers/${j.slug}`}>{j.title}</Link>
                  </h3>
                  <div className="job-card__meta">
                    {j.department && <span>{j.department}</span>}
                    {j.location && (
                      <span>
                        <Icon name="pin" /> {j.location}
                      </span>
                    )}
                    <span>{j.employmentType}</span>
                    {j.experience && <span>{j.experience}</span>}
                    {j.closingDate && <span>Apply by {formatDate(j.closingDate)}</span>}
                  </div>
                </div>
                <Link to={`/careers/${j.slug}`} className="btn btn--ghost btn--sm">
                  View & apply
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
