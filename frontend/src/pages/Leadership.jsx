import Seo from '../components/Seo.jsx';
import { Loader, ErrorState, EmptyState, PageHeader, Img, RichHtml } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';

export default function Leadership() {
  const { data, isLoading, isError, error } = useApi('/leadership', { limit: 50 });
  return (
    <>
      <Seo title="Leadership" description="Meet the leadership team guiding our company." />
      <PageHeader title="Leadership" subtitle="The team behind our commitment to quality." crumbs={[{ label: 'Leadership' }]} />
      <section className="section">
        <div className="container">
          {isLoading && <Loader />}
          {isError && <ErrorState error={error} />}
          {data?.data?.length === 0 && <EmptyState />}
          <div className="grid grid--3">
            {data?.data?.map((l) => (
              <article key={l._id} className="card leader">
                <Img image={l.photo} alt={l.name} />
                <h3>{l.name}</h3>
                <p className="leader__role">{l.designation}</p>
                <RichHtml html={l.biography} className="meta rich" />
                {l.linkedinUrl && (
                  <a href={l.linkedinUrl} target="_blank" rel="noopener noreferrer" className="link">
                    LinkedIn
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
