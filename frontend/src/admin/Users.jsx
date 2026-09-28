import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApi, formatDate } from '../lib/hooks.js';
import { post, put, del, parseError } from '../lib/api.js';
import { Loader, ErrorState, Alert, Field, Badge } from '../components/ui.jsx';
import { useAuth } from '../lib/auth.jsx';

const ROLES = ['superadmin', 'admin', 'editor'];
const blank = { name: '', email: '', password: '', role: 'editor' };

export default function Users() {
  const { user: me } = useAuth();
  const { data, isLoading, isError, error } = useApi('/admin/users', undefined, { staleTime: 0 });
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ['/admin/users'] });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editing) delete payload.email;
      const res = editing ? await put(`/admin/users/${editing}`, payload) : await post('/admin/users', payload);
      setMsg({ type: 'success', text: res.message });
      setForm(blank);
      setEditing(null);
      refresh();
    } catch (err) {
      const p = parseError(err);
      setErrors(p.errors);
      setMsg({ type: 'error', text: p.message });
    }
  };

  const toggleActive = async (u) => {
    try {
      await put(`/admin/users/${u._id}`, { isActive: !u.isActive });
      refresh();
    } catch (err) {
      setMsg({ type: 'error', text: parseError(err).message });
    }
  };
  const remove = async (u) => {
    if (!window.confirm(`Delete user ${u.email}?`)) return;
    try {
      await del(`/admin/users/${u._id}`);
      refresh();
    } catch (err) {
      setMsg({ type: 'error', text: parseError(err).message });
    }
  };

  return (
    <>
      <h1 className="mb">Admin users</h1>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <div className="two-col" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <div className="panel">
          {isLoading && <Loader />}
          {isError && <ErrorState error={error} />}
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Active</th>
                <th>Last login</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <Badge tone="info">{u.role}</Badge>
                  </td>
                  <td>{u.isActive ? 'Yes' : 'No'}</td>
                  <td className="muted">{u.lastLoginAt ? formatDate(u.lastLoginAt) : '—'}</td>
                  <td className="actions">
                    <button
                      className="icon-btn"
                      onClick={() => {
                        setEditing(u._id);
                        setForm({ name: u.name, email: u.email, password: '', role: u.role });
                      }}
                    >
                      Edit
                    </button>
                    {u._id !== me._id && (
                      <>
                        <button className="icon-btn" onClick={() => toggleActive(u)}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className="icon-btn icon-btn--danger" onClick={() => remove(u)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form className="panel form" onSubmit={submit}>
          <h3>{editing ? 'Edit user' : 'Create user'}</h3>
          <Field label="Name" name="name" required error={errors.name}>
            <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Email" name="email" required error={errors.email}>
            <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={Boolean(editing)} />
          </Field>
          <Field label="Role" name="role" required error={errors.role}>
            <select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label={editing ? 'New password (leave blank to keep)' : 'Password'} name="password" required={!editing} error={errors.password} hint="Min 10 chars, 1 uppercase, 1 number">
            <input id="password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
          </Field>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button className="btn btn--primary btn--sm">{editing ? 'Update' : 'Create'}</button>
            {editing && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => {
                  setEditing(null);
                  setForm(blank);
                }}
              >
                Cancel
              </button>
            )}
          </div>
          <p className="muted" style={{ fontSize: '.85rem', margin: 0 }}>
            <strong>superadmin</strong>: everything incl. users · <strong>admin</strong>: content, enquiries, applications, settings · <strong>editor</strong>: content & media only.
          </p>
        </form>
      </div>
    </>
  );
}
