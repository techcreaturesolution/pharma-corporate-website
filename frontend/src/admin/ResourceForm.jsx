import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { RESOURCES } from './resources.js';
import { useApi } from '../lib/hooks.js';
import { post, put, parseError } from '../lib/api.js';
import { Loader, ErrorState, Alert, Badge, statusTone } from '../components/ui.jsx';
import { DynamicField } from './fields.jsx';

const SIDE_FIELDS = ['status', 'featured', 'sortOrder', 'publishedAt', 'closingDate'];

/** Strip server-managed keys and normalise empty values before sending. */
const toPayload = (values, fields) => {
  const out = {};
  for (const f of fields) {
    let v = values[f.name];
    if (v === undefined) continue;
    if (f.type === 'category' && v && typeof v === 'object') v = v._id;
    if (f.type === 'image' || f.type === 'document') v = v?.url ? v : null;
    if (f.type === 'number' && (v === '' || v === null)) continue;
    if (v === null && !['image', 'document', 'date'].includes(f.type)) continue;
    if (v === '' && f.name === 'slug') continue;
    out[f.name] = v;
  }
  return out;
};

export default function ResourceForm({ resourceKey }) {
  const cfg = RESOURCES[resourceKey];
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const existing = useApi(`${cfg.endpoint}/${id}`, { includeAll: true }, { enabled: !isNew, staleTime: 0 });
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ busy: false, msg: null, type: null });

  useEffect(() => {
    if (existing.data?.data) setValues(existing.data.data);
  }, [existing.data]);

  const submit = async (e, next) => {
    e.preventDefault();
    setStatus({ busy: true });
    setErrors({});
    try {
      const payload = toPayload(values, cfg.fields);
      const res = isNew ? await post(cfg.endpoint, payload) : await put(`${cfg.endpoint}/${id}`, payload);
      qc.invalidateQueries({ queryKey: [cfg.endpoint] });
      setStatus({ busy: false, msg: res.message, type: 'success' });
      if (next === 'list') navigate(`/admin/${resourceKey}`);
      else if (isNew) navigate(`/admin/${resourceKey}/${res.data._id}`, { replace: true });
      else setValues(res.data);
    } catch (err) {
      const p = parseError(err);
      setErrors(p.errors);
      setStatus({ busy: false, msg: p.message, type: 'error' });
    }
  };

  if (!isNew && existing.isLoading) return <Loader />;
  if (!isNew && existing.isError) return <ErrorState error={existing.error} />;

  const main = cfg.fields.filter((f) => !SIDE_FIELDS.includes(f.name) && f.type !== 'seo');
  const side = cfg.fields.filter((f) => SIDE_FIELDS.includes(f.name));
  const seo = cfg.fields.find((f) => f.type === 'seo');
  const set = (name) => (v) => setValues((s) => ({ ...s, [name]: v }));

  return (
    <form onSubmit={(e) => submit(e)}>
      <div className="admin__top">
        <div>
          <Link to={`/admin/${resourceKey}`} className="muted" style={{ fontSize: '.85rem' }}>
            ← {cfg.label}
          </Link>
          <h1>
            {isNew ? `New ${cfg.singular.toLowerCase()}` : values.name || values.title || cfg.singular} {!isNew && values.status && <Badge tone={statusTone(values.status)}>{values.status}</Badge>}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button type="submit" className="btn btn--outline btn--sm" disabled={status.busy}>
            Save
          </button>
          <button type="button" className="btn btn--primary btn--sm" disabled={status.busy} onClick={(e) => submit(e, 'list')}>
            Save & close
          </button>
        </div>
      </div>
      {status.msg && <Alert type={status.type}>{status.msg}</Alert>}
      <div className="form-layout">
        <div className="panel form">
          {main.map((f) => (
            <DynamicField key={f.name} field={f} value={values[f.name]} onChange={set(f.name)} error={errors[f.name]} />
          ))}
        </div>
        <div className="form-side">
          <div className="panel form">
            <h3 style={{ margin: 0 }}>Publishing</h3>
            {side.map((f) => (
              <DynamicField key={f.name} field={f} value={values[f.name]} onChange={set(f.name)} error={errors[f.name]} />
            ))}
            {!isNew && values.slug && (
              <p className="muted" style={{ fontSize: '.85rem', margin: 0 }}>
                Public URL: <code>/{resourceKey === 'careers' ? 'careers' : resourceKey === 'categories' ? 'products?category=' : `${resourceKey}/`}{values.slug}</code>
              </p>
            )}
          </div>
          {seo && (
            <div className="panel">
              <DynamicField field={seo} value={values.seo} onChange={set('seo')} error={errors.seo} />
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
