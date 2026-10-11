import { useState } from 'react';
import { Routes, Route, Navigate, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../lib/auth.jsx';
import { Loader, Icon } from '../components/ui.jsx';
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
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
      >
        <span>{title}</span>
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.25s ease-out' }}>
        <div style={{ overflow: 'hidden' }}>
          <div className="admin__group-content" style={{ display: 'flex', flexDirection: 'column', gap: '.25rem', marginLeft: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid rgba(255, 255, 255, 0.15)', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

function Shell({ children }) {
  const { user, logout, isAdmin, hasRole } = useAuth();
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  return (
    <div className={`admin ${!open ? 'admin--sidebar-closed' : ''}`}>
      <Helmet>
        <title>Admin | Pharma CMS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <aside className={`admin__side ${open ? 'admin__side--open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Link to="/admin" className="admin__brand" onClick={close} style={{ marginBottom: 0, flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <span className="brand__mark" style={{ width: 30, height: 30, fontSize: '1.1rem', flexShrink: 0 }}>+</span> 
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Pharma CMS</span>
          </Link>
          <button type="button" onClick={() => setOpen(!open)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.25rem', display: 'flex' }} aria-label="Toggle sidebar">
            <Icon name="menu" style={{ width: 20, height: 20 }} />
          </button>
        </div>
        <NavLink to="/admin" end onClick={close}>
          <Icon name="layout" style={{ width: 16, height: 16 }} /> Dashboard
        </NavLink>
        <SidebarGroup title="Catalogue">
          <NavLink to="/admin/products" onClick={close}><Icon name="box" style={{ width: 16, height: 16 }} /> Products</NavLink>
          <NavLink to="/admin/categories" onClick={close}><Icon name="layers" style={{ width: 16, height: 16 }} /> Categories</NavLink>
        </SidebarGroup>
        <SidebarGroup title="Content">
          <NavLink to="/admin/pages" onClick={close}><Icon name="book" style={{ width: 16, height: 16 }} /> Pages</NavLink>
          {['capabilities', 'certifications', 'facilities', 'leadership', 'news', 'gallery'].map((k) => {
            const iconMap = { capabilities: 'activity', certifications: 'award', facilities: 'factory', leadership: 'users', news: 'newspaper', gallery: 'image' };
            return (
              <NavLink key={k} to={`/admin/${k}`} onClick={close}>
                <Icon name={iconMap[k] || 'file'} style={{ width: 16, height: 16 }} /> {RESOURCES[k].label}
              </NavLink>
            );
          })}
          <NavLink to="/admin/media" onClick={close}><Icon name="folder" style={{ width: 16, height: 16 }} /> Media library</NavLink>
        </SidebarGroup>
        <SidebarGroup title="Recruitment">
          <NavLink to="/admin/careers" onClick={close}><Icon name="briefcase" style={{ width: 16, height: 16 }} /> Vacancies</NavLink>
          {isAdmin && <NavLink to="/admin/applications" onClick={close}><Icon name="mail" style={{ width: 16, height: 16 }} /> Applications</NavLink>}
        </SidebarGroup>
        {isAdmin && (
          <>
            <SidebarGroup title="Leads">
              <NavLink to="/admin/enquiries" onClick={close}><Icon name="message-square" style={{ width: 16, height: 16 }} /> Enquiries</NavLink>
            </SidebarGroup>
            <SidebarGroup title="System">
              <NavLink to="/admin/settings" onClick={close}><Icon name="settings" style={{ width: 16, height: 16 }} /> Site settings</NavLink>
            </SidebarGroup>
          </>
        )}
        {hasRole('superadmin') && <NavLink to="/admin/users" onClick={close}><Icon name="users" style={{ width: 16, height: 16 }} /> Users</NavLink>}
        <NavLink to="/admin/profile" onClick={close}><Icon name="user" style={{ width: 16, height: 16 }} /> My account</NavLink>
        <a href="/" target="_blank" rel="noreferrer" style={{ marginTop: 'auto' }}>
          View website ↗
        </a>
      </aside>
      <div className="admin__main">
        <div className="admin__top">
          <button className="icon-btn admin__toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle navigation">
            <Icon name="menu" />
          </button>
          <span className="spacer" />
          <div className="admin__user">
            <span>
              {user.name} · <em>{user.role}</em>
            </span>
            <button
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
        {children}
      </div>
    </div>
  );
}

export default function AdminApp() {
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
