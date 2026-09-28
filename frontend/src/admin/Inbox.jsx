import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useApi, formatDate } from '../lib/hooks.js';
import { patch, del, parseError } from '../lib/api.js';
import { Loader, ErrorState, Pagination, Badge, statusTone, Alert, Icon } from '../components/ui.jsx';

/**
 * Shared list + detail drawer for inbound records (enquiries, applications).
 * `renderDetail(item)` returns <dl> rows; `columns` render list cells.
 */
export default function Inbox({ title, endpoint, statuses, columns, filters = [], renderDetail, extraActions }) {
  const [params, setParams] = useSearchParams();
  const [openId, setOpenId] = useState(null);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState(null);
  const qc = useQueryClient();
  const query = { page: params.get('page') || 1, limit: 20, search: params.get('search') || undefined, status: params.get('status') || undefined };
  filters.forEach((f) => (query[f.name] = params.get(f.name) || undefined));
  const list = useApi(endpoint, query, { staleTime: 0 });
  const detail = useApi(`${endpoint}/${openId}`, undefined, { enabled: Boolean(openId), staleTime: 0 });
  const item = detail.data?.data;

  const update = (patchObj) => {
    const next = new URLSearchParams(params);
    Object.entries(patchObj).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patchObj)) next.delete('page');
    setParams(next);
  };
  const refresh = () => {
    qc.invalidateQueries({ queryKey: [endpoint] });
    qc.invalidateQueries({ queryKey: [`${endpoint}/${openId}`] });
    qc.invalidateQueries({ queryKey: ['/admin/dashboard/stats'] });
  };
  const setStatus = async (id, status, withNotes) => {
    try {
      const res = await patch(`${endpoint}/${id}/status`, { status, ...(withNotes !== undefined && { notes: withNotes }) });
      setMsg({ type: 'success', text: res.message });
      refresh();
    } catch (e) {
      setMsg({ type: 'error', text: parseError(e).message });
    }
  };
  const remove = async (id) => {
    if (!window.confirm('Permanently delete this record? This cannot be undone (consider data-retention policy).')) return;
    try {
      await del(`${endpoint}/${id}`);
      setOpenId(null);
      refresh();
    } catch (e) {
      setMsg({ type: 'error', text: parseError(e).message });
    }
  };

  return (
    <>
      <h1 className="mb">{title}</h1>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <div className="panel">
        <div className="toolbar">
          <input type="search" placeholder="Search name, email…" defaultValue={query.search || ''} onKeyDown={(e) => e.key === 'Enter' && update({ search: e.target.value })} />
          <select value={query.status || ''} onChange={(e) => update({ status: e.target.value })} aria-label="Status">
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
          {filters.map((f) => (
            <select key={f.name} value={query[f.name] || ''} onChange={(e) => update({ [f.name]: e.target.value })} aria-label={f.label}>
              <option value="">{f.label}: all</option>
              {f.options.map((o) => (
                <option key={o.value ?? o} value={o.value ?? o}>
                  {o.label ?? o}
                </option>
              ))}
            </select>
          ))}
          <span className="spacer" />
          <span className="muted">{list.data?.meta?.total ?? 0} total</span>
        </div>
        {list.isLoading && <Loader />}
        {list.isError && <ErrorState error={list.error} />}
        {list.data && (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.label}>{c.label}</th>
                  ))}
                  <th>Status</th>
                  <th>Received</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.data.data.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 3} className="muted">
                      Nothing here.
                    </td>
                  </tr>
                )}
                {list.data.data.map((row) => (
                  <tr key={row._id} style={{ fontWeight: ['new', 'received'].includes(row.status) ? 600 : 400 }}>
                    {columns.map((c, i) => (
                      <td key={c.label}>
                        {i === 0 ? (
                          <a
                            href="#detail"
                            onClick={(e) => {
                              e.preventDefault();
                              setOpenId(row._id);
                              setNotes(row.notes || '');
                            }}
                          >
                            {c.render(row)}
                          </a>
                        ) : (
                          c.render(row)
                        )}
                      </td>
                    ))}
                    <td>
                      <Badge tone={statusTone(row.status)}>{row.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="muted">{formatDate(row.createdAt)}</td>
                    <td className="actions">
                      <select className="icon-btn" value={row.status} onChange={(e) => setStatus(row._id, e.target.value)} aria-label="Change status">
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={list.data?.meta} onChange={(p) => update({ page: p })} />
      </div>

      {openId && (
        <div className="modal-backdrop" onClick={() => setOpenId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal__head">
              <h3 style={{ margin: 0 }}>{item?.name || 'Details'}</h3>
              <button type="button" className="icon-btn" onClick={() => setOpenId(null)} aria-label="Close">
                <Icon name="close" />
              </button>
            </div>
            {detail.isLoading && <Loader />}
            {detail.isError && <ErrorState error={detail.error} />}
            {item && (
              <>
                <dl className="detail-grid">
                  {renderDetail(item)}
                  <dt>Received</dt>
                  <dd>{formatDate(item.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</dd>
                  <dt>Status</dt>
                  <dd>
                    <Badge tone={statusTone(item.status)}>{item.status.replace('_', ' ')}</Badge>
                  </dd>
                </dl>
                <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '1rem 0' }} />
                <div className="form">
                  <label className="field">
                    <span style={{ fontWeight: 600 }}>Internal notes</span>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ minHeight: 80 }} />
                  </label>
                  <div className="toolbar" style={{ marginBottom: 0 }}>
                    <select className="icon-btn" value={item.status} onChange={(e) => setStatus(item._id, e.target.value, notes)} aria-label="Status">
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn btn--primary btn--sm" onClick={() => setStatus(item._id, item.status, notes)}>
                      Save notes
                    </button>
                    {extraActions?.(item)}
                    <span className="spacer" />
                    <button type="button" className="btn btn--danger btn--sm" onClick={() => remove(item._id)}>
                      Delete
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
