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

function Shell({ children }) {
  const { user, logout, isAdmin, hasRole } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  return (
    <div className="admin">
      <Helmet>
        <title>Admin | Pharma CMS</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <aside className={`admin__side ${open ? 'admin__side--open' : ''}`}>
        <Link to="/admin" className="admin__brand" onClick={close}>
          <span className="brand__mark" style={{ width: 30, height: 30, fontSize: '1.1rem' }}>+</span> Pharma CMS
        </Link>
        <NavLink to="/admin" end onClick={close}>
          Dashboard
        </NavLink>
        <div className="admin__group">Catalogue</div>
        <NavLink to="/admin/products" onClick={close}>Products</NavLink>
        <NavLink to="/admin/categories" onClick={close}>Categories</NavLink>
        <div className="admin__group">Content</div>
        <NavLink to="/admin/pages" onClick={close}>Pages</NavLink>
        {['capabilities', 'certifications', 'facilities', 'leadership', 'news', 'gallery'].map((k) => (
          <NavLink key={k} to={`/admin/${k}`} onClick={close}>
            {RESOURCES[k].label}
          </NavLink>
        ))}
        <NavLink to="/admin/media" onClick={close}>Media library</NavLink>
        <div className="admin__group">Recruitment</div>
        <NavLink to="/admin/careers" onClick={close}>Vacancies</NavLink>
        {isAdmin && <NavLink to="/admin/applications" onClick={close}>Applications</NavLink>}
        {isAdmin && (
          <>
            <div className="admin__group">Leads</div>
            <NavLink to="/admin/enquiries" onClick={close}>Enquiries</NavLink>
            <div className="admin__group">System</div>
            <NavLink to="/admin/settings" onClick={close}>Site settings</NavLink>
          </>
        )}
        {hasRole('superadmin') && <NavLink to="/admin/users" onClick={close}>Users</NavLink>}
        <NavLink to="/admin/profile" onClick={close}>My account</NavLink>
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
