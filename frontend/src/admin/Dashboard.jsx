import { Link } from 'react-router-dom';
import { useApi, formatDate } from '../lib/hooks.js';
import { Loader, ErrorState, Badge, statusTone, Icon } from '../components/ui.jsx';
import { useAuth } from '../lib/auth.jsx';

export default function Dashboard() {
  const { data, isLoading, isError, error } = useApi('/admin/dashboard/stats', undefined, { staleTime: 0 });
  const { user, isAdmin } = useAuth();

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState error={error} />;

  const { counts = {}, recentEnquiries = [], recentApplications = [] } = data?.data || {};

  // Formatted date string for dashboard header
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Primary 4 KPI Hero Cards
  const heroKpis = [
    {
      id: 'products',
      title: 'Published Products',
      value: counts.publishedProducts ?? 0,
      badge: `${counts.draftProducts ?? 0} Drafts`,
      badgeTone: counts.draftProducts > 0 ? 'warning' : 'neutral',
      subtitle: 'Active formulations & APIs',
      to: '/admin/products',
      icon: 'box',
      accentColor: '#ffffff',
      accentBg: '#20be55',
    },
    {
      id: 'categories',
      title: 'Product Categories',
      value: counts.categories ?? 0,
      badge: 'Therapeutic',
      badgeTone: 'info',
      subtitle: 'Segments & classifications',
      to: '/admin/categories',
      icon: 'layers',
      accentColor: '#ffffff',
      accentBg: '#20be55',
    },
    {
      id: 'enquiries',
      title: 'Customer Inquiries',
      value: counts.newEnquiries ?? 0,
      badge: `${counts.totalEnquiries ?? 0} Total`,
      badgeTone: counts.newEnquiries > 0 ? 'success' : 'neutral',
      subtitle: 'Direct RFQ & commercial leads',
      to: '/admin/enquiries',
      icon: 'mail',
      accentColor: '#ffffff',
      accentBg: '#20be55',
    },
    {
      id: 'careers',
      title: 'Open Positions',
      value: counts.openJobs ?? 0,
      badge: `${counts.newApplications ?? 0} New`,
      badgeTone: counts.newApplications > 0 ? 'success' : 'neutral',
      subtitle: `${counts.totalApplications ?? 0} Total candidates`,
      to: '/admin/careers',
      icon: 'briefcase',
      accentColor: '#ffffff',
      accentBg: '#20be55',
    },
  ];

  // Secondary operational metrics
  const secondaryKpis = [
    {
      label: 'Draft Products',
      val: counts.draftProducts ?? 0,
      to: '/admin/products?status=draft',
      icon: 'file',
      tag: 'Catalog',
    },
    {
      label: 'Published News',
      val: counts.publishedNews ?? 0,
      to: '/admin/news',
      icon: 'newspaper',
      tag: 'Content',
    },
    {
      label: 'Total Inquiries',
      val: counts.totalEnquiries ?? 0,
      to: '/admin/enquiries',
      icon: 'message-square',
      tag: 'Leads',
    },
    {
      label: 'Candidate Applications',
      val: counts.totalApplications ?? 0,
      to: '/admin/applications',
      icon: 'users',
      tag: 'Recruitment',
    },
  ];

  return (
    <div className="dash-container">
      {/* ── Executive Header Banner ── */}
      <div className="dash-header">
        <div className="dash-header__info">
          
          <h1 className="dash-header__title">
            Welcome back, {user?.name || 'Administrator'}
          </h1>
          <p className="dash-header__subtitle">
            Live overview covering commercial formulations, client leads, and talent recruitment.
          </p>
        </div>

        <div className="dash-header__actions">
          <div className="dash-header__date-chip">
            <span className="dash-icon-circle-sm">
              <Icon name="calendar" style={{ width: 13, height: 13 }} />
            </span>
            <span>{todayFormatted}</span>
          </div>
          <Link to="/admin/products/new" className="dash-header__cta-btn">
            <Icon name="plus" style={{ width: 15, height: 15 }} />
            <span>New Product</span>
          </Link>
        </div>
      </div>

      {/* ── 4 Primary Featured KPI Cards ── */}
      <div className="dash-kpi-grid">
        {heroKpis.map((kpi) => (
          <Link to={kpi.to} key={kpi.id} className="dash-kpi-card">
            <div className="dash-kpi-card__top">
              <div
                className="dash-kpi-card__icon"
                style={{ color: kpi.accentColor, backgroundColor: kpi.accentBg }}
              >
                <Icon name={kpi.icon} style={{ width: 22, height: 22 }} />
              </div>
              <span className={`dash-kpi-card__badge dash-kpi-card__badge--${kpi.badgeTone}`}>
                {kpi.badge}
              </span>
            </div>

            <div className="dash-kpi-card__body">
              <span className="dash-kpi-card__value">{kpi.value}</span>
              <span className="dash-kpi-card__title">{kpi.title}</span>
              <span className="dash-kpi-card__subtitle">{kpi.subtitle}</span>
            </div>

            <div className="dash-kpi-card__footer">
              <span className="dash-kpi-card__link-text">Manage section</span>
              <Icon name="arrow" className="dash-kpi-card__arrow" style={{ width: 14, height: 14 }} />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Quick Secondary Operational Metrics Strip ── */}
      <div className="dash-secondary-grid">
        {secondaryKpis.map((item) => (
          <Link to={item.to} key={item.label} className="dash-secondary-card">
            <div className="dash-secondary-card__left">
              <div className="dash-secondary-card__icon">
                <Icon name={item.icon} style={{ width: 16, height: 16 }} />
              </div>
              <div className="dash-secondary-card__text">
                <span className="dash-secondary-card__tag">{item.tag}</span>
                <span className="dash-secondary-card__label">{item.label}</span>
              </div>
            </div>
            <strong className="dash-secondary-card__value">{item.val}</strong>
          </Link>
        ))}
      </div>

      {/* ── Widgets Two-Column Layout: Inquiries & Applications ── */}
      {isAdmin && (
        <div className="dash-widgets-grid">
          {/* Recent Client Inquiries Widget */}
          <div className="dash-widget">
            <div className="dash-widget__header">
              <div className="dash-widget__title-group">
                <div className="dash-widget__badge-icon">
                  <Icon name="mail" style={{ width: 16, height: 16 }} />
                </div>
                <div>
                  <h3 className="dash-widget__title">Recent Client Inquiries</h3>
                  <p className="dash-widget__sub">Direct commercial product requests</p>
                </div>
              </div>
              <Link to="/admin/enquiries" className="dash-widget__view-all">
                View all ({counts.totalEnquiries ?? 0})
              </Link>
            </div>

            <div className="dash-widget__content">
              {recentEnquiries.length === 0 ? (
                <div className="dash-widget__empty">
                  <div className="dash-widget__empty-icon">
                    <Icon name="message-square" style={{ width: 28, height: 28 }} />
                  </div>
                  <h4>No inquiries yet</h4>
                  <p>When clients submit inquiry forms for products or APIs, they will appear here in real-time.</p>
                  <Link to="/admin/enquiries" className="btn btn--outline btn--sm">
                    Open Inquiries Inbox
                  </Link>
                </div>
              ) : (
                <div className="dash-widget__list">
                  {recentEnquiries.map((e) => (
                    <Link to={`/admin/enquiries/${e._id}`} key={e._id} className="dash-widget__item">
                      <div className="dash-widget__avatar">
                        {(e.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="dash-widget__item-info">
                        <div className="dash-widget__item-title">{e.name}</div>
                        <div className="dash-widget__item-meta">
                          {e.company ? <span className="meta-company">{e.company}</span> : null}
                          {e.productName ? (
                            <span className="meta-product"> · {e.productName}</span>
                          ) : (
                            <span className="meta-type"> · {e.type || 'General'}</span>
                          )}
                        </div>
                      </div>
                      <div className="dash-widget__item-right">
                        <Badge tone={statusTone(e.status)}>{e.status}</Badge>
                        <span className="dash-widget__item-date">{formatDate(e.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Job Applications Widget */}
          <div className="dash-widget">
            <div className="dash-widget__header">
              <div className="dash-widget__title-group">
                <div className="dash-widget__badge-icon">
                  <Icon name="briefcase" style={{ width: 16, height: 16 }} />
                </div>
                <div>
                  <h3 className="dash-widget__title">Recent Candidate Applications</h3>
                  <p className="dash-widget__sub">Talent submissions for open roles</p>
                </div>
              </div>
              <Link to="/admin/applications" className="dash-widget__view-all">
                View all ({counts.totalApplications ?? 0})
              </Link>
            </div>

            <div className="dash-widget__content">
              {recentApplications.length === 0 ? (
                <div className="dash-widget__empty">
                  <div className="dash-widget__empty-icon">
                    <Icon name="users" style={{ width: 28, height: 28 }} />
                  </div>
                  <h4>No applications yet</h4>
                  <p>When candidates apply for vacancies in the careers section, submissions will display here.</p>
                  <Link to="/admin/careers" className="btn btn--outline btn--sm">
                    Manage Job Vacancies
                  </Link>
                </div>
              ) : (
                <div className="dash-widget__list">
                  {recentApplications.map((a) => (
                    <Link to={`/admin/applications/${a._id}`} key={a._id} className="dash-widget__item">
                      <div className="dash-widget__avatar">
                        {(a.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="dash-widget__item-info">
                        <div className="dash-widget__item-title">{a.name}</div>
                        <div className="dash-widget__item-meta">
                          <span className="meta-role">{a.jobId?.title || 'Open Application'}</span>
                        </div>
                      </div>
                      <div className="dash-widget__item-right">
                        <Badge tone={statusTone(a.status)}>{(a.status || '').replace('_', ' ')}</Badge>
                        <span className="dash-widget__item-date">{formatDate(a.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Management Shortcuts Bar ── */}
      <div className="dash-shortcuts-bar">
        <span className="dash-shortcuts-bar__label">Quick Shortcuts:</span>
        <div className="dash-shortcuts-bar__chips">
          <Link to="/admin/products/new" className="dash-shortcut-chip">
            <span className="dash-shortcut-chip__icon">
              <Icon name="plus" style={{ width: 12, height: 12 }} />
            </span>
            <span>Add Product</span>
          </Link>
          <Link to="/admin/categories" className="dash-shortcut-chip">
            <span className="dash-shortcut-chip__icon">
              <Icon name="layers" style={{ width: 12, height: 12 }} />
            </span>
            <span>Categories</span>
          </Link>
          <Link to="/admin/news/new" className="dash-shortcut-chip">
            <span className="dash-shortcut-chip__icon">
              <Icon name="newspaper" style={{ width: 12, height: 12 }} />
            </span>
            <span>Create Article</span>
          </Link>
          <Link to="/admin/media" className="dash-shortcut-chip">
            <span className="dash-shortcut-chip__icon">
              <Icon name="image" style={{ width: 12, height: 12 }} />
            </span>
            <span>Media Library</span>
          </Link>
          <Link to="/admin/careers/new" className="dash-shortcut-chip">
            <span className="dash-shortcut-chip__icon">
              <Icon name="briefcase" style={{ width: 12, height: 12 }} />
            </span>
            <span>Post Vacancy</span>
          </Link>
          <Link to="/admin/settings" className="dash-shortcut-chip">
            <span className="dash-shortcut-chip__icon">
              <Icon name="settings" style={{ width: 12, height: 12 }} />
            </span>
            <span>Site Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
