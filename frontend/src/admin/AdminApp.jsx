import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Routes, Route, Navigate, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../lib/auth.jsx';
import { useSettings, useFavicon } from '../lib/hooks.js';
import { Loader, Icon, Img } from '../components/ui.jsx';
import { RESOURCES } from './resources.js';
import { NAV_SECTIONS, getSectionFromPathname } from './adminNavConfig.js';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import ResourceList from './ResourceList.jsx';
import ResourceForm from './ResourceForm.jsx';
import Enquiries from './Enquiries.jsx';
import Applications from './Applications.jsx';
import MediaLibrary from './MediaLibrary.jsx';
import Settings from './Settings.jsx';
import Pages from './Pages.jsx';
import Users from './Users.jsx';
import Profile from './Profile.jsx';
import './admin.css';

const Guard = ({ roles, children }) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();
  if (loading) return <Loader full />;
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (roles && !hasRole(...roles)) return <Navigate to="/admin" replace />;
  return children;
};

/**
 * Animated sliding pill navigation for the top navbar.
 * Measures the active tab and smoothly animates the background pill to match its position and width.
 */
function SlidingTabsNav({ sections, activeSectionId, onSelectSection }) {
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const prevLeftRef = useRef(null);
  const isInitialRef = useRef(true);
  const [pillStyle, setPillStyle] = useState({
    left: 0,
    right: 0,
    top: 0,
    height: 0,
    direction: 'right',
    opacity: 0,
    isInitial: true,
  });

  const updatePill = () => {
    const activeEl = tabRefs.current[activeSectionId];
    const containerEl = containerRef.current;
    if (activeEl && containerEl) {
      const containerWidth = containerEl.offsetWidth;
      const currentLeft = activeEl.offsetLeft;
      const currentWidth = activeEl.offsetWidth;
      const currentRight = Math.max(0, containerWidth - (currentLeft + currentWidth));
      const currentTop = activeEl.offsetTop;
      const currentHeight = activeEl.offsetHeight;

      let direction = 'right';
      if (prevLeftRef.current !== null) {
        direction = currentLeft >= prevLeftRef.current ? 'right' : 'left';
      }
      prevLeftRef.current = currentLeft;

      const isInitial = isInitialRef.current;
      if (isInitial) {
        isInitialRef.current = false;
      }

      setPillStyle({
        left: currentLeft,
        right: currentRight,
        top: currentTop,
        height: currentHeight,
        direction,
        opacity: 1,
        isInitial,
      });
    }
  };

  useLayoutEffect(() => {
    updatePill();
  }, [activeSectionId, sections]);

  useEffect(() => {
    const onResize = () => updatePill();
    window.addEventListener('resize', onResize);
    const timer = setTimeout(updatePill, 60);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, [activeSectionId, sections]);

  // Rubber-band stretch transition:
  // When moving right, the right edge leads (stretches forward), and the left edge lags with spring rebound!
  // When moving left, the left edge leads, and the right edge lags!
  const rubberTransition = pillStyle.isInitial
    ? 'none'
    : pillStyle.direction === 'right'
    ? 'right 0.36s cubic-bezier(0.2, 0.9, 0.3, 1) 0s, left 0.42s cubic-bezier(0.25, 1.32, 0.35, 1) 0.08s, height 0.25s ease'
    : 'left 0.36s cubic-bezier(0.2, 0.9, 0.3, 1) 0s, right 0.42s cubic-bezier(0.25, 1.32, 0.35, 1) 0.08s, height 0.25s ease';

  return (
    <nav className="admin-sliding-nav" ref={containerRef} aria-label="Main Admin Navigation">
      <span
        className="admin-sliding-nav__pill"
        style={{
          left: `${pillStyle.left}px`,
          right: `${pillStyle.right}px`,
          top: `${pillStyle.top}px`,
          height: `${pillStyle.height}px`,
          opacity: pillStyle.opacity,
          transition: rubberTransition,
        }}
        aria-hidden="true"
      />
      {sections.map((sec) => {
        const isActive = sec.id === activeSectionId;
        return (
          <button
            key={sec.id}
            ref={(el) => {
              if (el) tabRefs.current[sec.id] = el;
            }}
            type="button"
            className={`admin-sliding-nav__item ${isActive ? 'admin-sliding-nav__item--active' : ''}`}
            onClick={() => onSelectSection(sec)}
            title={sec.label}
          >
            {sec.icon && <Icon name={sec.icon} style={{ width: 16, height: 16 }} />}
            <span>{sec.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/**
 * Floating Capsule Sidebar with #20BF55 background.
 * Dynamically updates its sub-links based on the active top navbar category
 * with a vertical sliding stretchy rubber-band circle/capsule behind the active icon.
 */
function CapsuleSidebar({ activeSection, location, close, logout, isExpanded }) {
  const subLinks = activeSection?.subLinks || [];
  const groupRef = useRef(null);
  const linkRefs = useRef({});
  const innerRef = useRef(null);
  const prevTopRef = useRef(null);
  const prevSectionIdRef = useRef(activeSection?.id);
  const [capsuleHeight, setCapsuleHeight] = useState(null);
  const [pillStyle, setPillStyle] = useState({
    top: 0,
    bottom: 0,
    direction: 'down',
    opacity: 0,
    isInitial: true,
  });

  const isLinkActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path || location.pathname === `${item.path}/`;
    }
    return location.pathname.startsWith(item.path);
  };

  const activeItem = subLinks.find(isLinkActive);

  // Measure and update inner content height for smooth vertical stretching/shrinking animation
  useLayoutEffect(() => {
    if (!innerRef.current) return;
    const updateHeight = () => {
      if (innerRef.current) {
        setCapsuleHeight(innerRef.current.offsetHeight);
      }
    };
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, [activeSection?.id, isExpanded]);

  const updatePill = () => {
    if (!activeItem) {
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }
    const activeEl = linkRefs.current[activeItem.path];
    const groupEl = groupRef.current;
    if (activeEl && groupEl) {
      const groupHeight = groupEl.offsetHeight;
      const currentTop = activeEl.offsetTop;
      const currentHeight = activeEl.offsetHeight;
      const currentBottom = Math.max(0, groupHeight - (currentTop + currentHeight));

      let direction = 'down';
      if (prevTopRef.current !== null) {
        direction = currentTop >= prevTopRef.current ? 'down' : 'up';
      }
      prevTopRef.current = currentTop;

      const sectionChanged = prevSectionIdRef.current !== activeSection?.id;
      prevSectionIdRef.current = activeSection?.id;

      setPillStyle({
        top: currentTop,
        bottom: currentBottom,
        direction,
        opacity: 1,
        isInitial: sectionChanged,
      });
    }
  };

  useLayoutEffect(() => {
    updatePill();
  }, [activeItem?.path, activeSection?.id]);

  useEffect(() => {
    const onResize = () => updatePill();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [activeItem?.path, activeSection?.id]);

  // Vertical stretchy rubber-band animation:
  const verticalRubberTransition = pillStyle.isInitial
    ? 'none'
    : pillStyle.direction === 'down'
    ? 'bottom 0.36s cubic-bezier(0.2, 0.9, 0.3, 1) 0s, top 0.42s cubic-bezier(0.25, 1.32, 0.35, 1) 0.08s'
    : 'top 0.36s cubic-bezier(0.2, 0.9, 0.3, 1) 0s, bottom 0.42s cubic-bezier(0.25, 1.32, 0.35, 1) 0.08s';

  return (
    <aside className={`admin-capsule-aside ${isExpanded ? 'admin-capsule-aside--expanded' : ''}`}>
      <div
        className={`admin-capsule ${isExpanded ? 'admin-capsule--expanded' : ''}`}
        style={capsuleHeight ? { height: `${capsuleHeight}px` } : undefined}
      >
        <div ref={innerRef} className="admin-capsule__inner">
          {/* Dynamic sublinks inside the #20BF55 capsule with vertical sliding stretchy pill */}
          <div ref={groupRef} className="admin-capsule__group">
            <span
              className="admin-capsule__pill"
              style={{
                top: `${pillStyle.top}px`,
                bottom: `${pillStyle.bottom}px`,
                opacity: pillStyle.opacity,
                transition: verticalRubberTransition,
              }}
              aria-hidden="true"
            />
            {subLinks.map((item, index) => {
              const active = isLinkActive(item);
              return (
                <NavLink
                  key={item.path}
                  ref={(el) => {
                    if (el) linkRefs.current[item.path] = el;
                  }}
                  to={item.path}
                  onClick={close}
                  className={`admin-capsule__link ${active ? 'admin-capsule__link--active' : ''}`}
                  title={!isExpanded ? item.label : undefined}
                  style={{
                    animationDelay: `${index * 35}ms`,
                  }}
                >
                  <span className="admin-capsule__link-icon-wrap">
                    <Icon name={item.icon || 'file'} />
                  </span>
                  <span className="admin-capsule__link-name">{item.label}</span>
                  {!isExpanded && <span className="admin-capsule__tooltip">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>

          {/* Divider line */}
          <div className="admin-capsule__divider" />

          {/* Bottom Utility Icons */}
          <div className="admin-capsule__footer">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="admin-capsule__link"
              title={!isExpanded ? 'View public website' : undefined}
            >
              <span className="admin-capsule__link-icon-wrap">
                <Icon name="globe" />
              </span>
              <span className="admin-capsule__link-name">View Site ↗</span>
              {!isExpanded && <span className="admin-capsule__tooltip">View Website ↗</span>}
            </a>
            <NavLink
              to="/admin/profile"
              onClick={close}
              className={`admin-capsule__link ${location.pathname.startsWith('/admin/profile') ? 'admin-capsule__link--active' : ''}`}
              title={!isExpanded ? 'My account' : undefined}
            >
              <span className="admin-capsule__link-icon-wrap">
                <Icon name="user" />
              </span>
              <span className="admin-capsule__link-name">My Account</span>
              {!isExpanded && <span className="admin-capsule__tooltip">My Account</span>}
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="admin-capsule__link"
              title={!isExpanded ? 'Sign out' : undefined}
            >
              <span className="admin-capsule__link-icon-wrap">
                <Icon name="logout" />
              </span>
              <span className="admin-capsule__link-name">Sign Out</span>
              {!isExpanded && <span className="admin-capsule__tooltip">Sign Out</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Shell({ children }) {
  const { user, logout, isAdmin, hasRole } = useAuth();
  const { data: settingsData } = useSettings();
  const siteSettings = settingsData?.data || {};
  const company = siteSettings.company || {};
  const faviconUrl = company.favicon?.url;
  useFavicon(faviconUrl);
  const brandLogo = company.logo?.url ? company.logo : (company.favicon?.url ? company.favicon : null);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Filter sections and sublinks by user roles
  const availableSections = NAV_SECTIONS.filter((sec) => {
    if (sec.role === 'admin' && !isAdmin) return false;
    if (sec.role === 'superadmin' && !hasRole('superadmin')) return false;
    return true;
  }).map((sec) => ({
    ...sec,
    subLinks: sec.subLinks.filter((item) => {
      if (item.role === 'admin' && !isAdmin) return false;
      if (item.role === 'superadmin' && !hasRole('superadmin')) return false;
      return true;
    }),
  }));

  // Determine current active section from location
  const currentSectionId = getSectionFromPathname(location.pathname);
  const activeSection = availableSections.find((s) => s.id === currentSectionId) || availableSections[0];

  const handleSelectSection = (sec) => {
    if (sec.id === activeSection?.id) {
      if (!location.pathname.startsWith(sec.primaryPath)) {
        navigate(sec.primaryPath);
      }
    } else {
      navigate(sec.primaryPath);
    }
    if (typeof window !== 'undefined' && window.innerWidth <= 960) {
      setMobileMenuOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 960) {
      setMobileMenuOpen((o) => !o);
    } else {
      setSidebarExpanded((o) => !o);
    }
  };

  const closeMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 960) {
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className={`admin ${mobileMenuOpen ? 'admin--mobile-open' : ''} ${sidebarExpanded ? 'admin--expanded' : ''}`}>
      <Helmet>
        <title>Admin | Pharma CMS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Flowing Green Liquid Wave Animation Background (with Light Green First Layer) */}
      <div className="admin__liquid-bg" aria-hidden="true">
        {/* Layer 1: First/Back Liquid Wave - LIGHT GREEN (#5ee389) */}
        <div className="admin__wave-track admin__wave-track--back">
          <svg className="admin__wave-svg" viewBox="0 0 2000 400" preserveAspectRatio="none">
            <path
              d="M 0,55 C 250,110 250,-5 500,55 C 750,110 750,-5 1000,55 C 1250,110 1250,-5 1500,55 C 1750,110 1750,-5 2000,55 V 400 H 0 Z"
              fill="#5ee389"
            />
          </svg>
        </div>

        {/* Layer 2: Middle Vibrant Liquid Wave (#20BE55) */}
        <div className="admin__wave-track admin__wave-track--middle">
          <svg className="admin__wave-svg" viewBox="0 0 2000 400" preserveAspectRatio="none">
            <path
              d="M 0,80 C 180,140 320,20 500,80 C 680,140 820,20 1000,80 C 1180,140 1320,20 1500,80 C 1680,140 1820,20 2000,80 V 400 H 0 Z"
              fill="#20BE55"
            />
          </svg>
        </div>

        {/* Layer 3: Front Rich Liquid Wave (#1AA648) with Luminous Wave Crest */}
        <div className="admin__wave-track admin__wave-track--front">
          <svg className="admin__wave-svg" viewBox="0 0 2000 400" preserveAspectRatio="none">
            <path
              d="M 0,70 C 250,5 250,135 500,70 C 750,5 750,135 1000,70 C 1250,5 1250,135 1500,70 C 1750,5 1750,135 2000,70 V 400 H 0 Z"
              fill="#1AA648"
            />
            {/* Luminous Wave Crest */}
            <path
              d="M 0,70 C 250,5 250,135 500,70 C 750,5 750,135 1000,70 C 1250,5 1250,135 1500,70 C 1750,5 1750,135 2000,70"
              fill="none"
              stroke="#86efac"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* Rising Effervescent Water Bubbles */}
        <span className="admin__bubble bubble-1" />
        <span className="admin__bubble bubble-2" />
        <span className="admin__bubble bubble-3" />
        <span className="admin__bubble bubble-4" />
        <span className="admin__bubble bubble-5" />
        <span className="admin__bubble bubble-6" />
        <span className="admin__bubble bubble-7" />
      </div>

      {/* Top Navbar */}
      <header className="admin__topbar">
        <div className="admin__topbar-left">
          <button
            type="button"
            className={`admin__hamburger-btn ${sidebarExpanded ? 'admin__hamburger-btn--active' : ''}`}
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Icon name={(mobileMenuOpen || sidebarExpanded) ? 'close' : 'menu'} />
          </button>

          <Link to="/admin" className="admin__brand-pill" title={company.navTitle || company.name || 'Pharma CMS'}>
            {brandLogo?.url ? (
              <Img
                image={brandLogo}
                alt={company.name || 'Logo'}
                className="admin__brand-logo"
              />
            ) : (
              <span className="brand__mark">+</span>
            )}
            <span className="admin__brand-text">
              <span className="admin__brand-title">
                {company.navTitle || company.name || 'Pharma CMS'}
              </span>
              {company.navSmallText && (
                <small className="admin__brand-subtitle">
                  {company.navSmallText}
                </small>
              )}
            </span>
          </Link>
        </div>

        {/* Center Sliding Pill Navigation */}
        <div className="admin__topbar-center">
          <SlidingTabsNav
            sections={availableSections}
            activeSectionId={activeSection?.id}
            onSelectSection={handleSelectSection}
          />
        </div>

        {/* Right user info & quick actions */}
        <div className="admin__topbar-right">
          <Link to="/admin/profile" className="admin__user" title="My profile">
            <div className="admin__user-avatar" title={user.name}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="admin__user-details">
              <span className="admin__user-name">{user.name}</span>
              <span className="admin__user-role">{user.role}</span>
            </div>
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="admin__topbar-site-btn"
            title="Open website in new tab"
          >
            <Icon name="globe" style={{ width: 16, height: 16 }} />
            <span>Site ↗</span>
          </a>
          <button
            type="button"
            className="admin__topbar-signout-btn"
            onClick={handleSignOut}
            title="Sign out"
          >
            <Icon name="logout" style={{ width: 16, height: 16 }} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Workspace Area: Left Capsule Sidebar + Main Body */}
      <div className="admin__workspace">
        {mobileMenuOpen && (
          <div
            className="admin__backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        <div className={`admin__capsule-container ${mobileMenuOpen ? 'admin__capsule-container--open' : ''} ${sidebarExpanded ? 'admin__capsule-container--expanded' : ''}`}>
          <CapsuleSidebar
            activeSection={activeSection}
            location={location}
            close={closeMobile}
            logout={handleSignOut}
            isExpanded={sidebarExpanded}
          />
        </div>
        <main className="admin__body">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const { data: settingsData } = useSettings();
  const company = settingsData?.data?.company || {};
  useFavicon(company.favicon?.url);

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="*"
        element={
          <Guard>
            <Shell>
              <Routes>
                <Route index element={<Dashboard />} />
                {Object.keys(RESOURCES).map((k) => (
                  <Route key={k} path={k}>
                    <Route index element={<ResourceList resourceKey={k} />} />
                    <Route path="new" element={<ResourceForm resourceKey={k} />} />
                    <Route path=":id" element={<ResourceForm resourceKey={k} />} />
                  </Route>
                ))}
                <Route path="pages/*" element={<Pages />} />
                <Route path="media" element={<MediaLibrary />} />
                <Route path="profile" element={<Profile />} />
                <Route
                  path="enquiries"
                  element={
                    <Guard roles={['superadmin', 'admin']}>
                      <Enquiries />
                    </Guard>
                  }
                />
                <Route
                  path="applications"
                  element={
                    <Guard roles={['superadmin', 'admin']}>
                      <Applications />
                    </Guard>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <Guard roles={['superadmin', 'admin']}>
                      <Settings />
                    </Guard>
                  }
                />
                <Route
                  path="users"
                  element={
                    <Guard roles={['superadmin']}>
                      <Users />
                    </Guard>
                  }
                />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Shell>
          </Guard>
        }
      />
    </Routes>
  );
}
