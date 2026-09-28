import { useState } from 'react';
import { Field } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';
import { assetUrl } from '../lib/api.js';
import { MediaPicker } from './MediaLibrary.jsx';

const toDateInput = (v) => (v ? new Date(v).toISOString().slice(0, 10) : '');

export function TagsInput({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft('');
  };
  return (
    <div className="tags-input">
      {value.map((t, i) => (
        <span key={i} className="tag">
          {t}
          <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
      />
    </div>
  );
}

export function ImageInput({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="image-picker">
      {value?.url ? <img src={assetUrl(value.url)} alt={value.alt || ''} /> : <div className="placeholder">No image</div>}
      <div style={{ display: 'grid', gap: '.4rem' }}>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => setOpen(true)}>
          {value?.url ? 'Change' : 'Select image'}
        </button>
        {value?.url && (
          <>
            <input placeholder="Alt text" value={value.alt || ''} onChange={(e) => onChange({ ...value, alt: e.target.value })} style={{ padding: '.4rem .6rem', border: '1px solid var(--line)', borderRadius: 6 }} />
            <button type="button" className="btn btn--outline btn--sm" onClick={() => onChange(null)}>
              Remove
            </button>
          </>
        )}
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(m) => onChange({ url: m.url, alt: m.alt || '', mediaId: m._id })} />
    </div>
  );
}

export function ImagesInput({ value = [], onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="image-list">
        {value.map((img, i) => (
          <div key={i}>
            <img src={assetUrl(img.url)} alt={img.alt || ''} />
            <button type="button" className="remove" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              ×
            </button>
          </div>
        ))}
        <button type="button" className="placeholder" style={{ width: 96, height: 96, border: '2px dashed var(--line)', background: 'none', borderRadius: 8 }} onClick={() => setOpen(true)}>
          + Add
        </button>
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onPick={(m) => onChange([...value, { url: m.url, alt: m.alt || '', mediaId: m._id }])} />
    </div>
  );
}

export function DocumentInput({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="image-picker">
      {value?.url ? (
        <a href={assetUrl(value.url)} target="_blank" rel="noreferrer">
          {value.title || value.url.split('/').pop()}
        </a>
      ) : (
        <span className="muted">No file</span>
      )}
      <button type="button" className="btn btn--outline btn--sm" onClick={() => setOpen(true)}>
        {value?.url ? 'Change' : 'Select file'}
      </button>
      {value?.url && (
        <button type="button" className="btn btn--outline btn--sm" onClick={() => onChange(null)}>
          Remove
        </button>
      )}
      <MediaPicker kind="document" open={open} onClose={() => setOpen(false)} onPick={(m) => onChange({ url: m.url, title: m.originalName, mediaId: m._id })} />
    </div>
  );
}

export function DocumentsInput({ value = [], onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {value.map((d, i) => (
        <div key={i} className="doc-row">
          <input value={d.title || ''} placeholder="Title" onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
          <a href={assetUrl(d.url)} target="_blank" rel="noreferrer" className="muted" style={{ fontSize: '.85rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {d.url}
          </a>
          <button type="button" className="icon-btn icon-btn--danger" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="btn btn--outline btn--sm" onClick={() => setOpen(true)}>
        + Add document
      </button>
      <MediaPicker kind="document" open={open} onClose={() => setOpen(false)} onPick={(m) => onChange([...value, { url: m.url, title: m.originalName, mediaId: m._id }])} />
    </div>
  );
}

export function SeoFields({ value = {}, onChange }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  return (
    <fieldset className="fieldset">
      <legend>SEO</legend>
      <div className="form">
        <Field label="Meta title" name="seo-title" hint={`${(value.title || '').length}/70`}>
          <input id="seo-title" maxLength={70} value={value.title || ''} onChange={set('title')} />
        </Field>
        <Field label="Meta description" name="seo-description" hint={`${(value.description || '').length}/160`}>
          <textarea id="seo-description" maxLength={160} style={{ minHeight: 70 }} value={value.description || ''} onChange={set('description')} />
        </Field>
        <Field label="Keywords" name="seo-keywords">
          <TagsInput value={value.keywords || []} onChange={(keywords) => onChange({ ...value, keywords })} />
        </Field>
        <Field label="Canonical URL" name="seo-canonical">
          <input id="seo-canonical" type="url" value={value.canonicalUrl || ''} onChange={set('canonicalUrl')} />
        </Field>
        <Field label="Open Graph image URL" name="seo-og">
          <input id="seo-og" value={value.ogImage || ''} onChange={set('ogImage')} />
        </Field>
        <label className="checkbox">
          <input type="checkbox" checked={Boolean(value.noIndex)} onChange={set('noIndex')} /> Hide from search engines (noindex)
        </label>
      </div>
    </fieldset>
  );
}

export function CategorySelect({ value, onChange, id }) {
  const { data } = useApi('/categories', { limit: 100, includeAll: true });
  return (
    <select id={id} value={value || ''} onChange={(e) => onChange(e.target.value)} required>
      <option value="">Select category…</option>
      {data?.data?.map((c) => (
        <option key={c._id} value={c._id}>
          {c.name}
          {c.status !== 'active' ? ' (inactive)' : ''}
        </option>
      ))}
    </select>
  );
}

/** Renders a single configured field. */
export function DynamicField({ field, value, onChange, error }) {
  const id = field.name;
  const common = { id, required: field.required };
  let control;
  switch (field.type) {
    case 'textarea':
      control = <textarea {...common} maxLength={field.max} value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ minHeight: 90 }} />;
      break;
    case 'richtext':
      control = <textarea {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ minHeight: 220, fontFamily: 'monospace', fontSize: '.9rem' }} placeholder="HTML or plain text. Content is sanitised before display." />;
      break;
    case 'number':
      control = <input {...common} type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))} />;
      break;
    case 'url':
      control = <input {...common} type="url" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'date':
      control = <input {...common} type="date" value={toDateInput(value)} onChange={(e) => onChange(e.target.value || null)} />;
      break;
    case 'select':
      control = (
        <select {...common} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
      break;
    case 'checkbox':
      return (
        <label className="checkbox">
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {field.label}
        </label>
      );
    case 'tags':
      control = <TagsInput value={value || []} onChange={onChange} />;
      break;
    case 'image':
      control = <ImageInput value={value} onChange={onChange} />;
      break;
    case 'images':
      control = <ImagesInput value={value || []} onChange={onChange} />;
      break;
    case 'document':
      control = <DocumentInput value={value} onChange={onChange} />;
      break;
    case 'documents':
      control = <DocumentsInput value={value || []} onChange={onChange} />;
      break;
    case 'category':
      control = <CategorySelect id={id} value={typeof value === 'object' && value ? value._id : value} onChange={onChange} />;
      break;
    case 'seo':
      return <SeoFields value={value || {}} onChange={onChange} />;
    case 'object':
      return (
        <fieldset className="fieldset">
          <legend>{field.label}</legend>
          <div className="field-row">
            {field.fields.map((f) => (
              <DynamicField key={f.name} field={f} value={value?.[f.name]} onChange={(v) => onChange({ ...(value || {}), [f.name]: v })} error={error?.[f.name]} />
            ))}
          </div>
        </fieldset>
      );
    default:
      control = <input {...common} type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <Field label={field.label} name={id} required={field.required} error={typeof error === 'string' ? error : undefined} hint={field.hint}>
      {control}
    </Field>
  );
}
