import { useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useApi, formatDate } from '../lib/hooks.js';
import { post, put, patch, del, parseError } from '../lib/api.js';
import { Loader, ErrorState, Alert, Badge, statusTone, Field } from '../components/ui.jsx';
import { DynamicField, ImageInput, SeoFields } from './fields.jsx';

const SECTION_TYPES = ['hero', 'richText', 'stats', 'features', 'values', 'imageText', 'timeline', 'faq', 'cta'];
const ITEM_TYPES = ['stats', 'features', 'values', 'timeline', 'faq'];
const ICONS = ['flask', 'shield', 'factory', 'file', 'globe', 'check'];

function PageList() {
  const { data, isLoading, isError, error } = useApi('/admin/pages', undefined, { staleTime: 0 });
  const qc = useQueryClient();
  const [msg, setMsg] = useState(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ['/admin/pages'] });

  const setStatus = async (p, status) => {
    try {
      await patch(`/admin/pages/${p._id}/publish`, { status });
      refresh();
    } catch (e) {
      setMsg(parseError(e).message);
    }
  };
  const remove = async (p) => {
    if (!window.confirm(`Delete page "${p.title}"?`)) return;
    try {
      await del(`/admin/pages/${p._id}`);
      refresh();
    } catch (e) {
      setMsg(parseError(e).message);
    }
  };

  return (
    <>
      <div className="admin__top">
        <h1>Pages</h1>
        <Link to="/admin/pages/new" className="btn btn--primary btn--sm">
          + New page
        </Link>
      </div>
      {msg && <Alert type="error">{msg}</Alert>}
      <div className="panel">
        {isLoading && <Loader />}
        {isError && <ErrorState error={error} />}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>URL</th>
              <th>Type</th>
              <th>Status</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((p) => (
              <tr key={p._id}>
                <td>
                  <Link to={`/admin/pages/${p._id}`}>{p.title}</Link>
                </td>
                <td className="muted">/{['privacy-policy', 'terms'].includes(p.slug) ? p.slug : p.slug === 'home' ? '' : ['about', 'quality'].includes(p.slug) ? p.slug : `pages/${p.slug}`}</td>
                <td>{p.pageType}</td>
                <td>
                  <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                </td>
                <td className="muted">{formatDate(p.updatedAt)}</td>
                <td className="actions">
                  <Link to={`/admin/pages/${p._id}`} className="icon-btn">
                    Edit
                  </Link>
                  <select className="icon-btn" value={p.status} onChange={(e) => setStatus(p, e.target.value)} aria-label="Status">
                    {['draft', 'published', 'archived'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  {p.pageType !== 'system' && (
                    <button className="icon-btn icon-btn--danger" onClick={() => remove(p)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SectionEditor({ section, onChange, onRemove, onMove, index, total }) {
  const set = (k) => (v) => onChange({ ...section, [k]: v });
  const items = section.items || [];
  const setItem = (i, k, v) => set('items')(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const hasItems = ITEM_TYPES.includes(section.type);

  return (
    <fieldset className="fieldset">
      <legend>
        #{index + 1} · {section.type}
      </legend>
      <div className="toolbar">
        <select value={section.type} onChange={(e) => set('type')(e.target.value)} aria-label="Section type">
          {SECTION_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <input placeholder="Key (optional id)" value={section.key || ''} onChange={(e) => set('key')(e.target.value)} />
        <span className="spacer" />
        <button type="button" className="icon-btn" disabled={index === 0} onClick={() => onMove(-1)}>
          ↑
        </button>
        <button type="button" className="icon-btn" disabled={index === total - 1} onClick={() => onMove(1)}>
          ↓
        </button>
        <button type="button" className="icon-btn icon-btn--danger" onClick={onRemove}>
          Remove
        </button>
      </div>
      <div className="form">
        <div className="field-row">
          <DynamicField field={{ name: `title-${index}`, type: 'text', label: 'Title' }} value={section.title} onChange={set('title')} />
          <DynamicField field={{ name: `subtitle-${index}`, type: 'text', label: 'Subtitle' }} value={section.subtitle} onChange={set('subtitle')} />
        </div>
        {['richText', 'imageText', 'hero', 'cta', 'values', 'features'].includes(section.type) && (
          <DynamicField field={{ name: `content-${index}`, type: 'richtext', label: 'Content (HTML)' }} value={section.content} onChange={set('content')} />
        )}
        {['hero', 'imageText'].includes(section.type) && (
          <Field label="Image" name={`image-${index}`}>
            <ImageInput value={section.image} onChange={set('image')} />
          </Field>
        )}
        {['hero', 'cta', 'imageText'].includes(section.type) && (
          <div className="field-row">
            <DynamicField field={{ name: `cta-label-${index}`, type: 'text', label: 'Button label' }} value={section.cta?.label} onChange={(v) => set('cta')({ ...(section.cta || {}), label: v })} />
            <DynamicField field={{ name: `cta-url-${index}`, type: 'text', label: 'Button URL' }} value={section.cta?.url} onChange={(v) => set('cta')({ ...(section.cta || {}), url: v })} />
          </div>
        )}
        {hasItems && (
          <div>
            <strong>Items</strong>
            {items.map((it, i) => (
              <div key={i} className="fieldset" style={{ marginTop: '.5rem' }}>
                <div className="field-row">
                  <DynamicField field={{ name: `it-title-${index}-${i}`, type: 'text', label: section.type === 'faq' ? 'Question' : section.type === 'timeline' ? 'Year / milestone' : 'Title' }} value={it.title} onChange={(v) => setItem(i, 'title', v)} />
                  {section.type === 'stats' || section.type === 'timeline' ? (
                    <DynamicField field={{ name: `it-value-${index}-${i}`, type: 'text', label: section.type === 'stats' ? 'Value (e.g. 25+)' : 'Label' }} value={it.value} onChange={(v) => setItem(i, 'value', v)} />
                  ) : (
                    <DynamicField field={{ name: `it-icon-${index}-${i}`, type: 'select', label: 'Icon', options: ICONS }} value={it.icon} onChange={(v) => setItem(i, 'icon', v)} />
                  )}
                </div>
                <DynamicField field={{ name: `it-desc-${index}-${i}`, type: 'textarea', label: section.type === 'faq' ? 'Answer' : 'Description' }} value={it.description} onChange={(v) => setItem(i, 'description', v)} />
                <div className="field-row">
                  <DynamicField field={{ name: `it-link-${index}-${i}`, type: 'text', label: 'Link (optional)' }} value={it.link} onChange={(v) => setItem(i, 'link', v)} />
                  <div style={{ alignSelf: 'end' }}>
                    <button type="button" className="icon-btn icon-btn--danger" onClick={() => set('items')(items.filter((_, j) => j !== i))}>
                      Remove item
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn--outline btn--sm" style={{ marginTop: '.5rem' }} onClick={() => set('items')([...items, {}])}>
              + Add item
            </button>
          </div>
        )}
      </div>
    </fieldset>
  );
}

function PageForm() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const existing = useApi(`/admin/pages/${id}`, undefined, { enabled: !isNew, staleTime: 0 });
  const [values, setValues] = useState({ title: '', slug: '', pageType: 'custom', sections: [], seo: {}, status: 'draft' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({});

  useEffect(() => {
    if (existing.data?.data) setValues(existing.data.data);
  }, [existing.data]);

  const set = (k) => (v) => setValues((s) => ({ ...s, [k]: v }));
  const sections = values.sections || [];
  const setSections = set('sections');

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ busy: true });
    setErrors({});
    const payload = {
      title: values.title,
      pageType: values.pageType,
      featuredImage: values.featuredImage?.url ? values.featuredImage : undefined,
      sections: sections.map((s, i) => ({ ...s, sortOrder: i, image: s.image?.url ? s.image : undefined, items: s.items?.map((it) => ({ ...it, image: it.image?.url ? it.image : undefined })) })),
      seo: values.seo,
      status: values.status,
    };
    if (values.pageType !== 'system' && values.slug) payload.slug = values.slug;
    try {
      const res = isNew ? await post('/admin/pages', payload) : await put(`/admin/pages/${id}`, payload);
      qc.invalidateQueries({ queryKey: ['/admin/pages'] });
      qc.invalidateQueries({ queryKey: [`/pages/${res.data.slug}`] });
      setStatus({ msg: res.message, type: 'success' });
      if (isNew) navigate(`/admin/pages/${res.data._id}`, { replace: true });
      else setValues(res.data);
    } catch (err) {
      const p = parseError(err);
      setErrors(p.errors);
      setStatus({ msg: p.message + (Object.keys(p.errors).length ? ` — ${Object.entries(p.errors).map(([k, v]) => `${k}: ${v}`).join('; ')}` : ''), type: 'error' });
    }
  };

  if (!isNew && existing.isLoading) return <Loader />;
  if (!isNew && existing.isError) return <ErrorState error={existing.error} />;

  return (
    <form onSubmit={submit}>
      <div className="admin__top">
        <div>
          <Link to="/admin/pages" className="muted" style={{ fontSize: '.85rem' }}>
            ← Pages
          </Link>
          <h1>
            {isNew ? 'New page' : values.title} {values.status && <Badge tone={statusTone(values.status)}>{values.status}</Badge>}
          </h1>
        </div>
        <button className="btn btn--primary btn--sm" disabled={status.busy}>
          Save page
        </button>
      </div>
      {status.msg && <Alert type={status.type}>{status.msg}</Alert>}
      <div className="form-layout">
        <div className="panel form">
          <div className="field-row">
            <Field label="Title" name="title" required error={errors.title}>
              <input id="title" value={values.title} onChange={(e) => set('title')(e.target.value)} required />
            </Field>
            <Field label="Slug" name="slug" error={errors.slug} hint={values.pageType === 'system' ? 'System page slugs are fixed' : 'Public URL: /pages/<slug>'}>
              <input id="slug" value={values.slug || ''} onChange={(e) => set('slug')(e.target.value)} disabled={values.pageType === 'system'} />
            </Field>
          </div>
          <h3>Sections</h3>
          {sections.map((s, i) => (
            <SectionEditor
              key={i}
              index={i}
              total={sections.length}
              section={s}
              onChange={(ns) => setSections(sections.map((x, j) => (j === i ? ns : x)))}
              onRemove={() => setSections(sections.filter((_, j) => j !== i))}
              onMove={(d) => {
                const next = [...sections];
                [next[i], next[i + d]] = [next[i + d], next[i]];
                setSections(next);
              }}
            />
          ))}
          <div>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => setSections([...sections, { type: 'richText', title: '', content: '' }])}>
              + Add section
            </button>
          </div>
        </div>
        <div className="form-side">
          <div className="panel form">
            <h3 style={{ margin: 0 }}>Publishing</h3>
            <Field label="Status" name="status">
              <select id="status" value={values.status} onChange={(e) => set('status')(e.target.value)}>
                {['draft', 'published', 'archived'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Featured image" name="featuredImage">
              <ImageInput value={values.featuredImage} onChange={set('featuredImage')} />
            </Field>
          </div>
          <div className="panel">
            <SeoFields value={values.seo || {}} onChange={set('seo')} />
          </div>
        </div>
      </div>
    </form>
  );
}

export default function Pages() {
  return (
    <Routes>
      <Route index element={<PageList />} />
      <Route path=":id" element={<PageForm />} />
    </Routes>
  );
}
