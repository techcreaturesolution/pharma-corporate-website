import Seo from '../components/Seo.jsx';
import Sections from '../components/Sections.jsx';
import { Loader, ErrorState, PageHeader, Img, Icon } from '../components/ui.jsx';
import { usePage, useApi, formatDate } from '../lib/hooks.js';
import { assetUrl } from '../lib/api.js';

export default function Quality() {
  const page = usePage('quality');
  const certs = useApi('/certifications', { limit: 50 });
  const p = page.data?.data;

  return (
    <>
      <Seo title={p?.title || 'Quality & Compliance'} seo={p?.seo} description="Our quality policy, systems and certifications." />
      <PageHeader title={p?.title || 'Quality & Compliance'} crumbs={[{ label: 'Quality' }]} />
      {page.isLoading && <Loader />}
      {page.isError && page.error?.response?.status !== 404 && <ErrorState error={page.error} />}
      {p && <Sections sections={p.sections} />}
      <section className="section section--alt">
        <div className="container">
          <div className="section__head">
            <h2 className="section__title">Certifications & accreditations</h2>
          </div>
          {certs.isLoading && <Loader />}
          {certs.data?.data?.length === 0 && <p className="meta" style={{ textAlign: 'center' }}>Certification details will be published here.</p>}
          <div className="grid grid--4">
            {certs.data?.data?.map((c) => (
              <article key={c._id} className="card cert">
                {c.image?.url && <Img image={c.image} alt={c.name} />}
                <h3>{c.name}</h3>
                {c.authority && <p className="meta">{c.authority}</p>}
                {c.certificateNumber && <p className="meta">No. {c.certificateNumber}</p>}
                {(c.issuedAt || c.expiresAt) && (
                  <p className="meta">
                    {c.issuedAt && `Issued ${formatDate(c.issuedAt)}`}
                    {c.expiresAt && ` · Valid until ${formatDate(c.expiresAt)}`}
                  </p>
                )}
                {c.description && <p>{c.description}</p>}
                {c.document?.url && (
                  <a href={assetUrl(c.document.url)} target="_blank" rel="noopener noreferrer" className="link">
                    <Icon name="download" /> View certificate
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
