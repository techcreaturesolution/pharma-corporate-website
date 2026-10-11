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

export const Icon = ({ name, className, style, ...props }) => {
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
    trash: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6',
    search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
    download: 'M12 3v12M6 11l6 6 6-6M4 21h16',
    truck: 'M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M17.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    refresh: 'M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.8-3.3L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15',
    headphones: 'M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1v-6h3v4zM3 19a2 2 0 0 0 2 2h1v-6H3v4z',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    cart: 'M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM20 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6',
    box: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
    layers: 'M12 2l10 6.5-10 6.5-10-6.5zM2 12l10 6.5 10-6.5M2 17l10 6.5 10-6.5',
    award: 'M12 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM10.11 14.5L7 22l5-2 5 2-3.11-7.5',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    image: 'M21 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21',
    folder: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
    briefcase: 'M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-10-2h4v2h-4V5z',
    'message-square': 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    settings: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
    newspaper: 'M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4M4 22a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h14M8 14h8M8 18h8',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5a2.5 2.5 0 0 0 0 5H20',
    home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    layout: 'M3 3h18v18H3z M3 9h18 M9 21V9',
  };
  return (
    <svg className={`icon ${className || ''}`} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={paths[name] || paths.check} />
    </svg>
  );
};
