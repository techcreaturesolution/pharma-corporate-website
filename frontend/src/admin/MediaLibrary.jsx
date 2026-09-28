import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '../lib/hooks.js';
import { post, patch, del, parseError, assetUrl } from '../lib/api.js';
import { Loader, ErrorState, Pagination, Alert, Icon } from '../components/ui.jsx';

const FOLDERS = ['products', 'categories', 'gallery', 'news', 'certificates', 'facilities', 'leadership', 'pages', 'documents', 'misc'];

/**
 * Media browser + uploader. Used standalone (/admin/media) and inside MediaPicker.
 * `onSelect(media)` enables picker mode.
 */
export function MediaBrowser({ onSelect, kind, selectedUrl }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [uploadFolder, setUploadFolder] = useState('misc');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();
  const qc = useQueryClient();
  const query = { page, limit: 40, search: search || undefined, folder: folder || undefined, kind };
  const { data, isLoading, isError, error } = useApi('/admin/media', query, { staleTime: 0 });

  const refresh = () => qc.invalidateQueries({ queryKey: ['/admin/media'] });

  const upload = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    [...files].slice(0, 5).forEach((f) => fd.append('files', f));
    fd.append('folder', uploadFolder);
    try {
      const res = await post('/admin/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg({ type: 'success', text: res.message });
      refresh();
      if (onSelect && !Array.isArray(res.data)) onSelect(res.data);
    } catch (e) {
      setMsg({ type: 'error', text: parseError(e).message });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete "${m.originalName}"? References to this file in content will break.`)) return;
    try {
      await del(`/admin/media/${m._id}`);
      refresh();
    } catch (e) {
      setMsg({ type: 'error', text: parseError(e).message });
    }
  };

  const editAlt = async (m) => {
    const alt = window.prompt('Alt text (for accessibility & SEO)', m.alt || '');
    if (alt === null) return;
    await patch(`/admin/media/${m._id}`, { alt });
    refresh();
  };

  return (
    <div>
      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
      >
        <p style={{ margin: '0 0 .5rem' }}>Drag & drop files here, or</p>
        <div className="toolbar" style={{ justifyContent: 'center', marginBottom: 0 }}>
          <select value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)} aria-label="Upload folder">
            {FOLDERS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
          <input ref={fileRef} type="file" multiple accept={kind === 'image' ? 'image/*' : 'image/*,.pdf,.doc,.docx'} onChange={(e) => upload(e.target.files)} disabled={busy} />
        </div>
        <small className="muted">Images (JPG, PNG, WebP, SVG) and documents (PDF, DOC, DOCX). Max 5 files, 10 MB each.</small>
      </div>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <div className="toolbar">
        <input type="search" placeholder="Search by file name" value={search} onChange={(e) => (setSearch(e.target.value), setPage(1))} />
        <select value={folder} onChange={(e) => (setFolder(e.target.value), setPage(1))} aria-label="Folder">
          <option value="">All folders</option>
          {FOLDERS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        <span className="spacer" />
        <span className="muted">{data?.meta?.total ?? 0} files</span>
      </div>
      {isLoading && <Loader />}
      {isError && <ErrorState error={error} />}
      <div className="media-grid">
        {data?.data?.map((m) => (
          <figure key={m._id} className={selectedUrl === m.url ? 'selected' : ''} onClick={() => onSelect?.(m)} title={m.originalName}>
            {m.kind === 'image' ? <img src={assetUrl(m.url)} alt={m.alt || ''} loading="lazy" /> : <div className="doc">{m.originalName}</div>}
            <figcaption>{m.originalName}</figcaption>
            {!onSelect && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '.2rem .3rem .4rem' }}>
                <button type="button" className="icon-btn" onClick={() => editAlt(m)} title="Edit alt text">
                  Alt
                </button>
                <a className="icon-btn" href={assetUrl(m.url)} target="_blank" rel="noreferrer" title="Open">
                  <Icon name="download" />
                </a>
                <button type="button" className="icon-btn icon-btn--danger" onClick={() => remove(m)} title="Delete">
                  <Icon name="close" />
                </button>
              </div>
            )}
          </figure>
        ))}
      </div>
      <Pagination meta={data?.meta} onChange={setPage} />
    </div>
  );
}

export default function MediaLibrary() {
  return (
    <>
      <h1 className="mb">Media library</h1>
      <div className="panel">
        <MediaBrowser />
      </div>
    </>
  );
}

/** Modal wrapper to pick a media item. */
export function MediaPicker({ open, onClose, onPick, kind = 'image' }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Select media">
        <div className="modal__head">
          <h3 style={{ margin: 0 }}>Select {kind === 'image' ? 'an image' : 'a file'}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <MediaBrowser
          kind={kind}
          onSelect={(m) => {
            onPick(m);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
