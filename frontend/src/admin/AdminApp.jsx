import { useState } from 'react';
import { Routes, Route, Navigate, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../lib/auth.jsx';
import { useSettings, useFavicon } from '../lib/hooks.js';
import { Loader, Icon, Img } from '../components/ui.jsx';
import { RESOURCES } from './resources.js';
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

const SidebarGroup = ({ title, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="admin__group-wrapper">
      <div 
        className="admin__group" 
        onClick={() => setOpen(!open)}
      >
        <span className="admin__group-title">{title}</span>
        <svg 
          className="admin__group-chevron"
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div className={`admin__group-collapse ${open ? 'admin__group-collapse--open' : ''}`}>
        <div className="admin__group-content">
          {children}
        </div>
      </div>
    </div>
  );
};

function Shell({ children }) {
  const { user, logout, isAdmin, hasRole } = useAuth();
  const { data: settingsData } = useSettings();
  const siteSettings = settingsData?.data || {};
  const company = siteSettings.company || {};
  const faviconUrl = company.favicon?.url;
  useFavicon(faviconUrl);
  const brandLogo = company.logo?.url ? company.logo : (company.favicon?.url ? company.favicon : null);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const close = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 960) {
      setOpen(false);
    }
  };

  return (
    <div className={`admin ${!open ? 'admin--sidebar-closed' : ''}`}>
      <Helmet>
        <title>Admin | Pharma CMS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <aside className={`admin__side ${open ? 'admin__side--open' : ''}`}>
        <Link to="/admin" className="admin__brand" onClick={close} title={company.navTitle || company.name || 'Pharma CMS'}>
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
        <NavLink to="/admin" end onClick={close} title="Dashboard">
          <Icon name="layout" style={{ width: 18, height: 18 }} />
          <span className="admin__link-text">Dashboard</span>
        </NavLink>
        <SidebarGroup title="Catalogue">
          <NavLink to="/admin/products" onClick={close} title="Products">
            <Icon name="box" style={{ width: 18, height: 18 }} />
            <span className="admin__link-text">Products</span>
          </NavLink>
          <NavLink to="/admin/categories" onClick={close} title="Categories">
            <Icon name="layers" style={{ width: 18, height: 18 }} />
            <span className="admin__link-text">Categories</span>
          </NavLink>
        </SidebarGroup>
        <SidebarGroup title="Content">
          <NavLink to="/admin/pages" onClick={close} title="Pages">
            <Icon name="book" style={{ width: 18, height: 18 }} />
            <span className="admin__link-text">Pages</span>
          </NavLink>
          {['capabilities', 'certifications', 'facilities', 'leadership', 'news', 'gallery'].map((k) => {
            const iconMap = { capabilities: 'activity', certifications: 'award', facilities: 'factory', leadership: 'users', news: 'newspaper', gallery: 'image' };
            return (
              <NavLink key={k} to={`/admin/${k}`} onClick={close} title={RESOURCES[k].label}>
                <Icon name={iconMap[k] || 'file'} style={{ width: 18, height: 18 }} />
                <span className="admin__link-text">{RESOURCES[k].label}</span>
              </NavLink>
            );
          })}
          <NavLink to="/admin/media" onClick={close} title="Media library">
            <Icon name="folder" style={{ width: 18, height: 18 }} />
            <span className="admin__link-text">Media library</span>
          </NavLink>
        </SidebarGroup>
        <SidebarGroup title="Recruitment">
          <NavLink to="/admin/careers" onClick={close} title="Vacancies">
            <Icon name="briefcase" style={{ width: 18, height: 18 }} />
            <span className="admin__link-text">Vacancies</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin/applications" onClick={close} title="Applications">
              <Icon name="mail" style={{ width: 18, height: 18 }} />
              <span className="admin__link-text">Applications</span>
            </NavLink>
          )}
        </SidebarGroup>
        {isAdmin && (
          <>
            <SidebarGroup title="Leads">
              <NavLink to="/admin/enquiries" onClick={close} title="Enquiries">
                <Icon name="message-square" style={{ width: 18, height: 18 }} />
                <span className="admin__link-text">Enquiries</span>
              </NavLink>
            </SidebarGroup>
            <SidebarGroup title="System">
              <NavLink to="/admin/settings" onClick={close} title="Site settings">
                <Icon name="settings" style={{ width: 18, height: 18 }} />
                <span className="admin__link-text">Site settings</span>
              </NavLink>
            </SidebarGroup>
          </>
        )}
        {hasRole('superadmin') && (
          <NavLink to="/admin/users" onClick={close} title="Users">
            <Icon name="users" style={{ width: 18, height: 18 }} />
            <span className="admin__link-text">Users</span>
          </NavLink>
        )}
        <NavLink to="/admin/profile" onClick={close} title="My account">
          <Icon name="user" style={{ width: 18, height: 18 }} />
          <span className="admin__link-text">My account</span>
        </NavLink>
        <a href="/" target="_blank" rel="noreferrer" className="admin__view-site" title="View website" style={{ marginTop: 'auto' }}>
          <Icon name="globe" style={{ width: 18, height: 18 }} />
          <span className="admin__link-text">View website ↗</span>
        </a>
      </aside>
      <div className="admin__main">
        <header className="admin__topbar">
          <div className="admin__topbar-left">
            <button
              type="button"
              className="admin__hamburger-btn"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle navigation"
              title="Toggle sidebar"
            >
              <Icon name="menu" />
            </button>
          </div>
          <div className="admin__topbar-right">
            <div className="admin__user">
              <span className="admin__user-name">{user.name}</span>
              <span className="admin__user-role">{user.role}</span>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={async () => {
                  await logout();
                  navigate('/admin/login');
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>
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
