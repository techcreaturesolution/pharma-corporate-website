import { Link } from 'react-router-dom';
import { Icon, Img, RichHtml } from './ui.jsx';

const CtaLink = ({ cta, className = 'btn btn--primary' }) =>
  cta?.label && cta?.url ? (
    /^https?:/i.test(cta.url) ? (
      <a className={className} href={cta.url} target="_blank" rel="noopener noreferrer">
        {cta.label}
      </a>
    ) : (
      <Link className={className} to={cta.url}>
        {cta.label} <Icon name="arrow" />
      </Link>
    )
  ) : null;

const renderers = {
  hero: (s) => (
    <section className="hero" style={s.image?.url ? { '--hero-img': `url(${s.image.url})` } : undefined}>
      <div className="container hero__inner">
        <div>
          <h1>{s.title}</h1>
          {s.subtitle && <p className="lead">{s.subtitle}</p>}
          <RichHtml html={s.content} />
          <div className="hero__actions">
            <CtaLink cta={s.cta} />
            <Link to="/contact" className="btn btn--ghost">
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  ),
  stats: (s) => (
    <section className="section stats">
      <div className="container">
        {s.title && <h2 className="section__title">{s.title}</h2>}
        <div className="stats__grid">
          {s.items?.map((it, i) => (
            <div key={i} className="stat">
              <strong>{it.value}</strong>
              <span>{it.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
  features: (s) => (
    <section className="section">
      <div className="container">
        <SectionHead s={s} />
        <div className="grid grid--4">
          {s.items?.map((it, i) => (
            <div key={i} className="card feature">
              <span className="feature__icon">
                <Icon name={it.icon} />
              </span>
              <h3>{it.title}</h3>
              <p>{it.description}</p>
              {it.link && (
                <Link to={it.link} className="link">
                  Learn more <Icon name="arrow" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
  values: (s) => (
    <section className="section section--alt">
      <div className="container">
        <SectionHead s={s} />
        <div className="grid grid--2">
          {s.items?.map((it, i) => (
            <div key={i} className="card">
              <h3>{it.title}</h3>
              <p>{it.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  ),
  richText: (s) => (
    <section className="section">
      <div className="container container--narrow">
        <SectionHead s={s} />
        <RichHtml html={s.content} />
        <CtaLink cta={s.cta} />
      </div>
    </section>
  ),
  imageText: (s) => (
    <section className="section">
      <div className="container split">
        <Img image={s.image} className="split__img" />
        <div>
          <SectionHead s={s} align="left" />
          <RichHtml html={s.content} />
          <CtaLink cta={s.cta} />
        </div>
      </div>
    </section>
  ),
  timeline: (s) => (
    <section className="section">
      <div className="container container--narrow">
        <SectionHead s={s} />
        <ol className="timeline">
          {s.items?.map((it, i) => (
            <li key={i}>
              <span className="timeline__year">{it.value}</span>
              <div>
                <h3>{it.title}</h3>
                <p>{it.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  ),
  faq: (s) => (
    <section className="section">
      <div className="container container--narrow">
        <SectionHead s={s} />
        {s.items?.map((it, i) => (
          <details key={i} className="faq">
            <summary>{it.title}</summary>
            <p>{it.description}</p>
          </details>
        ))}
      </div>
    </section>
  ),
  cta: (s) => (
    <section className="section cta-band">
      <div className="container cta-band__inner">
        <div>
          <h2>{s.title}</h2>
          {s.subtitle && <p>{s.subtitle}</p>}
        </div>
        <CtaLink cta={s.cta} className="btn btn--light" />
      </div>
    </section>
  ),
};

const SectionHead = ({ s, align = 'center' }) =>
  s.title || s.subtitle ? (
    <div className={`section__head section__head--${align}`}>
      {s.title && <h2 className="section__title">{s.title}</h2>}
      {s.subtitle && <p className="lead">{s.subtitle}</p>}
    </div>
  ) : null;

/** Renders CMS page sections in sortOrder. Unknown types fall back to richText. */
export default function Sections({ sections = [], skip = [] }) {
  return [...sections]
    .filter((s) => !skip.includes(s.type))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((s, i) => {
      const R = renderers[s.type] || renderers.richText;
      return <R key={s.key || i} {...s} />;
    });
}
