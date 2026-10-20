import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useApi, formatDate } from '../lib/hooks.js';
import { patch, del, parseError } from '../lib/api.js';
import { Loader, ErrorState, Pagination, Alert, Icon } from '../components/ui.jsx';

/**
 * Shared executive list + detail drawer for inbound records (enquiries, applications).
 * `renderDetail(item)` returns detail content; `columns` render list cells.
 */
export default function Inbox({
  title,
  subtitle,
  endpoint,
  statuses,
  columns,
  filters = [],
  renderDetail,
  extraActions,
}) {
  const [params, setParams] = useSearchParams();
  const [openId, setOpenId] = useState(null);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState(null);
  const [searchVal, setSearchVal] = useState(params.get('search') || '');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const qc = useQueryClient();
  const query = {
    page: params.get('page') || 1,
    limit: 20,
    search: params.get('search') || undefined,
    status: params.get('status') || undefined,
  };
  filters.forEach((f) => (query[f.name] = params.get(f.name) || undefined));

  // Sync input value if URL search param changes externally
  useEffect(() => {
    setSearchVal(params.get('search') || '');
  }, [params]);

  const list = useApi(endpoint, query, { staleTime: 0 });
  const detail = useApi(`${endpoint}/${openId}`, undefined, { enabled: Boolean(openId), staleTime: 0 });
  const item = detail.data?.data;

  const update = (patchObj) => {
    const next = new URLSearchParams(params);
    Object.entries(patchObj).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patchObj)) next.delete('page');
    setParams(next);
  };

  const refresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      qc.invalidateQueries({ queryKey: [endpoint] }),
      qc.invalidateQueries({ queryKey: [`${endpoint}/${openId}`] }),
      qc.invalidateQueries({ queryKey: ['/admin/dashboard/stats'] }),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const setStatus = async (id, status, withNotes) => {
    try {
      const res = await patch(`${endpoint}/${id}/status`, {
        status,
        ...(withNotes !== undefined && { notes: withNotes }),
      });
      setMsg({ type: 'success', text: res.message });
      refresh();
    } catch (e) {
      setMsg({ type: 'error', text: parseError(e).message });
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Permanently delete this record? This cannot be undone.')) return;
    try {
      await del(`${endpoint}/${id}`);
      setOpenId(null);
      refresh();
    } catch (e) {
      setMsg({ type: 'error', text: parseError(e).message });
    }
  };

  const hasActiveFilters = Boolean(
    query.search || query.status || filters.some((f) => query[f.name])
  );

  const hasNewItems = list.data?.data?.some((r) => ['new', 'received'].includes(r.status));

  return (
    <>
      {/* ── Top Header Section ── */}
      <div className="admin__top">
        <div className="admin__top-title">
          <div>
            <div className="inbox-header-row">
              <h1 className="inbox-main-heading">{title}</h1>
              <span className="admin__top-count">
                {list.data?.meta?.total ?? 0} total
              </span>
              {hasNewItems && (
                <span className="inbox-new-pill">
                  <span className="inbox-pulse-dot" />
                  <span>New Inbound</span>
                </span>
              )}
            </div>
            {subtitle && <p className="inbox-header-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="admin__top-actions">
          <button
            type="button"
            className="inbox-refresh-btn"
            onClick={refresh}
            title="Refresh records"
          >
            <Icon
              name="refresh"
              style={{
                width: 15,
                height: 15,
                transform: isRefreshing ? 'rotate(360deg)' : 'none',
                transition: 'transform 0.5s ease',
              }}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {msg && (
        <Alert type={msg.type}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{msg.text}</span>
            <button
              type="button"
              onClick={() => setMsg(null)}
              style={{ background: 'none', border: 0, cursor: 'pointer', color: 'inherit' }}
            >
              <Icon name="close" style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </Alert>
      )}

      {/* ── Status Quick-Filter Tabs ── */}
      <div className="inbox-status-tabs" role="tablist" aria-label="Filter by status">
        <button
          type="button"
          role="tab"
          aria-selected={!query.status}
          className={`inbox-status-tab ${!query.status ? 'inbox-status-tab--active' : ''}`}
          onClick={() => update({ status: '' })}
        >
          <span>All</span>
          <span className="inbox-tab-badge">{list.data?.meta?.total ?? 0}</span>
        </button>
        {statuses.map((s) => {
          const isActive = query.status === s;
          return (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`inbox-status-tab inbox-status-tab--${s} ${isActive ? 'inbox-status-tab--active' : ''}`}
              onClick={() => update({ status: s })}
            >
              <span>{s.replace('_', ' ')}</span>
            </button>
          );
        })}
      </div>

      {/* ── Main Panel (Toolbar & Table) ── */}
      <div className="panel inbox-panel">
        <div className="inbox-toolbar">
          {/* Search Box */}
          <div className="inbox-search-wrap">
            <Icon name="search" className="admin-search-icon" style={{ width: 16, height: 16 }} />
            <input
              type="search"
              placeholder={`Search ${title.toLowerCase()} by name, email, company…`}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && update({ search: searchVal })}
              onBlur={() => searchVal !== (query.search || '') && update({ search: searchVal })}
              className="admin-search-input inbox-search-input"
            />
            {searchVal && (
              <button
                type="button"
                className="inbox-search-clear"
                onClick={() => {
                  setSearchVal('');
                  update({ search: '' });
                }}
                aria-label="Clear search"
                title="Clear search"
              >
                <Icon name="close" style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="inbox-filters-group">
            <div className="inbox-select-wrap">
              <select
                value={query.status || ''}
                onChange={(e) => update({ status: e.target.value })}
                aria-label="Status filter"
                className="admin-filter-select inbox-filter-select"
              >
                <option value="">Status: All</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {filters.map((f) => (
              <div key={f.name} className="inbox-select-wrap">
                <select
                  value={query[f.name] || ''}
                  onChange={(e) => update({ [f.name]: e.target.value })}
                  aria-label={f.label}
                  className="admin-filter-select inbox-filter-select"
                >
                  <option value="">{f.label}: All</option>
                  {f.options.map((o) => (
                    <option key={o.value ?? o} value={o.value ?? o}>
                      {o.label ?? (typeof o === 'string' ? o.charAt(0).toUpperCase() + o.slice(1) : o)}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {hasActiveFilters && (
              <button
                type="button"
                className="inbox-reset-btn"
                onClick={() => {
                  const next = new URLSearchParams();
                  setParams(next);
                  setSearchVal('');
                }}
                title="Reset all search filters"
              >
                <Icon name="close" style={{ width: 12, height: 12 }} />
                <span>Reset</span>
              </button>
            )}
          </div>

          <span className="spacer" />

          {/* Items Counter Pill */}
          <div className="admin-toolbar-count inbox-count-pill">
            Showing <strong>{list.data?.data?.length ?? 0}</strong> of <strong>{list.data?.meta?.total ?? 0}</strong>
          </div>
        </div>

        {list.isLoading && <Loader />}
        {list.isError && <ErrorState error={list.error} />}

        {list.data && (
          <div className="inbox-table-wrap">
            <table className="inbox-table admin-table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.label}>{c.label}</th>
                  ))}
                  <th>Status</th>
                  <th>Received</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.data.data.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 3} className="inbox-empty-cell">
                      <div className="inbox-empty-card">
                        <div className="inbox-empty-icon-wrap">
                          <Icon name="message-square" style={{ width: 38, height: 38 }} />
                        </div>
                        <h3 className="inbox-empty-title">
                          {hasActiveFilters ? 'No matching enquiries found' : 'No enquiries yet'}
                        </h3>
                        <p className="inbox-empty-desc">
                          {hasActiveFilters
                            ? "We couldn't find any inquiries matching your current search or filter criteria. Try adjusting keywords or resetting filters."
                            : 'When clients, healthcare professionals, or distributors submit inquiries through the website, they will appear here.'}
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            className="inbox-clear-filters-btn"
                            onClick={() => {
                              const next = new URLSearchParams();
                              setParams(next);
                              setSearchVal('');
                            }}
                          >
                            <Icon name="refresh" style={{ width: 14, height: 14 }} />
                            <span>Clear all filters</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  list.data.data.map((row) => {
                    const isNew = ['new', 'received'].includes(row.status);
                    return (
                      <tr key={row._id} className={isNew ? 'is-new' : ''}>
                        {columns.map((c, i) => (
                          <td key={c.label}>
                            {i === 0 ? (
                              <div
                                className="inbox-row-trigger"
                                onClick={() => {
                                  setOpenId(row._id);
                                  setNotes(row.notes || '');
                                }}
                                role="button"
                                tabIndex={0}
                                title="Click to view full inquiry details"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setOpenId(row._id);
                                    setNotes(row.notes || '');
                                  }
                                }}
                              >
                                {c.render(row)}
                              </div>
                            ) : (
                              c.render(row)
                            )}
                          </td>
                        ))}
                        <td>
                          <span className={`inbox-status-pill inbox-status-pill--${row.status}`}>
                            <span className="inbox-status-dot" />
                            <span>{row.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td>
                          <div className="inbox-date-cell">
                            <Icon name="clock" style={{ width: 13, height: 13, opacity: 0.6 }} />
                            <span>{formatDate(row.createdAt)}</span>
                          </div>
                        </td>
                        <td className="actions" style={{ textAlign: 'right' }}>
                          <div className="inbox-actions-group">
                            <button
                              type="button"
                              className="inbox-view-btn"
                              onClick={() => {
                                setOpenId(row._id);
                                setNotes(row.notes || '');
                              }}
                              title="View full enquiry details"
                            >
                              <Icon name="file" style={{ width: 14, height: 14 }} />
                              <span>View</span>
                            </button>
                            <select
                              className="inbox-status-select"
                              value={row.status}
                              onChange={(e) => setStatus(row._id, e.target.value)}
                              aria-label="Change status"
                              title="Update status"
                            >
                              {statuses.map((s) => (
                                <option key={s} value={s}>
                                  {s.replace('_', ' ')}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="inbox-del-btn"
                              onClick={() => remove(row._id)}
                              title="Permanently delete record"
                              aria-label="Delete record"
                            >
                              <Icon name="trash" style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={list.data?.meta} onChange={(p) => update({ page: p })} />
      </div>

      {/* ── Detail Drawer Modal ── */}
      {openId && (
        <div className="modal-backdrop inbox-modal-backdrop" onClick={() => setOpenId(null)}>
          <div className="modal inbox-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="inbox-modal__head">
              <div className="inbox-modal__head-left">
                <div className="inbox-modal__avatar">
                  {item?.name
                    ? item.name
                        .trim()
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : <Icon name="mail" style={{ width: 22, height: 22 }} />}
                </div>
                <div>
                  <h3 className="inbox-modal__title">{item?.name || 'Inquiry Details'}</h3>
                  <div className="inbox-modal__meta">
                    {item?.createdAt && (
                      <span className="inbox-modal__date">
                        <Icon name="clock" style={{ width: 12, height: 12 }} />
                        {formatDate(item.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    )}
                    {item?.status && (
                      <span className={`inbox-status-pill inbox-status-pill--${item.status}`}>
                        <span className="inbox-status-dot" />
                        <span>{item.status.replace('_', ' ')}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="inbox-modal__close-btn"
                onClick={() => setOpenId(null)}
                aria-label="Close dialog"
                title="Close"
              >
                <Icon name="close" style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {detail.isLoading && <Loader />}
            {detail.isError && <ErrorState error={detail.error} />}

            {item && (
              <>
                <div className="inbox-modal-body">
                  {renderDetail(item)}
                </div>

                {/* Internal Notes & Follow-up Actions Card */}
                <div className="inbox-notes-section">
                  <h4 className="inbox-detail-card__title" style={{ marginBottom: '0.65rem' }}>
                    <Icon name="file" style={{ width: 14, height: 14 }} />
                    <span>Internal Staff Notes & Follow-up</span>
                  </h4>
                  <textarea
                    className="inbox-notes-textarea"
                    placeholder="Add private team notes, price quotes discussed, or callback status..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="inbox-modal-actions">
                    <div className="inbox-select-wrap">
                      <select
                        className="inbox-status-select"
                        value={item.status}
                        onChange={(e) => setStatus(item._id, e.target.value, notes)}
                        aria-label="Change status"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            Status: {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      onClick={() => setStatus(item._id, item.status, notes)}
                    >
                      Save notes
                    </button>
                    {extraActions?.(item)}
                    <span className="spacer" />
                    <button
                      type="button"
                      className="btn btn--danger btn--sm"
                      onClick={() => remove(item._id)}
                    >
                      Delete record
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

