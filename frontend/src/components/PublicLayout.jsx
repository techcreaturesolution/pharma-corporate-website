import { useEffect, useState, useRef } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSettings, useApi, useFavicon } from '../lib/hooks.js';
import { Icon, Img } from './ui.jsx';
import Preloader from './Preloader.jsx';

const NAV = [
  { to: '/', label: 'Home' },
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

function CategoryDropdown({ categories = [] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategoryObj = categories.find((c) => c.slug === selected);
  const currentLabel = selectedCategoryObj ? selectedCategoryObj.name : 'All Categories';

  const handleSelect = (slug) => {
    setSelected(slug);
    setOpen(false);
  };

  return (
    <div className="cat-dropdown" ref={dropdownRef}>
      <input type="hidden" name="category" value={selected} />
      <button
        type="button"
        className={`cat-dropdown__trigger ${open ? 'cat-dropdown__trigger--open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="cat-dropdown__label">{currentLabel}</span>
        <svg
          className={`cat-dropdown__chevron ${open ? 'cat-dropdown__chevron--open' : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="cat-dropdown__menu" role="listbox">
          <div
            className={`cat-dropdown__item ${selected === '' ? 'cat-dropdown__item--selected' : ''}`}
            onClick={() => handleSelect('')}
            role="option"
            aria-selected={selected === ''}
          >
            <span className="cat-dropdown__item-text">All Categories</span>
            {selected === '' && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <div className="cat-dropdown__divider" />
          {categories.map((c) => (
            <div
              key={c._id}
              className={`cat-dropdown__item ${selected === c.slug ? 'cat-dropdown__item--selected' : ''}`}
              onClick={() => handleSelect(c.slug)}
              role="option"
              aria-selected={selected === c.slug}
            >
              <span className="cat-dropdown__item-text">{c.name}</span>
              {selected === c.slug && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PublicLayout() {
  const { data } = useSettings();
  const categories = useApi('/categories', { limit: 100 });
  const site = data?.data || {};
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measure()) : null;
    if (ro && headerRef.current) ro.observe(headerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    // Analytics-ready: emit a page view event for GTM/GA if configured.
    if (window.dataLayer) window.dataLayer.push({ event: 'page_view', page_path: pathname });
  }, [pathname]);

  const company = site.company || {};
  useFavicon(company.favicon?.url);
  const contact = site.contact || {};
  const gaId = site.analytics?.googleAnalyticsId;
  const gtmId = site.analytics?.googleTagManagerId;

  return (
    <>
      <Preloader company={company} />
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

      {/* header top bar and search  */}
      <header ref={headerRef} className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
        <div className="topbar" style={{ background: '#f8fbfb', color: '#105c48' }}>
          <div className="container topbar__inner" style={{ fontSize: '0.85rem', fontWeight: '500', gap: '2rem' }}>
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="nav-bottom-link" style={{display: 'flex', gap: '6px', alignItems: 'center', color: 'inherit', paddingBottom: '0.2rem', textDecoration: 'none'}}>
                <Icon name="mail" /> {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="nav-bottom-link" style={{display: 'flex', gap: '6px', alignItems: 'center', color: 'inherit', paddingBottom: '0.2rem', textDecoration: 'none'}}>
                <Icon name="phone" /> {contact.phone}
              </a>
            )}
            <span className="topbar__spacer" style={{flex: 1}} />
            <Link to="/contact" className="topbar__cta nav-bottom-link" style={{display: 'flex', gap: '6px', alignItems: 'center', color: 'inherit', paddingBottom: '0.2rem', textDecoration: 'none'}}>
              <Icon name="file" /> Request a quote
            </Link>
          </div>
        </div>
        
        {/* middle bar  */}
        <div className="container middlebar" style={{ position: 'relative', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', gap: '2rem' }}>
          <Link to="/" className="brand" aria-label={`${company.navTitle || company.name || 'Home'} home`}>
            {company.logo?.url ? (
              <Img image={company.logo} className="brand__logo" style={{ maxHeight: '48px' }} />
            ) : (
              <span className="brand__mark" style={{ background: '#105c48', color: '#fff', borderRadius: '10px', fontSize: '2rem', padding: '0.2rem 0.6rem', display: 'flex' }}>+</span>
            )}
            {company.navTitle ? (
              <span className="brand__text">
                <strong style={{ color: '#093c54', fontSize: '1.4rem', fontWeight: '700', lineHeight: '1.1' }}>{company.navTitle}</strong>
                {company.navSmallText && <small style={{ color: '#687780', display: 'block', fontSize: '0.9rem' }}>{company.navSmallText}</small>}
              </span>
            ) : !company.logo?.url ? (
              <span className="brand__text">
                <strong style={{ color: '#093c54', fontSize: '1.5rem', lineHeight: '1.1' }}>{company.name || 'Pharma Company'}</strong>
                {company.tagline && <small style={{ color: '#687780' }}>{company.tagline}</small>}
              </span>
            ) : null}
          </Link>

          <form 
            className="search-bar hide-mobile" 
            style={{ display: 'flex', alignItems: 'center', flex: '1', maxWidth: '800px', height: '46px', position: 'relative', zIndex: 60 }}
            onSubmit={(e) => {
              e.preventDefault();
              const q = e.currentTarget.search.value;
              const cat = e.currentTarget.category.value;
              const params = new URLSearchParams();
              if (q) params.set('search', q);
              if (cat) params.set('category', cat);
              navigate(`/products?${params.toString()}`);
            }}
          >
            <div style={{ display: 'flex', flex: '1', height: '100%', border: '1px solid #e1e7ec', borderRight: 'none', borderRadius: '50px 0 0 50px', background: '#fff', position: 'relative', zIndex: 60 }}>
              <input name="search" type="text" placeholder="Search..." style={{ flex: '1', border: 'none', padding: '0 1.2rem', outline: 'none', fontSize: '0.95rem', height: '100%', background: 'transparent', borderRadius: '50px 0 0 50px' }} />
              <CategoryDropdown categories={categories.data?.data || []} />
            </div>
            <button type="submit" style={{ backgroundColor: '#105c48', color: '#fff', border: 'none', width: '64px', height: '46px', margin: 0, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 50px 50px 0' }}>
              <Icon name="search" />
            </button>
          </form>

          <div className="user-actions" style={{ display: 'flex', alignItems: 'center', gap: '2rem', whiteSpace: 'nowrap' }}>
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <span style={{ color: '#105c48', display: 'flex', fontSize: '1.5rem' }}><Icon name="user" /></span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                <span style={{ fontSize: '0.8rem', color: '#687780' }}>Sign In</span>
                <strong style={{ fontSize: '0.95rem', color: '#093c54', fontWeight: '600' }}>My Account</strong>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ position: 'relative', display: 'inline-flex', fontSize: '1.6rem', marginBottom: '2px' }}>
                <span style={{ color: '#105c48', display: 'flex' }}><Icon name="cart" /></span>
                <span style={{ position: 'absolute', top: '-6px', right: '-10px', backgroundColor: '#105c48', color: '#fff', fontSize: '0.7rem', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid #fff', boxSizing: 'content-box' }}>0</span>
              </div>
            </div>
            <button className="nav__toggle" aria-expanded={open} aria-controls="primary-nav" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)} style={{ marginLeft: '1rem' }}>
              <Icon name={open ? 'close' : 'menu'} />
            </button>
          </div>
        </div>

        {/* nav inner  primary Nav Links HOME , ABOUT, PRODUCTION*/}

        <div className="container nav__inner" style={{ position: 'relative', zIndex: 10, minHeight: '50px' }}>
          <nav id="primary-nav" className={`nav ${open ? 'nav--open' : ''}`} aria-label="Primary" style={{ gap: '2.5rem' }}>
            {NAV.map((n, idx) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => (isActive ? 'active nav-bottom-link' : 'nav-bottom-link')}
                style={{
                  padding: '0.8rem 0 0.3rem 0',
                  color: '#105c48',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  '--nav-i': idx,
                }}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Header spacer to prevent page content overlap under fixed navbar */}
      <div
        className="site-header-spacer"
        style={{ height: headerHeight ? `${headerHeight}px` : undefined }}
        aria-hidden="true"
      />

      <main id="main">
        <Outlet />
      </main>
       {/* footer */}
       {/* footer */}
       
      <footer className="site-footer">
        <div className="container footer__grid">
          <div>
            <Link to="/" className="brand footer__brand" aria-label={`${company.navTitle || company.name || 'Home'} home`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', textDecoration: 'none' }}>
              {company.logo?.url ? (
                <Img image={company.logo} className="brand__logo" style={{ maxHeight: '40px' }} />
              ) : (
                <span className="brand__mark" style={{ background: '#105c48', color: '#fff', borderRadius: '10px', fontSize: '2rem', padding: '0.2rem 0.6rem', display: 'flex' }}>+</span>
              )}
              {company.navTitle ? (
                <span className="brand__text">
                  <strong style={{ color: '#000', fontSize: '1.4rem', lineHeight: '1.1' }}>{company.navTitle}</strong>
                  {company.navSmallText && <small style={{ color: '#687780', display: 'block', fontSize: '0.9rem' }}>{company.navSmallText}</small>}
                </span>
              ) : !company.logo?.url ? (
                <span className="brand__text">
                  <strong style={{ color: '#000', fontSize: '1.5rem', lineHeight: '1.1' }}>{company.name || 'Pharma Company'}</strong>
                  {(company.navSmallText || company.tagline) && <small style={{ color: '#105c48', display: 'block', fontSize: '0.9rem' }}>{company.navSmallText || company.tagline}</small>}
                </span>
              ) : null}
            </Link>
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
