import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Sections from '../components/Sections.jsx';
import { Loader, ErrorState, PageHeader, Img, Icon } from '../components/ui.jsx';
import { usePage, useApi } from '../lib/hooks.js';

export default function About() {
  const page = usePage('about');
  const leaders = useApi('/leadership', { limit: 4 });

  if (page.isLoading) return <Loader full />;
  if (page.isError) return <ErrorState error={page.error} />;
  const p = page.data.data;

  return (
    <>
      <Seo title={p.title} seo={p.seo} description={p.sections?.[0]?.subtitle} />
      <PageHeader title={p.title} crumbs={[{ label: 'About' }]} />
      <Sections sections={p.sections} />
      {leaders.data?.data?.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section__head">
              <h2 className="section__title">Leadership</h2>
            </div>
            <div className="grid grid--4">
              {leaders.data.data.map((l) => (
                <div key={l._id} className="card leader">
                  <Img image={l.photo} alt={l.name} />
                  <h3>{l.name}</h3>
                  <span className="leader__role">{l.designation}</span>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/leadership" className="link">
                Meet the full team <Icon name="arrow" />
              </Link>
            </p>
          </div>
        </section>
      )}
    </>
  );
}
