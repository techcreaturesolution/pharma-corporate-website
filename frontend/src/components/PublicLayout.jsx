import { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../lib/hooks.js';
import { Icon, Img } from './ui.jsx';

const NAV = [
  { to: '/about', label: 'About' },
  { to: '/products', label: 'Products' },
  { to: '/capabilities', label: 'Capabilities' },
  { to: '/quality', label: 'Quality' },
  { to: '/facilities', label: 'Facilities' },
  { to: '/leadership', label: 'Leadership' },
  { to: '/news', label: 'News' },
  { to: '/careers', label: 'Careers' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const { data } = useSettings();
  const site = data?.data || {};
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    // Analytics-ready: emit a page view event for GTM/GA if configured.
    if (window.dataLayer) window.dataLayer.push({ event: 'page_view', page_path: pathname });
  }, [pathname]);

  const company = site.company || {};
  const contact = site.contact || {};
  const gaId = site.analytics?.googleAnalyticsId;
  const gtmId = site.analytics?.googleTagManagerId;

  return (
    <>
      <Helmet>
        {gtmId && (
          <script>{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}</script>
        )}
        {gaId && !gtmId && <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />}
        {gaId && !gtmId && <script>{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}</script>}
      </Helmet>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="topbar">
          <div className="container topbar__inner">
            {contact.email && (
              <a href={`mailto:${contact.email}`}>
                <Icon name="mail" /> {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>
                <Icon name="phone" /> {contact.phone}
              </a>
            )}
            <span className="topbar__spacer" />
            <Link to="/contact" className="topbar__cta">
              Request a quote
            </Link>
          </div>
        </div>
        <div className="container nav__inner">
          <Link to="/" className="brand" aria-label={`${company.name || 'Home'} home`}>
            {company.logo?.url ? <Img image={company.logo} className="brand__logo" /> : <span className="brand__mark">+</span>}
            <span className="brand__text">
              <strong>{company.name || 'Pharma Company'}</strong>
              {company.tagline && <small>{company.tagline}</small>}
            </span>
          </Link>
          <button className="nav__toggle" aria-expanded={open} aria-controls="primary-nav" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? 'close' : 'menu'} />
          </button>
          <nav id="primary-nav" className={`nav ${open ? 'nav--open' : ''}`} aria-label="Primary">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer__grid">
          <div>
            <h3 className="footer__brand">{company.name || 'Pharma Company'}</h3>
            <p>{company.description}</p>
            <div className="social">
              {Object.entries(site.social || {})
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noopener noreferrer" aria-label={k}>
                    {k}
                  </a>
                ))}
            </div>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              {NAV.slice(0, 6).map((n) => (
                <li key={n.to}>
                  <Link to={n.to}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Resources</h4>
            <ul>
              {NAV.slice(6).map((n) => (
                <li key={n.to}>
                  <Link to={n.to}>{n.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Use</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            {(contact.addresses || []).slice(0, 1).map((a, i) => (
              <address key={i}>
                {a.label && <strong>{a.label}</strong>}
                <br />
                {[a.line1, a.line2, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(', ')}
              </address>
            ))}
            {contact.email && (
              <p>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
            )}
            {contact.phone && <p>{contact.phone}</p>}
            {contact.workingHours && <p>{contact.workingHours}</p>}
          </div>
        </div>
        <div className="container footer__bottom">
          <p>
            © {new Date().getFullYear()} {company.legalName || company.name || 'Pharma Company'}. All rights reserved. {site.footer?.text}
          </p>
          {site.footer?.disclaimer && <p className="disclaimer">{site.footer.disclaimer}</p>}
        </div>
      </footer>
    </>
  );
}
