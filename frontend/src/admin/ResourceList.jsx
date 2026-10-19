import { Link, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { RESOURCES, getPath } from './resources.js';
import { useApi, formatDate } from '../lib/hooks.js';
import { patch, del, parseError, assetUrl } from '../lib/api.js';
import { Loader, ErrorState, Pagination, Badge, statusTone, Alert, Icon } from '../components/ui.jsx';

export default function ResourceList({ resourceKey }) {
  const cfg = RESOURCES[resourceKey];
  const [params, setParams] = useSearchParams();
  const [msg, setMsg] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [searchVal, setSearchVal] = useState(params.get('search') || '');
  const qc = useQueryClient();
  const query = { page: params.get('page') || 1, limit: 20, includeAll: true, search: params.get('search') || undefined, status: params.get('status') || undefined };
  const { data, isLoading, isError, error } = useApi(cfg.endpoint, query, { staleTime: 0 });
  const statuses = cfg.statuses || ['draft', 'published', 'archived'];

  const update = (patchObj) => {
    const next = new URLSearchParams(params);
    Object.entries(patchObj).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patchObj)) next.delete('page');
    setParams(next);
  };
  const refresh = () => qc.invalidateQueries({ queryKey: [cfg.endpoint] });

  const setStatus = async (item, status) => {
    try {
      await patch(`${cfg.endpoint}/${item._id}/status`, { status });
      refresh();
    } catch (e) {
      setMsg(parseError(e).message);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Permanently delete "${item[cfg.slugField || 'name'] || item.title || item.name}"? Consider archiving instead.`)) return;
    try {
      await del(`${cfg.endpoint}/${item._id}`);
      refresh();
    } catch (e) {
      setMsg(parseError(e).message);
    }
  };

  const cell = (item, col) => {
    const v = getPath(item, col.key);
    if (col.type === 'status') return <Badge tone={statusTone(v)}>{v}</Badge>;
    if (col.type === 'bool') {
      return v ? (
        <span className="admin-table__featured-chip">
          <Icon name="star" style={{ width: 11, height: 11 }} />
          <span>Yes</span>
        </span>
      ) : (
        <span className="admin-table__muted-dash">—</span>
      );
    }
    if (col.type === 'date') return v ? formatDate(v) : <span className="admin-table__muted-dash">—</span>;
    if (col.type === 'image') return v?.url ? <img className="thumb" src={assetUrl(v.url)} alt="" /> : <span className="admin-table__muted-dash">—</span>;
    if (col.key === 'productCode' || col.key === 'casNumber' || col.key === 'code' || col.key === 'slug') {
      return v ? <span className="admin-table__code-pill">{v}</span> : <span className="admin-table__muted-dash">—</span>;
    }
    return v ?? <span className="admin-table__muted-dash">—</span>;
  };

  return (
    <>
      {/* Top Header with Title, Count, List/Grid Switcher, and + New Button */}
      <div className="admin__top">
        <div className="admin__top-title">
          <h1>{cfg.label}</h1>
          <span className="admin__top-count">{data?.meta?.total ?? 0} total</span>
        </div>

        <div className="admin__top-actions">
          {/* List or Grid View Switcher */}
          <div className="admin__view-switch" role="group" aria-label="View mode">
            <button
              type="button"
              className={`admin__view-btn ${viewMode === 'list' ? 'admin__view-btn--active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Table list view"
            >
              <Icon name="layout" style={{ width: 15, height: 15 }} />
              <span>List</span>
            </button>
            <button
              type="button"
              className={`admin__view-btn ${viewMode === 'grid' ? 'admin__view-btn--active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card grid view"
            >
              <Icon name="grid" style={{ width: 15, height: 15 }} />
              <span>Grid</span>
            </button>
          </div>

          {/* + New Button styled with #20BF55 and plus icon */}
          <Link to={`/admin/${resourceKey}/new`} className="admin__add-btn">
            <Icon name="plus" style={{ width: 16, height: 16 }} />
            <span>New {cfg.singular.toLowerCase()}</span>
          </Link>
        </div>
      </div>

      {msg && <Alert type="error">{msg}</Alert>}

      <div className="panel">
        {/* Modern Filter Toolbar */}
        <div className="toolbar">
          <div className="admin-search-wrap">
            <Icon name="search" className="admin-search-icon" style={{ width: 15, height: 15 }} />
            <input
              type="search"
              placeholder="Search products, code, CAS…"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && update({ search: searchVal })}
              onBlur={() => searchVal !== (query.search || '') && update({ search: searchVal })}
              className="admin-search-input"
            />
          </div>

          <select
            value={query.status || ''}
            onChange={(e) => update({ status: e.target.value })}
            aria-label="Status filter"
            className="admin-filter-select"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <span className="spacer" />
          <div className="admin-toolbar-count">
            Showing <strong>{data?.data?.length ?? 0}</strong> of <strong>{data?.meta?.total ?? 0}</strong>
          </div>
        </div>

        {isLoading && <Loader />}
        {isError && <ErrorState error={error} />}

        {data && (
          <>
            {/* ── LIST (TABLE) VIEW ── */}
            {viewMode === 'list' && (
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {cfg.columns.map((c) => (
                        <th key={c.key}>{c.label}</th>
                      ))}
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.length === 0 && (
                      <tr>
                        <td colSpan={cfg.columns.length + 1} className="admin-table__empty-cell">
                          <Icon name="box" style={{ width: 32, height: 32, opacity: 0.4 }} />
                          <p>No records found.</p>
                        </td>
                      </tr>
                    )}
                    {data.data.map((item) => (
                      <tr key={item._id}>
                        {cfg.columns.map((c, i) => (
                          <td key={c.key}>
                            {i === 0 ? (
                              <Link to={`/admin/${resourceKey}/${item._id}`} className="admin-table__title-link">
                                {item.image?.url && (
                                  <img src={assetUrl(item.image.url)} alt="" className="admin-table__row-thumb" />
                                )}
                                <span className="admin-table__title-text">{cell(item, c)}</span>
                              </Link>
                            ) : (
                              cell(item, c)
                            )}
                          </td>
                        ))}
                        <td className="actions">
                          <div className="admin-table__actions-group">
                            <Link to={`/admin/${resourceKey}/${item._id}`} className="admin-action-btn admin-action-btn--edit">
                              <Icon name="file" style={{ width: 13, height: 13 }} />
                              <span>Edit</span>
                            </Link>
                            <div className="admin-table__status-select-wrap">
                              <select
                                className="admin-action-select"
                                value={item.status}
                                onChange={(e) => setStatus(item, e.target.value)}
                                aria-label="Change status"
                              >
                                {statuses.map((s) => (
                                  <option key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              type="button"
                              className="admin-action-btn admin-action-btn--delete"
                              onClick={() => remove(item)}
                              title="Delete record"
                            >
                              <Icon name="trash" style={{ width: 13, height: 13 }} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── GRID (CARD) VIEW ── */}
            {viewMode === 'grid' && (
              <div className="admin-product-grid">
                {data.data.length === 0 && (
                  <div className="muted" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
                    No products found.
                  </div>
                )}
                {data.data.map((item) => (
                  <div key={item._id} className="admin-product-card">
                    {/* Media Image / Fallback */}
                    <div className="admin-product-card__media">
                      {item.image?.url ? (
                        <img
                          src={assetUrl(item.image.url)}
                          alt={item.image.alt || item.name}
                          className="admin-product-card__img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="admin-product-card__placeholder">
                          <Icon name="box" style={{ width: 44, height: 44, opacity: 0.6 }} />
                        </div>
                      )}
                      <div className="admin-product-card__badges">
                        <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                        {item.featured && (
                          <span className="admin-product-card__featured" title="Featured on home page">
                            <Icon name="star" style={{ width: 12, height: 12 }} /> Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="admin-product-card__body">
                      {item.category?.name && (
                        <span className="admin-product-card__category">{item.category.name}</span>
                      )}
                      <h3 className="admin-product-card__title">
                        <Link to={`/admin/${resourceKey}/${item._id}`}>{item.name}</Link>
                      </h3>

                      {/* Code and CAS pills */}
                      <div className="admin-product-card__meta">
                        {item.productCode && (
                          <div className="admin-product-card__meta-item">
                            <span className="meta-label">Code:</span>
                            <span className="meta-val">{item.productCode}</span>
                          </div>
                        )}
                        {item.casNumber && (
                          <div className="admin-product-card__meta-item">
                            <span className="meta-label">CAS:</span>
                            <span className="meta-val">{item.casNumber}</span>
                          </div>
                        )}
                      </div>

                      {item.shortDescription && (
                        <p className="admin-product-card__desc">{item.shortDescription}</p>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="admin-product-card__footer">
                      <select
                        className="admin-product-card__status-select"
                        value={item.status}
                        onChange={(e) => setStatus(item, e.target.value)}
                        aria-label="Change status"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>

                      <div className="admin-product-card__action-btns">
                        <Link
                          to={`/admin/${resourceKey}/${item._id}`}
                          className="icon-btn"
                          title="Edit product"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => remove(item)}
                          title="Delete product"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <Pagination meta={data?.meta} onChange={(p) => update({ page: p })} />
      </div>
    </>
  );
}
