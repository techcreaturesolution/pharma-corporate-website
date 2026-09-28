import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { assetUrl } from '../lib/api.js';

export const Loader = ({ full }) => (
  <div className={`loader ${full ? 'loader--full' : ''}`} role="status" aria-live="polite">
    <span className="spinner" /> Loading…
  </div>
);

export const ErrorState = ({ error, title = 'Unable to load content' }) => (
  <div className="state state--error" role="alert">
    <h3>{title}</h3>
    <p>{error?.response?.data?.message || error?.message || 'Please try again later.'}</p>
  </div>
);

export const EmptyState = ({ title = 'Nothing here yet', text }) => (
  <div className="state">
    <h3>{title}</h3>
    {text && <p>{text}</p>}
  </div>
);

/** Renders CMS-supplied HTML after sanitisation. */
export const RichHtml = ({ html, className = 'rich' }) =>
  html ? <div className={className} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} /> : null;

export const Img = ({ image, fallback = '/placeholder.svg', className, ...rest }) => (
  <img
    src={image?.url ? assetUrl(image.url) : fallback}
    alt={image?.alt || rest.alt || ''}
    loading="lazy"
    className={className}
    onError={(e) => {
      if (e.currentTarget.src.endsWith(fallback)) return;
      e.currentTarget.src = fallback;
    }}
    {...rest}
  />
);

export const PageHeader = ({ title, subtitle, crumbs = [] }) => (
  <header className="page-header">
    <div className="container">
      <nav aria-label="Breadcrumb" className="crumbs">
        <Link to="/">Home</Link>
        {crumbs.map((c, i) => (
          <span key={i}>
            <span aria-hidden="true"> / </span>
            {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
          </span>
        ))}
      </nav>
      <h1>{title}</h1>
      {subtitle && <p className="lead">{subtitle}</p>}
    </div>
  </header>
);

export const Pagination = ({ meta, onChange }) => {
  if (!meta || meta.totalPages <= 1) return null;
  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 2,
  );
  return (
    <nav className="pagination" aria-label="Pagination">
      <button disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)} aria-label="Previous page">
        ‹
      </button>
      {pages.map((p, i) => (
        <span key={p}>
          {i > 0 && pages[i - 1] !== p - 1 && <span className="ellipsis">…</span>}
          <button className={p === meta.page ? 'active' : ''} onClick={() => onChange(p)} aria-current={p === meta.page ? 'page' : undefined}>
            {p}
          </button>
        </span>
      ))}
      <button disabled={meta.page >= meta.totalPages} onClick={() => onChange(meta.page + 1)} aria-label="Next page">
        ›
      </button>
    </nav>
  );
};

export const Field = ({ label, name, error, required, children, hint }) => (
  <div className={`field ${error ? 'field--error' : ''}`}>
    <label htmlFor={name}>
      {label}
      {required && <span aria-hidden="true"> *</span>}
    </label>
    {children}
    {hint && !error && <small className="hint">{hint}</small>}
    {error && (
      <small className="error" role="alert">
        {error}
      </small>
    )}
  </div>
);

export const Alert = ({ type = 'info', children }) =>
  children ? (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  ) : null;

export const Badge = ({ children, tone = 'default' }) => <span className={`badge badge--${tone}`}>{children}</span>;

export const statusTone = (s) =>
  ({
    published: 'success',
    open: 'success',
    active: 'success',
    hired: 'success',
    responded: 'success',
    draft: 'warning',
    received: 'warning',
    new: 'warning',
    in_review: 'info',
    in_progress: 'info',
    shortlisted: 'info',
    interview: 'info',
    archived: 'muted',
    closed: 'muted',
    inactive: 'muted',
    rejected: 'danger',
    spam: 'danger',
  })[s] || 'default';

export const Icon = ({ name }) => {
  const paths = {
    shield: 'M12 2 3 6v6c0 5 4 9 9 10 5-1 9-5 9-10V6z',
    factory: 'M3 21V9l6 4V9l6 4V4h3v17z',
    file: 'M6 2h8l6 6v14H6zM14 2v6h6',
    globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20',
    flask: 'M9 2h6M10 2v6L4 20h16l-6-12V2',
    check: 'M4 12l5 5L20 6',
    mail: 'M3 5h18v14H3zM3 5l9 8 9-8',
    phone: 'M5 3h4l2 5-3 2a10 10 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2',
    pin: 'M12 22s7-7 7-13a7 7 0 1 0-14 0c0 6 7 13 7 13zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    menu: 'M3 6h18M3 12h18M3 18h18',
    close: 'M6 6l12 12M18 6 6 18',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
    download: 'M12 3v12M6 11l6 6 6-6M4 21h16',
  };
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] || paths.check} />
    </svg>
  );
};
