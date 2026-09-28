import { Link, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { RESOURCES, getPath } from './resources.js';
import { useApi, formatDate } from '../lib/hooks.js';
import { patch, del, parseError, assetUrl } from '../lib/api.js';
import { Loader, ErrorState, Pagination, Badge, statusTone, Alert } from '../components/ui.jsx';

export default function ResourceList({ resourceKey }) {
  const cfg = RESOURCES[resourceKey];
  const [params, setParams] = useSearchParams();
  const [msg, setMsg] = useState(null);
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
    if (col.type === 'bool') return v ? 'Yes' : '—';
    if (col.type === 'date') return v ? formatDate(v) : '—';
    if (col.type === 'image') return v?.url ? <img className="thumb" src={assetUrl(v.url)} alt="" /> : '—';
    return v ?? '—';
  };

  return (
    <>
      <div className="admin__top">
        <h1>{cfg.label}</h1>
        <Link to={`/admin/${resourceKey}/new`} className="btn btn--primary btn--sm">
          + New {cfg.singular.toLowerCase()}
        </Link>
      </div>
      {msg && <Alert type="error">{msg}</Alert>}
      <div className="panel">
        <div className="toolbar">
          <input type="search" placeholder="Search…" defaultValue={query.search || ''} onKeyDown={(e) => e.key === 'Enter' && update({ search: e.target.value })} />
          <select value={query.status || ''} onChange={(e) => update({ status: e.target.value })} aria-label="Status filter">
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="spacer" />
          <span className="muted">{data?.meta?.total ?? 0} total</span>
        </div>
        {isLoading && <Loader />}
        {isError && <ErrorState error={error} />}
        {data && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {cfg.columns.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.data.length === 0 && (
                  <tr>
                    <td colSpan={cfg.columns.length + 1} className="muted">
                      No records found.
                    </td>
                  </tr>
                )}
                {data.data.map((item) => (
                  <tr key={item._id}>
                    {cfg.columns.map((c, i) => (
                      <td key={c.key}>{i === 0 ? <Link to={`/admin/${resourceKey}/${item._id}`}>{cell(item, c)}</Link> : cell(item, c)}</td>
                    ))}
                    <td className="actions">
                      <Link to={`/admin/${resourceKey}/${item._id}`} className="icon-btn">
                        Edit
                      </Link>
                      <select className="icon-btn" value={item.status} onChange={(e) => setStatus(item, e.target.value)} aria-label="Change status">
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button className="icon-btn icon-btn--danger" onClick={() => remove(item)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={data?.meta} onChange={(p) => update({ page: p })} />
      </div>
    </>
  );
}
